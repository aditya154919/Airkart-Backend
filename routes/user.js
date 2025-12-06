const express = require("express");
const router = express.Router();
const { signup, isAuthenticated } = require("../controller/Auth");
const { login } = require("../controller/Auth");
const { logout } = require("../controller/Auth");
const { Authmiddleware } = require("../middleware/Authmiddleware");
const { verifyOtp, verifyEmail } = require("../controller/otp");
const { sendResetOtp, resetPass } = require("../controller/resetpass");
const { userDetails, updateUser } = require("../controller/Usercontroler");
const { PassengerDetails } = require("../controller/passenger");
const { bookTicket } = require("../controller/Ticketcontroller");
const { singleUpload } = require("../middleware/multer");
// const { route } = require("express/lib/application");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", Authmiddleware, logout);
router.post("/send-verify-otp", Authmiddleware, verifyOtp);
router.post("/verify-account", Authmiddleware, verifyEmail);
router.post("/is-auth", Authmiddleware, isAuthenticated);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-pass", resetPass);
router.get("/data", Authmiddleware, userDetails);
router.post("/passenger", PassengerDetails);
router.post("/book", bookTicket);
router.put("/update/:id",Authmiddleware,singleUpload,updateUser);
// POST /auth/set-password
router.post("/auth/set-password", Authmiddleware, async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res
      .status(400)
      .json({ success: false, message: "Password too weak" });
  }
  const hash = await bcrypt.hash(password, 10);
  req.user.password = hash;
  if (!req.user.providers.includes("local")) req.user.providers.push("local");
  await req.user.save();
  res.json({ success: true });
});

module.exports = router;
