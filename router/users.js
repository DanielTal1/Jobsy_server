const express = require('express')
const router = express.Router()
const controllers = require('../controllers/user-ctrl')

//GET 
router.get('/',controllers.getAllUsers)

//GET BY ID 
router.get('/:id',controllers.getUserById)

// //POST
router.post('/', controllers.postUserMethod);



// //PUT BY ID
router.put('/:id' , controllers.putMethod)

// //DELETE BY ID
router.delete('/:id' , controllers.deleteMethod)

module.exports = router;