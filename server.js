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
const admin = require('firebase-admin');
const cors = require('cors');
//const routerQuestionAsked = require('./router/question_asked')



// Initialize Firebase Admin SDK with your service account credentials
const serviceAccount = require('./private/jobsy-50d06-firebase-adminsdk-3i4wo-c520cc075c.json'); // Replace with the path to your service account JSON file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Now you can use the Firebase Admin SDK to send FCM notifications, subscribe devices to topics, etc.

app.use(cors());
app.use(express.json())

app.use('/auth', routerAuth);
app.use('/users', routerUsers);
app.use('/jobs', routerJobs);
app.use('/company', routerCompany);
app.use('/recommendation', routerRecommendation);
app.use('/comments', routerComment);


app.listen(process.env.PORT , (req,res)=>{
    console.log(`Server is up in ${process.env.PORT} `);
    })
