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

// Detect if running on Render (production)
const isProduction = process.env.NODE_ENV === "production";

// 💡 Log environment info (optional)
console.log(`📦 Mail mode: ${isProduction ? "BREVO API (production)" : "SMTP (local)"}`);

if (isProduction) {
  // ✅ Use Brevo HTTPS API (works perfectly on Render)
  transporter = {
    sendMail: async ({ to, subject, html, text }) => {
      try {
        await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
            sender: { name: "Airkart Support", email: process.env.SMTP_USER },
            to: [{ email: to }],
            subject,
            htmlContent: html || `<p>${text}</p>`,
          },
          {
            headers: {
              accept: "application/json",
              "api-key": process.env.BREVO_API_KEY,
              "content-type": "application/json",
            },
          }
        );
        console.log(`✅ Email sent via Brevo API to ${to}`);
      } catch (err) {
        console.error("❌ Brevo API failed:", err.response?.data || err.message);
      }
    },
  };
} else {
 
  transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ SMTP connection failed:", error);
    } else {
      console.log("✅ SMTP server ready to send emails locally");
    }
  });
}

module.exports = transporter;
