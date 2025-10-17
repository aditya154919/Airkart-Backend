

const Ticket = require("../modules/Ticket");
const Passenger = require("../modules/passenger");
const User = require("../modules/User");
const transporter = require("../config/nodemailer");
const generateTicketPDF = require("../utils/generateTicketPDF");
require("dotenv").config();

exports.bookTicket = async (req, res) => {
  console.log("Incoming booking data:", req.body);

  try {
    const { userid, passengers, flight, totalAmount, paymentMethod, barcode } = req.body;

    if (!userid || !passengers || passengers.length === 0 || !flight) {
      return res.status(400).json({
        success: false,
        message: "Missing required booking details.",
      });
    }
    // Save  DB
    const savedPassengers = await Passenger.insertMany(passengers);

    //  barcode 
    const ticketBarcode = barcode || `AI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    //ticket 
    const ticket = await Ticket.create({
      user: userid,
      passengers: savedPassengers.map((p) => p._id),
      flight,
      totalAmount,
      paymentMethod,
      barcode: ticketBarcode,
    });

    // Link ticket to user 
const updatedUser = await User.findByIdAndUpdate(
  userid,
  { $push: { ticket: ticket._id } },
  { new: true } // returns updated user
);

if (!updatedUser) {
  return res.status(404).json({ success: false, message: "Failed to link ticket to user" });
}

console.log(" Ticket linked to user:", updatedUser.ticket); 

    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ticket PDF
    const pdfPath = await generateTicketPDF(ticket, user, savedPassengers);

    //  Send ticket by email 
   try {
  await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to: user.email,
    subject: `🎫 Airkart Ticket Confirmation - ${flight.airline || "Airline"}`,
    html: `
      <h2>Dear ${user.name || "Passenger"},</h2>
      <p>Your flight ticket has been successfully booked!</p>
      <p><b>Airline:</b> ${flight.airline || "Airline"}</p>
      <p><b>Flight No:</b> ${flight.flightNumber}</p>
      <p><b>From:</b> ${flight.departureCity}</p>
      <p><b>To:</b> ${flight.arrivalCity}</p>
      <p><b>Departure:</b> ${new Date(flight.departureTime).toLocaleString()}</p>
      <p><b>Arrival:</b> ${new Date(flight.arrivalTime).toLocaleString()}</p>
      <p><b>Total Fare:</b> ₹${totalAmount}</p>
      <p><b>Payment Method:</b> ${paymentMethod}</p>
      <hr />
      <p>Thank you for choosing <b>Airkart</b>! ✈️</p>
    `,
    attachments: [{ filename: `Ticket_${ticket._id}.pdf`, path: pdfPath }],
  });
} catch (emailError) {
  console.warn("⚠️ SMTP failed, trying Brevo API:", emailError.message);

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Airkart", email: process.env.SENDER_EMAIL },
      to: [{ email: user.email }],
      subject: `🎫 Airkart Ticket Confirmation - ${flight.airline || "Airline"}`,
      htmlContent: `<h3>Dear ${user.name},</h3><p>Your flight booking is confirmed!</p>`,
    }),
  });
}


    return res.status(200).json({
      success: true,
      message: "Ticket booked successfully. Email may have failed.",
      ticket,
    });
  } catch (error) {
    console.error(" Error in bookTicket:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while booking the ticket.",
      error: error.message,
    });
  }
};
