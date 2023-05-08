const mongoose = require('mongoose');
const schema = mongoose.Schema;

const JOB = new schema({
    username: {
        type: String,
        required: true
    },
    company:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    },
    location:{
        type: String,
    },
    stage:{
        type:String,
    },
    url:{
        type:String,
    },
    company_logo:{
        type:String
    },
    updatedAt:{
        type:String
    }
})



module.exports = mongoose.model('JOB', JOB);