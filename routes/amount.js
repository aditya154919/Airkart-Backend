const express = require("express");
const { createorder } = require("../controller/paymentconstoller");
const { Authmiddleware } = require("../middleware/Authmiddleware");


const router = express.Router();


router.post("/createorder",Authmiddleware ,createorder);
// router.post("/verifypayment", validate)

module.exports = router;