const User = require("../models/users-modle");

const getAllUsers = (req, res) => {
  User.find()
    .then((result) => res.send(result))
    .catch((err) => res.status(404).send({ massage: err }));
};

const getUserById = (req, res) => {
  User.findById(req.params.id)
    .then((result) => res.send(result))
    .catch((err) => res.status(404).send({ massage: err }));
};
const postUserMethod = (req, res) => {
  User.create(req.body)
    .then((result) => res.send(result))
    .catch((err) => res.status(404).send({ massage: err }));
};


const putMethod = (req, res) => {
  User.findByIdAndUpdate(req.params.id, req.body)
    .then((result) => res.send(result))
    .catch((err) => res.status(404).send({ massage: err }));
};

const deleteMethod = (req, res) => {
  User.findByIdAndDelete(req.params.id, req.body).then((result) =>
    res.status(200).json({ message: 'user with id has deleted '})).catch(err => res.status(500).json(err));
};

module.exports = {
  getAllUsers,
  getUserById,
  postUserMethod,
  putMethod,
  deleteMethod,
};
