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
const { spawn } = require('child_process');



// Initialize Firebase Admin SDK
const serviceAccount = require('./private/jobsy-50d06-firebase-adminsdk-3i4wo-c520cc075c.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


app.use(cors());
app.use(express.json())

app.use('/auth', routerAuth);
app.use('/users', routerUsers);
app.use('/jobs', routerJobs);
app.use('/company', routerCompany);
app.use('/recommendation', routerRecommendation);
app.use('/comments', routerComment);


//creating new process for the scheduler so it won't intrupt the server operations
const jobScheduler = spawn('node', ['scheduler.js'], {
  detached: true,
  stdio: 'ignore',
});

// Detach the child process and allow it to run independently
jobScheduler.unref();

console.log('Job scheduler started in a separate process.');


app.listen(process.env.PORT , (req,res)=>{
    console.log(`Server is up in ${process.env.PORT} `);
    })



