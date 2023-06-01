const Job = require("../models/jobs-modle");
const User = require("../models/users-modle");
const Company=require("../models/company-modle");
const  clearbit = require('clearbit')('sk_c4c073d1241ed2e335e71345969606db');
const Recommendation=require("../models/recommendation-modle");
const axios = require('axios');

const API_KEY = 'AIzaSyAwB8J7qsIdIFTW2Aoh_4jFM0VCLbMFARY';

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
    Job.find({ username: req.params.id })
    .sort({ last_updated: -1 }) // Sort by last_updated in descending order
    .then((jobs) => res.status(200).json(jobs))
    .catch((err) => res.status(500).json(err));
  },


  updateJob : async (req, res) => {
    const jobId = req.params.id;

    const newStage = req.body.stage;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    job.updatedAt=new Date().toISOString().slice(0, 10);
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
        companyDecription=await getDescriptionGoogle(companyName);
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
          currentCompany=await Company.create({ name: companyName,logo:companyLogo,description:companyDecription})
      }  
      let newJob = await Job.findOne({ company:companyName,role:req.body.role,location:req.body.location,username:req.body.username });
      if (newJob) {
        console.log('found job');
      } else {
        console.log('created job');
        newJob = await Job.create({company:companyName,role:req.body.role,url:req.body.url,location:req.body.location,stage:'apply',username:req.body.username,company_logo:companyLogo,updatedAt:new Date().toISOString().slice(0, 10)});
        let newRecommendation = await Recommendation.findOne({ company:companyName,role:req.body.role,location:req.body.location });
        if(newRecommendation){
          console.log('found Recommendation');
        } else {
          console.log('created Recommendation');
          newRecommendation= await Recommendation.create({company:companyName,role:req.body.role,url:req.body.url,location:req.body.location,company_logo:companyLogo})
        }
        await currentUser.updateOne({ $push:{ recommendationId: newRecommendation._id }});
      }
      res.status(200).json({ message: "Job added successfully", newJob });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },



  deleteJob: async (req, res) => {
    try {
      const jobById = await Job.findById(req.params.id);
    if (jobById._id.toString() == req.params.id) {
        await jobById.deleteOne();
        res.status(200).json({ message: "The job as been deleted" });
      } else {
        res.status(403).json({ message: "you can delete only your job" });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
