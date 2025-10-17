const express = require("express");
const router = express.Router();
const {signup, isAuthenticated} =  require("../controller/Auth");
const {login} = require("../controller/Auth");
const {logout} = require("../controller/Auth");
const { Authmiddleware } = require("../middleware/Authmiddleware");
const { verifyOtp, verifyEmail } = require("../controller/otp");
const { sendResetOtp, resetPass } = require("../controller/resetpass");
const { userDetails } = require("../controller/Usercontroler");
const { PassengerDetails } = require("../controller/passenger");
const {bookTicket } = require("../controller/Ticketcontroller")
// const { route } = require("express/lib/application");



router.post("/signup",signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-verify-otp", Authmiddleware,verifyOtp);
router.post("/verify-account", Authmiddleware,verifyEmail);
router.post("/is-auth", Authmiddleware,isAuthenticated);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-pass", resetPass);
router.get("/data", Authmiddleware, userDetails);
router.post("/passenger",PassengerDetails);
router.post("/book",bookTicket );

module.exports = router;





