const jwt=  require("jsonwebtoken");
const User = require("../modules/User");
require("dotenv").config();

exports.Authmiddleware = async(req,res,next) =>{
    const {token} = req.cookies;

    if(!token){
        return res.status(400).json({
            success:false,
            message:"Token not Avaliable"
        })
    }
    try {
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET);

        if(tokenDecode.id){
            req.body.userid = tokenDecode.id;
        }else{
            return res.status(400).json({
                success:false,
                message:"User not Authorized"
            })
        }

        next();
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Error"
        })
    }

}