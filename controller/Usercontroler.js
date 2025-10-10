const express = require("express");
const User = require("../modules/User");

exports.userDetails = async(req,res)=>{
    
    try{
       const {userid} = req.body;
       const user = await User.findById(userid);
       if(!user){
        return res.status(404).json({
            success:false,
            message:"User not found"
        })
       }

       return res.status(200).json({
        success:true,
        userData:{
            name: user.name,
            Accountverified:user.isAccountVerified

        }
       })


    }
    catch(error){
        return res.json({
            success:false,
            message:"N"
        })
    }
}


