// const nodeMailer = require("nodemailer");
// require("dotenv").config()

// const transporter = nodeMailer.createTransport({
//   host:"smtp-relay.brevo.com",
//   port:587,
//   auth:{
//     user:process.env.SMTP_USER,
//     pass:process.env.SMTP_PASS
//   },
//   tls: { rejectUnauthorized: false },
// });


// module.exports = transporter;



const nodemailer = require("nodemailer");
const axios = require("axios");
require("dotenv").config();

let transporter;

if (process.env.NODE_ENV === "production") {
  // Use Brevo HTTPS API on Render
  transporter = {
    sendMail: async ({ to, subject, html }) => {
      try {
        await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
            sender: { name: "Airkart Support", email: process.env.SMTP_USER },
            to: [{ email: to }],
            subject,
            htmlContent: html,
          },
          {
            headers: {
              "accept": "application/json",
              "api-key": process.env.BREVO_API_KEY,
              "content-type": "application/json",
            },
          }
        );
        console.log("✅ Email sent via Brevo API");
      } catch (err) {
        console.error("❌ Email sending failed:", err.response?.data || err.message);
      }
    },
  };
} else {
  // Local: use Nodemailer
  transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
}

module.exports = transporter;
