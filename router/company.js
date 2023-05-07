const express = require('express')
const router = express.Router()
const controllers = require('../controllers/company-ctrl')

//GET 
router.get('/',controllers.getAllCompanies)

//GET BY ID 
router.get('/:id',controllers.getCompanyById)


// //PUT BY ID
router.put('/:id' , controllers.putMethod)

// //DELETE BY ID
router.delete('/:id' , controllers.deleteMethod)

module.exports = router;