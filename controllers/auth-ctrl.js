const user = require('../models/users-modle');
const bcrypt = require('bcryptjs');
const userTokenMap = require('../userTokenMap');


module.exports = {
    //register a user
    register: async (req,res) => {
      if (await user.exists({ username: req.body.username })) {
        return res.status(400).send({ message: "username already exists" });
      }
      //bcrypt the password
      bcrypt.hash(req.body.password,10,async (err,hashPassword)=>{
            if(err) return res.status(403).send({message: err.message });
            req.body.password = hashPassword;
            await user.create(req.body)
            .then(result => res.status(200).send({message:"User as been added successfully",result}))
            .catch(err => res.status(500).send({message:"error",err}))
        })
    },
    //login as a user
    login: async (req, res) => {
      if (!await user.exists({ username: req.body.username })){
          return res.status(400).send({ message: "User does not exist" });
        }
        const { username, password } = req.body;
        await user
          .findOne({ username })
          .then((userItem) =>
            bcrypt.compare(password, userItem.password, (err, isMatch) => { //get the real password value
              if (err)
                return res.status(400).send({ message: "Error, please try again" });
              if (!isMatch)
                return res.status(403).send({ message: "Invalid credentials" });
              res.status(200).send({ message: "logged in successfully" });
              //request from app have token value for firebase token
              if (req.body.hasOwnProperty('token')) {
                userTokenMap[req.body.username] = req.body.token;
              }
            })
          )
          .catch((err) => {
            res.status(500).send({ message: "Error logging in user" });
          });
      },
      
}