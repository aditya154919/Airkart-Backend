const express = require("express");
const User = require("../modules/User");
const transporter = require("../config/nodemailer");
require("dotenv").config();

exports.verifyOtp = async(req,res)=>{
    try{
     const {userid} = req.body;
     const user = await User.findById(userid);

     if(user.isAccountVerified){
        return res.status(500).json({
            success:false,
            message:"user ia already verified",
        })
     }

     const otp = String(Math.floor(100000 + Math.random() * 900000));

     user.verifyOtp = otp;
     user.verifyOtpExpiredAt = Date.now() + 5*60*1000;

     await user.save();

     const mailOption = {
      from:process.env.SENDER_EMAIL,
      to:user.email,
      subject:"Your Account verification Code",
      text:`Your verification OTP is: ${otp}. use this to verify your account`
     }

     await transporter.sendMail(mailOption);
     return res.status(200).json({
        success:true,
        message:`OTP sent successfully at ${user.email}`
     })

    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:"OTP not sent"
        })
    }

    
}

//verify otp

exports.verifyEmail = async(req,res) =>{
    const {userid,otp} = req.body;

        if(!userid || !otp){
            return res.status(401).json({
                success:false,
                message:"Something missing",
            })
        }

    try {
     const user = await User.findById(userid);

     if(!user){
        return res.json({
            success:false,
            message:"User not found"
        })
     }

     if(user.verifyOtp == '' || user.verifyOtp != otp){
        return res.json({
            success:false,
            message:"Invalid OTPmplease try Again"
        })
     }

     if(user.verifyOtpExpiredAt < Date.now()){
        return res.json({
            success:false,
            message:"OTP expired"
        })
     }

     user.isAccountVerified = true;
     user.verifyOtp = "";
     user.verifyOtpExpiredAt = 0;

     await user.save();

     return res.status(400).json({
        success:true,
        message:"Email verified successfully",
     })

    } catch (error) {
        return res.status(400).json({
            success:false,
            message:message.error,
        })
    }
}