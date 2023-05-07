const Comapny = require("../models/company-modle")

const getAllCompanies =async (req, res) => {
    await Comapny.find()
    .then((result) => res.send(result))
    .catch((err) => res.status(404).send({ massage: err }));
};


const getCompanyById = async (req, res) => {
    Comapny.findById(req.params.id)
    .then((result) => res.send(result))
    .catch((err) => res.status(404).send({ massage: err }));
};




const putMethod = (req, res) => {
    Comapny.findByIdAndUpdate(req.params.id, req.body)
    .then((result) => res.send(result))
    .catch((err) => res.status(404).send({ massage: err }));
};

const deleteMethod = (req, res) => {
    Comapny.findByIdAndDelete(req.params.id, req.body).then((result) =>
    res.status(200).json({ message: 'user with id has deleted '})).catch(err => res.status(500).json(err));
};

module.exports = {
    getAllCompanies,
    getCompanyById,
  putMethod,
  deleteMethod
};
