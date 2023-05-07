const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = new schema({
    username:{
        type: String,
        required: true,
        unique:true
    },
    password:{
        type: String,
        trim: true,
        required: true,
        min:6,
        max:12
    },
    recommendationId:{
        type:Array,
        default:[]
    }
})


module.exports = mongoose.model('User', User);