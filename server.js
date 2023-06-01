require('dotenv').config();
require('./DB/jobsyDB')
const express = require('express');
const app = express();
const routerUsers = require('./router/users')
const routerAuth = require('./router/auth');
const routerJobs = require('./router/jobs');
const routerCompany = require('./router/company');
const routerRecommendation = require('./router/recommendation');
const routerComment = require('./router/comments');
//const routerQuestionAsked = require('./router/question_asked')


app.use(express.json())

app.use('/auth', routerAuth);
app.use('/users', routerUsers);
app.use('/jobs', routerJobs);
app.use('/company', routerCompany);
app.use('/recommendation', routerRecommendation);
app.use('/comments', routerComment);
//app.use('/question-asked', routerQuestionAsked);

app.listen(process.env.PORT , (req,res)=>{
    console.log(`Server is up in ${process.env.PORT} `);
    })
