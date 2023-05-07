const express = require('express')
const router = express.Router()
const controllers = require('../controllers/recommendation-ctrl')

//GET 
router.get('/',controllers.getRecommendationsByItems)


//GET 
router.get('/users',controllers.getRecommendationsByUsers)

module.exports = router;