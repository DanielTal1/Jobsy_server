const express = require('express')
const router = express.Router()
const controllers = require('../controllers/comments-ctrl')

//GET 
router.get('/',controllers.getAllComments)


//GET BY ID 
router.get('/:id',controllers.getCommentsByCompanyName)


// //POST
router.post('/', controllers.addComment);

module.exports = router;