
const mongoose = require("mongoose");
const User = require("./User");

const sessionSchema = new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User
    }
},{timestamps:true})

module.exports = mongoose.model("Session",sessionSchema)