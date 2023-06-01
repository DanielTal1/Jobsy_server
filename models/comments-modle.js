const mongoose = require('mongoose');
const schema = mongoose.Schema;

const Comments = new schema({
    company:{
        type: String,
        required: true,
    },
    username:{
        type: String,
    },
    text:{
        type:String,
    },
    role:{
        type:String,
    },

},)

module.exports = mongoose.model('Comments', Comments);