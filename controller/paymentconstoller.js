const express = require("express");
require("dotenv").config();
const crypto = require("crypto");
const {createRazorpayInstance} = require("../config/razorpay");

const razorpayInstance = createRazorpayInstance();

exports.createorder = async (req,res) =>{
    const {flightId, price} = req.body;

    //flight id se fetch krenge 

    // order create karenge
    const option = {
        price:price*100,
        currency:"INR",
        receipt:'receipt_order_1',
    };

    try {
        razorpayInstance.orders.create(option,(err,order) =>{
            if(err){
                return res.status(500).json({
                    success:false,
                message:"Something went wrong"
                })
            }

            return res.status(200).json(order);
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Something went wwrong"
        })
    }

}

exports.verifyPayment = async(req,res) =>{
    const {order_id,payment_id,signature} = req.body;

    const secret = process.env.RAZORPAY_SECRET;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(order_id + "|" +payment_id);

    const generatedSignature = hmac.digest("hex");

    if(generatedSignature === signature){
        return res.status(200).json({
            success:true,
            message:"Payment verified"
        });

    }else{
        return res.status(400).json({
            success:false,
            message:"Payment not verified"
        })
    }

}




