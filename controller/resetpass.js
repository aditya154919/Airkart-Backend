const express = require("express");
const User = require("../modules/User");
const transporter = require("../config/nodemailer");
require("dotenv").config();
const bcrypt = require("bcrypt");

exports.sendResetOtp = async(req,res) =>{
    const {email} = req.body;
    if(!email){
        return res.json({
            success:false,
            message:"Plese enter email"
        })
    }
    try{
       const user  =  await User.findOne({email});
       if(!user){
        return res.json({
            success:false,
            message:"user does not exist"
        })
       }

     const otp = String(Math.floor(100000 + Math.random() * 900000));

     user.resetOtp = otp;
     user.resetOtpExpiredAt = Date.now() + 5*60*1000;

     await user.save();

     const mailOption = {
      from:process.env.SENDER_EMAIL,
      to:user.email,
      subject:"Your Reset Password verification Code",
      text:`Your Reset password OTP is: ${otp}. use this to Reset your password`
     }

     await transporter.sendMail(mailOption);
     return res.status(200).json({
        success:true,
        message:`OTP sent successfully at ${user.email}`
     })
    }
    catch{
         return res.status(400).json({
            success:false,
            message:"Reset OTP not sent"
        })
    }
}

// reset pass

exports.resetPass = async(req,res) =>{
    const{email,resetOtp,newpassword} = req.body;
    if(!email || !resetOtp || !newpassword){
        return res.json({
            success:false,
            message:"please fill all details "
        })
    }

    try {
        const user  = await User.findOne({email});
        if(!user){
            return res.json({
                success:false,
                message:"User not found"
            })
        }

        if(user.resetOtp === "" || user.resetOtp !=resetOtp){
            return res.json({
                success:false,
                message:"Invalid otp"
            })
        }

        if(user.resetOtpExpiredAt <Date.now()){
            return res.json({
                success:false,
                message:"OTP expired"
            })
        }

        const hashPassword = await bcrypt.hash(newpassword,10);

        user.password = hashPassword;
        user.resetOtp = "";
        user.resetOtpExpiredAt = 0;

        await user.save();

        return res.status(200).json({
            success:true,
            message:"Password Changed"
        })



    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Pass not reset "
        })
    }
}