const Job = require("../models/jobs-modle");
const User = require("../models/users-modle");
const Company=require("../models/company-modle");
const  clearbit = require('clearbit')('sk_c4c073d1241ed2e335e71345969606db');
const Recommendation=require("../models/recommendation-modle");


const API_KEY = 'AIzaSyAwB8J7qsIdIFTW2Aoh_4jFM0VCLbMFARY';


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
    Job.find({username:req.params.id})
      .then((job) => res.status(200).json(job))
      .catch((err) => res.status(500).json(err));
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
        let companyDecription="";
        // const params = {
        //   query: companyName,
        //   limit: 1,
        //   indent: true,
        //   key: API_KEY, // Add the API key here
        //   // Other optional parameters can be added here as well
        // };
        // await axios.get('https://kgsearch.googleapis.com/v1/entities:search', { params })
        // .then((res) => {
        //   const itemListElement = res.data.itemListElement;
        //   if (itemListElement && itemListElement.length > 0) {
        //     const entity = res.data.itemListElement[0].result;
        //     let shorter_decription = entity.description;
        //     if (entity.detailedDescription && entity.detailedDescription.articleBody) {
        //       companyDecription = entity.detailedDescription.articleBody;
        //       companyLogo = entity.image && entity.image.contentUrl;
        //       if(companyLogo== undefined){
        //         companyLogo=""
        //       }
        //     } else {
        //       shorter_decription=""
        //     }
        //     if (!shorter_decription.includes('ompany') && !shorter_decription.includes('echnology')&&!shorter_decription.includes('organization')&&
        //     !shorter_decription.includes('security')&&!shorter_decription.includes('finance')&&shorter_description.includes('orporation') ) {
        //         companyDecription="";
        //         companyLogo=""
        //     }
        //     console.log(`Description: ${shorter_decription}`);
        //     console.log(`Description: ${companyDecription}`);
        //     console.log(`Image URL: ${companyLogo}`);
        //   }
        //   else{
        //     console.log(`No results found for query`);
        //   }

        // })

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
  updateJob: async (req, res) => {
    const jobById = await Job.findById(req.params.id);
    try {
      if (jobById.userId === req.body.userId) {
        await Job.updateOne({ $set: req.body });
        res.status(200).json({ message: "The Job as been updated" });
      } else {
        res.status(403).json({ message: "you can update only your Job" });
      }
    } catch (err) {
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
