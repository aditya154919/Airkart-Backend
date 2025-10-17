const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const passengerSchema = new  mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    aadharNo:{
        type:Number,
        required:true
    },
    // expiredAt:{
    //     type:Date,
    //     required:true,
    //     index: { expires: 0 },
    // }
})

module.exports = mongoose.model("passenger",passengerSchema);