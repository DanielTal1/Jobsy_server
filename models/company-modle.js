const mongoose = require('mongoose');
const schema = mongoose.Schema;

const Company = new schema({
    name:{
        type: String,
        required: true,
        unique:true
    },
    logo:{
        type: String,
        default:""
    },
    description:{
        type:String,
        defualt:""
    }

},)

module.exports = mongoose.model('Company', Company);