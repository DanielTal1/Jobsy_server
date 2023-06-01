const Comments = require("../models/comments-modle");




module.exports = {
  getAllComments: async (req, res) => { 
    await Comments.find()
      .then((comment) => res.status(200).json(comment))
      .catch((err) => res.status(500).json(err));
  },
  getCommentsByCompanyName: async (req, res) => {
    Comments.find({company:req.params.id})
      .then((comment) => res.status(200).json(comment))
      .catch((err) => res.status(500).json(err));
  },

  addComment: async (req, res) => {
    Comments.create(req.body)
      .then(() => res.status(200).send("successfull"))
      .catch((err) => res.status(404).send({ massage: err }));
  },
  


  
};