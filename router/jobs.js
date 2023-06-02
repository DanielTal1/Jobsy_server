const express = require('express')
const router = express.Router()
const controllers = require('../controllers/jobs-ctrl')

//GET 
router.get('/',controllers.getAllJobs)

//GET BY ID 
router.get('/:id',controllers.getJobsById)


//GET BY ID 
router.get('/user/:id',controllers.getJobsByUsername)


router.get('/archive/:id',controllers.getArchiveJobsByUsername)

// //POST
router.post('/', controllers.addJob);


// //PUT BY ID
router.put('/:id' , controllers.updateJob)

// //DELETE BY ID
router.delete('/' , controllers.deleteJobs)

// //PUT BY ID
router.put('/pin/:id' , controllers.updatePins)

// //PUT BY ID
router.put('/archive/:id' , controllers.updateArchive)

module.exports = router;