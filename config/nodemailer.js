const nodeMailer = require("nodemailer");
require("dotenv").config()

const transporter = nodeMailer.createTransport({
  host:"smtp-relay.brevo.com",
  port:587,
  auth:{
    user:process.env.SMTP_USER,
    pass:process.env.SMTP_PASS
  },
  tls: { rejectUnauthorized: false },
});


module.exports = transporter;
