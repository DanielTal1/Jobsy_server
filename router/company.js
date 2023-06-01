const express = require('express')
const router = express.Router()
const controllers = require('../controllers/company-ctrl')

//GET 
router.get('/',controllers.getAllCompanies)

//GET BY Name 
router.get('/:id',controllers.getCompanyByName)


// //PUT BY ID
router.put('/:id' , controllers.putMethod)

// //DELETE BY ID
router.delete('/:id' , controllers.deleteMethod)

module.exports = router;