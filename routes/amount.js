const express = require("express");
const { createorder, verifyPayment } = require("../controller/paymentconstoller");
const router = express.Router();




router.post("./createorder", createorder);
router.post('./verifypayment', verifyPayment)

module.exports = router;