const express = require("express");
const bcrypt = require("bcrypt")
const User = require("../modules/User");
const cloudinary = require("../config/cloudinary");

exports.userDetails = async (req, res) => {
  try {
    const { userid } = req.body;
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      userData: {
        name: user.name,
      },
    });
  } catch (error) {
    console.error("User Details Error:", error); 
    return res.status(500).json({ 
      success: false,
      message: "Server Error",
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userIdToUpdate = req.params.id;
    const loggedInuser = req.user; 
    const { name, email, mobileNo, aadharNo, password, dateOfBirth, age } = req.body;

    if (loggedInuser._id.toString() !== userIdToUpdate) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to change this profile",
      });
    }
    let user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profileUrl = user.avatar;
    let profileid = user.avatarId;

    if (req.file) {
      if (profileid) {
        await cloudinary.uploader.destroy(profileid);
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profiles" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(req.file.buffer);
      });
      profileUrl = uploadResult.secure_url;
      profileid = uploadResult.public_id;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.mobileNo = mobileNo || user.mobileNo;
    user.age = age || user.age;
    user.aadharNo = aadharNo || user.aadharNo;
    
    if(dateOfBirth) {
        user.dateOfBirth = dateOfBirth;
    }

    
    if(password) {
        user.password = await bcrypt.hash(password,10); 
    }
    
    user.avatar = profileUrl;
    user.avatarId = profileid;

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile Updated successfully",
      user: updatedUser,
    });

  } catch (error) {

    console.error("Update Error:", error); 
    
    return res.status(500).json({
      success: false,
      message: "Server error during updating",
      error: error.message 
    });
  }
};