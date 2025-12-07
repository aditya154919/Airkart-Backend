const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      default: null,
    },
    providers: { type: [String], default: ["google"] },
    emailVerified: { type: Boolean, default: false },
    googleId: {
      type: String,
    },
    avatar: {
      type: String,
    },
    avatarId:{
      type:String,
      default:null
    },
    dateOfBirth:{
      type:String,
      default:null
    },
    aadharNo:{
      type:String,
      default:null
    },
    age:{
     type:String,
     default:null
    },
    verifyOtp: {
      type: String,
      default: null,
    },
    isLoggedin: {
      type: Boolean,
      default: false,
    },
    mobileNo: {
      type:String,
    },
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpiredAt: {
      type: Number,
      default: null,
    },
    ticket: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
