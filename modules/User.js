const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    verifyOtp:{
        type:String,
        default:""
    },
    verifyOtpExpiredAt:{
        type:Number,
        default:0
    },
    isAccountVerified:{
        type:Boolean,
        default:false,
    },
    resetOtp:{
        type:String,
        default:"",
    },
    resetOtpExpiredAt:{
        type:Number,
        default:0
    },
    ticket:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Ticket",
        }
    ]
    
})

module.exports = mongoose.model("user", userSchema);

