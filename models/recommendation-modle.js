const mongoose = require('mongoose');
const schema = mongoose.Schema;

const Recommendation = new schema({
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
    url:{
        type:String,
    },
    company_logo:{
        type:String
    }
})




module.exports = mongoose.model('Recommendation', Recommendation);