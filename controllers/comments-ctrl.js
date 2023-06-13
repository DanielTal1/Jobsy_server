const Comments = require("../models/comments-modle");
const Company=require("../models/company-modle");
const User = require("../models/users-modle");


module.exports = {
  getAllComments: async (req, res) => { 
    await Comments.find()
      .then((comment) => res.status(200).json(comment))
      .catch((err) => res.status(500).json(err));
  },

  getCommentsByCompanyName: async (req, res) => {
    const companyExists = await Company.exists({ name: req.params.id });
    if (!companyExists) {
      return res.status(500).json({ message: 'Company does not exist' });
    }
    Comments.find({ company: req.params.id })
      .sort({ updatedAt: -1 }) // Sort by updatedAt in descending order
      .then((comments) => res.status(200).json(comments.reverse()))
      .catch((err) => res.status(500).json(err));
  },
  

  addComment: async (req, res) => {
    // Check if the company exists in the Company table
    const companyExists = await Company.exists({ name: req.body.company });

    // Check if the user exists in the Users table
    const userExists = await User.exists({ username:req.body.username });

    if (!companyExists || !userExists) {
      return res.status(500).json({ message: 'Company or user does not exist' });
    }


    Comments.create(req.body)
      .then(() => res.status(200).send("successfull"))
      .catch((err) => res.status(404).send({ massage: err }));
  },
  


  
};
