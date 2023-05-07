const mongoose = require('mongoose');
const schema = mongoose.Schema;

const Company = new schema({
    name:{
        type: String,
        required: true,
        unique:true
    },
    rating:{
        type: Number,
        max:10,
        min:0,
        default:0
    },
    comments:{
        type:Array,
        default:[]
    },
    questionAsked:{
        type:Array,
        default:[]
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