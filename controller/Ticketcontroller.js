
const Ticket = require("../modules/Ticket");
const Passenger = require("../modules/passenger");
const User = require("../modules/User");
const generateTicketPDF = require("../utils/generateTicketPDF");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

exports.bookTicket = async (req, res) => {
  console.log("Incoming booking data:", req.body);

  try {
    const { userid, passengers, flight, totalAmount, orderId } = req.body;
    console.log(req.body)

    if (!userid || !passengers || passengers.length === 0 || !flight) {
      return res.status(400).json({
        success: false,
        message: "Missing required booking details.",
      });
    }

    const savedPassengers = await Passenger.insertMany(passengers);


    const ticket = await Ticket.create({
      user: userid,
      passengers: savedPassengers.map((p) => p._id),
      flight,
      totalAmount,
      orderId,
    });

    const updatedUser = await User.findByIdAndUpdate(
      userid,
      { $push: { ticket: ticket._id } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Failed to link ticket to user.",
      });
    }

    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const pdfPath = await generateTicketPDF(ticket, user, savedPassengers);
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString("base64");
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Airkart", email: process.env.SENDER_EMAIL },
        to: [{ email: user.email }],
        subject: `🎫 Airkart Ticket Confirmation - ${flight.airline || "Airline"}`,
        htmlContent: `
          <h2>Dear ${user.name || "Passenger"},</h2>
          <p>Your flight ticket has been successfully booked!</p>
          <p><b>Airline:</b> ${flight.airline}</p>
          <p><b>Flight No:</b> ${flight.flightNumber}</p>
          <p><b>From:</b> ${flight.departureCity}</p>
          <p><b>To:</b> ${flight.arrivalCity}</p>
          <p><b>Departure:</b> ${new Date(flight.departureTime).toLocaleString()}</p>
          <p><b>Arrival:</b> ${new Date(flight.arrivalTime).toLocaleString()}</p>
          <hr />
          <p>Thank you for choosing <b>Airkart</b>! ✈️</p>
        `,
        attachment: [
          {
            name: `Ticket_${ticket._id}.pdf`,
            content: pdfBase64,
          },
        ],
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Ticket email sent successfully via Brevo.");

    return res.status(200).json({
      success: true,
      message: "Ticket booked and email sent successfully.",
      ticket,
    });
  } catch (error) {
    console.error("❌ Error in bookTicket:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while booking the ticket.",
      error: error.message,
    });
  }
};
