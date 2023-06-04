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
        default:"apply"
    },
    url:{
        type:String,
    },
    company_logo:{
        type:String
    },
    updatedAt:{
        type:String
    },
    archive:{
        type:Boolean,
        default: false
    },
    pin:{
        type:Boolean,
        default: false
    },
    last_updated:{
        type:Date
    },
    created_at:{
        type:Date
    }
});



module.exports = mongoose.model('JOB', JOB);