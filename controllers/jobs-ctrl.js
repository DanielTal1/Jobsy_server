const Job = require("../models/jobs-modle");
const User = require("../models/users-modle");
const Company=require("../models/company-modle");
const  clearbit = require('clearbit')('sk_c4c073d1241ed2e335e71345969606db');
const Recommendation=require("../models/recommendation-modle");
const axios = require('axios');
const admin = require('firebase-admin');
const https = require('https');
const API_KEY = 'AIzaSyAwB8J7qsIdIFTW2Aoh_4jFM0VCLbMFARY';
const userTokenMap = require('../userTokenMap');

//Function to get the description of a company using Google Knowledge Graph API
async function getDescriptionGoogle(companyName) {
  try {
    //set up the parameters for the API request
    const params = {
      query: companyName,
      limit: 1,
      indent: true,
      key: API_KEY, 
    };

    const response = await axios.get('https://kgsearch.googleapis.com/v1/entities:search', { params });
    const itemListElement = response.data.itemListElement;
    //checking if api return result
    if (itemListElement && itemListElement.length > 0) {
      const entity = response.data.itemListElement[0].result;
      let shorterDescription = entity.description;
      
      //checking if there is detailedDescription in result
      if (entity.detailedDescription && entity.detailedDescription.articleBody) {
        const companyDescription = entity.detailedDescription.articleBody;

        if (shorterDescription === undefined) {
          return "";
        }
        //checking for values inside shortDescription
        if (
          shorterDescription.includes('ompany') ||
          shorterDescription.includes('echnology') ||
          shorterDescription.includes('rganization') ||
          shorterDescription.includes('ecurity') ||
          shorterDescription.includes('inance') ||
          shorterDescription.includes('orporation')
        ) {
          return companyDescription;
        } else {
          return "";
        }
      } else {
        return "";
      }
    } else {
      return "";
    }
  } catch (error) {
    console.error(error);
    return "";
  }
}

//normalize the date to "dd/mm/yyyy" format
function normalizeDate(){
  const currentDate = new Date();

    //get the day, month, and year components
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; //starts from 0
    const year = currentDate.getFullYear().toString().slice(-2);

    //format the date as "dd/mm/yyyy"
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}

//function to push a notification to a user using firebase cloud messaging
function pushNotification(currentUser){
  const registrationToken = userTokenMap[currentUser];
  if (registrationToken === undefined) {
    return;
  }
  const message = {
    token: registrationToken,
    notification: {
      title: 'Jobsy: new Application',
      body: 'New Job added in Jobsy chrome Extension',
    },
  };

  admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
    

}

//Function to increment the recommendation count for a job
async function addRecommendationCount (jobId) {
  const currentJob = await Job.findById(jobId);
  if (!currentJob) {
    console.log('Job not found');
    return;
  }
  const currentUsername = currentJob.username;
  currentUser=User.findOne({username:currentUsername});
  if(!currentUser){
    console.log('User not found');
    return;
  }
  const currentCompany=currentJob.company;
  const currentRole=currentJob.role;
  const currentLocation=currentJob.location;
  const currentRecommendation = await Recommendation.findOne({ company:currentCompany,role:currentRole,location:currentLocation });
  if(!currentRecommendation){
    console.log('Recommendation not found');
    return;
  }
  //increase the value of jobId by 1
  await currentUser.findOneAndUpdate(
    { },
    { $inc: { [`recommendationId.${currentRecommendation._id}`]: 1 } },
    { upsert: true }
  );


}


//function to check if a url is accessible
const checkURL = async (url) => {
  try {
    await axios.get(url);
    return true;
  } catch (error) {
    return false;
  }
};



module.exports = {
  //retrieve all jobs
  getAllJobs: async (req, res) => { 
    await Job.find()
      .then((job) => res.status(200).json(job))
      .catch((err) => res.status(500).json(err));
  },
  //retrieve job by id
  getJobsById: async (req, res) => {
    await Job.findById(req.params.id)
      .then((job) => res.status(200).json(job))
      .catch((err) => res.status(500).json(err));
  },

  //retrieves all the jobs of a user with username- only non archive
  getJobsByUsername: async (req, res) => {
    try {
      const jobs = await Job.find({ username: req.params.id, archive: false })
        .sort({ pin: -1, last_updated: -1 })//jobs with pin are first, the order is by last updated date
        .exec();
      res.status(200).json(jobs);
    } catch (err) {
      res.status(500).json(err);
    }
  },


  //retrieves all the archive jobs of a user with username
  getArchiveJobsByUsername: async (req, res) => {
    try {
      const jobs = await Job.find({ username: req.params.id, archive: true })
        .sort({ pin: -1, last_updated: -1 })
        .exec();
  
      res.status(200).json(jobs);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  

  //update job stage and change the last_updated and nextInterview values
  //everytime updating a stage the recommendation count is increased
  updateJob: async (req, res) => {
    const jobId = req.params.id;
    const newStage = req.body.stage;
    const job = await Job.findById(jobId);
  
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
  
    // Update the updatedAt field with the formatted date
    job.updatedAt = normalizeDate();
    job.last_updated = Date.now();
    await addRecommendationCount(jobId);
    const nextInterview = new Date(req.body.next_interview);
    nextInterview.setHours(8, 0, 0); //set the time to 08:00 for convenience
    //nextInterview.setDate(nextInterview.getDate());
    job.next_interview = nextInterview;
    // Update the stage
    job.stage = newStage;
    await job.save(); //save the changes in job
    return res.status(200).json({ message: 'Job updated successfully', job });
  },
  
  






   //add a new job
  addJob: async (req, res) => {
    try {
      //find user
      currentUser=User.findOne({username:req.body.username});
      let companyLogo="";
      var companyName=req.body.company
      var words = companyName.split(" ");
      for (var i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
      }
      var companyName = words.join(" ");
      let currentCompany = await Company.findOne({ name: companyName });
      //find the currentCompany or create it
      if (currentCompany) {
        console.log('found company');
        companyLogo=currentCompany.logo
      } else {
        console.log('created company');
        //get description and logo
        let companyDecription=await getDescriptionGoogle(companyName);
        if(companyDecription===undefined){
          companyDecription=""
        }
        console.log(companyDecription)
        const NameToDomain = clearbit.NameToDomain;
        await NameToDomain.find({name: companyName})
          .then(function (result) {
            companyLogo=result.logo
            console.log(companyLogo)
          })
          .catch(NameToDomain.NotFoundError, function (err) {
            console.log(err); // Domain could not be found
          })
          .catch(function (err) {
            console.log('Bad/invalid request, unauthorized, Clearbit error, or failed request');
          });
          if(companyLogo===null){
            companyLogo=""
          }
          else{
            try {
              const isAccessible = await checkURL(companyLogo);
              if (isAccessible) {
                console.log('URL is accessible');
              } else {
                console.log('URL not accessible');
                companyLogo = "";
              }
            } catch (error) {
              console.log('Error occurred while checking URL:', error);
              companyLogo = "";
            }
            console.log(companyLogo);
          }
          currentCompany=await Company.create({ name: companyName,logo:companyLogo,description:companyDecription})
      }  
      //find the job for the current user or create it
      var role=req.body.role;
      var words = role.split(" ");
      for (var i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
      }
      var role = words.join(" ");
      var location=req.body.location;
      var words = location.split(" ");
      for (var i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
      }
      var location = words.join(" ");
      let newJob = await Job.findOne({ company:companyName,role:role,location:location,username:req.body.username }); 
      if (newJob) {
        console.log('found job');
        res.status(400).json({ message: "Job already exists", newJob });
        return;
      } else {
        console.log('created job');
        let job_url;
        if(!req.body.hasOwnProperty('url')){
          job_url="";
        }
        else{
          job_url=req.body.url;
        }
        newJob = await Job.create({company:companyName,role:role,url:job_url,location:location,stage:'apply',username:req.body.username,company_logo:companyLogo,updatedAt:normalizeDate(),last_updated:Date.now(),created_at:Date.now(),next_interview:Date.now() });
        //find the current recommendation or create it 
        let newRecommendation = await Recommendation.findOne({ company:companyName,role:role,location:location });
        if(newRecommendation){
          console.log('found Recommendation');
        } else {
          console.log('created Recommendation');
          newRecommendation= await Recommendation.create({company:companyName,role:role,url:job_url,location:location,company_logo:companyLogo})
        }
        await currentUser.findOneAndUpdate(
          { },
          { $inc: { [`recommendationId.${newRecommendation._id}`]: 1 } },
          { upsert: true }
        );
        res.status(200).json({ message: "Job added successfully", newJob });
      }
      //adding job from chrome extension doesn't have source property, adding from app have source property
      if(!req.body.hasOwnProperty('source')){
        pushNotification(req.body.username);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },





  //delete list of job given their id's
  deleteJobs: async (req, res) => {
    try {
      const jobIds = req.body; 
      //delete the jobs with the specified IDs
      await Job.deleteMany({ _id: { $in: jobIds } });
      res.status(200).json({ message: 'Jobs deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete jobs' });
    }
  },


  //update list of jobs pin given their id's
  updatePins: async (req, res) => {
    try {
      const jobIds = req.body; 
      const jobs = await Job.find({ _id: { $in: jobIds } });
  
      //update the pins for each job
      for (const job of jobs) {
        job.pin = !job.pin; //toggle the pin attribute
        await job.save(); //save the updated job
      }

      res.status(200).json({ message: 'Pins updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update pins' });
    }
  },


  //update list of jobs archive property given their id's
  updateArchive : async (req, res) => {
    try {
      const jobIds = req.body;
  
      //find the jobs with the specified IDs
      const jobs = await Job.find({ _id: { $in: jobIds } });
  
      //update the archive status for each job
      for (const job of jobs) {
        job.archive = !job.archive;
        job.last_updated=Date.now(); //update last_updated value
        await job.save(); //save the updated job
      }

      res.status(200).json({ message: 'Archive status updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update archive status' });
    }
  },



};
