
const express = require("express");
const User = require("../modules/User");
const transporter = require("../config/nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();


exports.sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(200).json({
      success: false,
      message: "Please enter an email address",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpiredAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your Reset Password Verification Code",
      text: `Your password reset OTP is: ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${user.email}`,
    });
  } catch (error) {
    console.error("Send Reset OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reset OTP",
    });
  }
};


exports.resetPass = async (req, res) => {
  const { email, otp, newPassword } = req.body; 

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all details",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpiredAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired, please request a new one",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiredAt = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while resetting password",
    });
  }
};
