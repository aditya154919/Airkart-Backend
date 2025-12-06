const jwt = require("jsonwebtoken");
const User = require("../modules/User");
require("dotenv").config();


exports.Authmiddleware = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Missing token",
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    console.log("🔍 Decoded JWT:", decode);

    const user = await User.findById(decode.id).select("-password");

    if (!user) {
      console.log("❌ No user found for:", decode.id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    req.userId = user._id;
    console.log("✔ Authenticated user:", user._id.toString());

    next();
  } catch (err) {
    console.log("JWT ERROR:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


