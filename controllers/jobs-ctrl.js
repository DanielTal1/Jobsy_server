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


async function getDescriptionGoogle(companyName) {
  try {
    const params = {
      query: companyName,
      limit: 1,
      indent: true,
      key: API_KEY, // Add the API key here
      // Other optional parameters can be added here as well
    };

    const response = await axios.get('https://kgsearch.googleapis.com/v1/entities:search', { params });
    const itemListElement = response.data.itemListElement;

    if (itemListElement && itemListElement.length > 0) {
      const entity = response.data.itemListElement[0].result;
      let shorterDescription = entity.description;


      if (entity.detailedDescription && entity.detailedDescription.articleBody) {
        const companyDescription = entity.detailedDescription.articleBody;

        if (shorterDescription === undefined) {
          return "";
        }

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

function normalizeDate(){
  const currentDate = new Date();

    // Get the day, month, and year components
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // January is 0
    const year = currentDate.getFullYear().toString().slice(-2);

    // Format the date as "dd/mm/yyyy"
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}


function pushNotification(currentUser){
  const registrationToken = userTokenMap[currentUser];
  if (registrationToken === undefined) {
    return;
  }
  const message = {
    token: registrationToken,
    notification: {
      title: 'Hello from Server',
      body: 'This is a test message from your Node.js server.',
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


const checkURL = async (url) => {
  try {
    await axios.get(url);
    return true;
  } catch (error) {
    return false;
  }
};



module.exports = {
  getAllJobs: async (req, res) => { 
    await Job.find()
      .then((job) => res.status(200).json(job))
      .catch((err) => res.status(500).json(err));
  },

  getJobsById: async (req, res) => {
    await Job.findById(req.params.id)
      .then((job) => res.status(200).json(job))
      .catch((err) => res.status(500).json(err));
  },


  getJobsByUsername: async (req, res) => {
    try {
      const jobs = await Job.find({ username: req.params.id, archive: false })
        .sort({ pin: -1, last_updated: -1 })
        .exec();
  
      res.status(200).json(jobs);
    } catch (err) {
      res.status(500).json(err);
    }
  },


  
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
  


  updateJob : async (req, res) => {
    const jobId = req.params.id;

    const newStage = req.body.stage;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }


    // Update the updatedAt field with the formatted date
    job.updatedAt =normalizeDate();
    job.last_updated=Date.now();
    // Update the stage
    job.stage = newStage;
    await job.save();

    return res.status(200).json({ message: 'Job updated successfully', job });
  },
  







  addJob: async (req, res) => {
    try {
      currentUser=User.findOne({username:req.body.username});
      let companyLogo="";
      const companyName=req.body.company
      let currentCompany = await Company.findOne({ name: companyName });
      if (currentCompany) {
        console.log('found company');
        companyLogo=currentCompany.logo
      } else {
        console.log('created company');
        let companyDecription=await getDescriptionGoogle(companyName);
        if(companyDecription===undefined){
          companyDecription=""
        }
        console.log(companyDecription)
        var NameToDomain = clearbit.NameToDomain;
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
          
            // Use the updated value of companyLogo here
            console.log(companyLogo);
          }
          currentCompany=await Company.create({ name: companyName,logo:companyLogo,description:companyDecription})
      }  
      let newJob = await Job.findOne({ company:companyName,role:req.body.role,location:req.body.location,username:req.body.username });
      if (newJob) {
        console.log('found job');
      } else {
        console.log('created job');
        let job_url;
        if(!req.body.hasOwnProperty('url')){
          job_url="";
        }
        else{
          job_url=req.body.url;
        }
        newJob = await Job.create({company:companyName,role:req.body.role,url:job_url,location:req.body.location,stage:'apply',username:req.body.username,company_logo:companyLogo,updatedAt:normalizeDate(),last_updated:Date.now(),created_at:Date.now() });
        let newRecommendation = await Recommendation.findOne({ company:companyName,role:req.body.role,location:req.body.location });
        if(newRecommendation){
          console.log('found Recommendation');
        } else {
          console.log('created Recommendation');
          newRecommendation= await Recommendation.create({company:companyName,role:req.body.role,url:job_url,location:req.body.location,company_logo:companyLogo})
        }
        await currentUser.updateOne({ $push:{ recommendationId: newRecommendation._id }});
      }
      res.status(200).json({ message: "Job added successfully", newJob });
      if(!req.body.hasOwnProperty('source')){
        pushNotification(req.body.username);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },






  deleteJobs: async (req, res) => {
    try {
      const jobIds = req.body; 
  
      // Delete the jobs with the specified IDs
      await Job.deleteMany({ _id: { $in: jobIds } });
  
      res.status(200).json({ message: 'Jobs deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete jobs' });
    }
  },


  
  updatePins: async (req, res) => {
    try {
      const jobIds = req.body; 
      const jobs = await Job.find({ _id: { $in: jobIds } });
  
      // Update the pins for each job
      for (const job of jobs) {
        job.pin = !job.pin; // Toggle the pin attribute
        await job.save(); // Save the updated job
      }
      await currentUser.updateOne({ $push:{ recommendationId: newRecommendation._id }});
      res.status(200).json({ message: 'Pins updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update pins' });
    }
  },



  updateArchive : async (req, res) => {
    try {
      const jobIds = req.body;
  
      // Find the jobs with the specified IDs
      const jobs = await Job.find({ _id: { $in: jobIds } });
  
      // Update the archive status for each job
      for (const job of jobs) {
        job.archive = !job.archive;
        job.last_updated=Date.now();
        await job.save(); // Save the updated job
      }

      res.status(200).json({ message: 'Archive status updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update archive status' });
    }
  },



};
