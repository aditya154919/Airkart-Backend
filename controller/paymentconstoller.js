
const express = require("express");
require("dotenv").config(); // ok at top
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../modules/User");
const payments = require("../modules/payments");
exports.createorder = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findOne(userId)
    if(!user){
      return req.status(404).json({
        success:false,
        message:"User not found"
      })
    }

    // Basic env checks (never log secrets in production)
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_SECRET;
    if (!keyId || !keySecret) {
      console.error("Razorpay keys missing in env");
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials are not configured on the server",
      });
    }

     const { amount, currency = "INR", notes = {} } = req.body;
    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "amount must be an integer (paise)" });
    }

    // create local payment record first (so we have localOrderId)
    const local = await payments.create({
      user: userId,
      amount,
      status: "created",
      notes
    });

    // instantiate razorpay client
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    
    const option = req.body;
    if (!option || typeof option !== "object") {
      return res.status(400).json({
        success: false,
        message: "Missing order payload",
      });
    }
  
    if (!("amount" in option) || !Number.isInteger(option.amount)) {
      return res.status(400).json({
        success: false,
        message: "Order 'amount' is required and must be an integer (amount in paise).",
      });
    }
    if (!option.currency) option.currency = "INR";

    // Create  order
    const order = await razorpay.orders.create(option);
    console.log(order)

    
   local.orderId = order.id;
    await local.save();
     
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Failed to create order",
      });
    }

    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay create order error:", error);

    if (error && error.error && error.error.code === "BAD_REQUEST_ERROR") {
      return res.status(401).json({
        success: false,
        message: "Razorpay authentication failed. Check API key/secret.",
        details: error.error.description, 
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during creating order",
    });
  }
};



// exports.validate = async (req, res) => {
    
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body.body || req.body;
    
//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//         return res.status(400).json({
//             success: false,
//             message: "Missing payment verification parameters."
//         });
//     }

//     try {
//         const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET); 
//         hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`); 
        
//         const digest = hmac.digest("hex");
//         if (digest !== razorpay_signature) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Transaction is not legit (Signature Mismatch)." 
//             });
//         }
//         return res.status(200).json({
//             success: true,
//             message: "Transaction successfully verified.", 
//             orderId: razorpay_order_id,
//             paymentId: razorpay_payment_id
//         });
        
//     } catch (error) {
//         console.error("Verification Error:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Server error during verification."
//         });
//     }
// };