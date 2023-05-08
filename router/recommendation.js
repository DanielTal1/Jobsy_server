const express = require('express')
const router = express.Router()
const controllers = require('../controllers/recommendation-ctrl')

//GET 
router.get('/:id',controllers.getRecommendations)




module.exports = router;