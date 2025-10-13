
const express = require("express");
const User = require("../modules/User");
const transporter = require("../config/nodemailer");
require("dotenv").config();


exports.verifyOtp = async (req, res) => {
  try {
    const { userid } = req.body;
    const user = await User.findById(userid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpiredAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your Account Verification Code",
      text: `Your verification OTP is: ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${user.email}`,
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};


exports.verifyEmail = async (req, res) => {
  const { userid, otp } = req.body;

  if (!userid || !otp) {
    return res.status(400).json({
      success: false,
      message: "User ID or OTP missing",
    });
  }

  try {
    const user = await User.findById(userid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.verifyOtp || user.verifyOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP, please try again",
      });
    }

    if (user.verifyOtpExpiredAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired, please request a new one",
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiredAt = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
