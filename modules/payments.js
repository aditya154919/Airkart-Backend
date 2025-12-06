
const mongoose = require("mongoose");
// const User = require("");


const paymentSchema = new mongoose.Schema({
    orderId:{
        type:String,
        default:null
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    amount:{
        type:Number,
        default:null
    },
    notes: { type: Object, default: {} },
    ticket:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Ticket"
    },
    status:{
        type: String,
        enum: ["created","paid","failed"], 
        default: "created" 
    },
    
},{timestamps:true})

module.exports = mongoose.model("Payment",paymentSchema)