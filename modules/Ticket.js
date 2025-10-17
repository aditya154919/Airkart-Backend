const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  passengers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "passenger",
    },
  ],
  flight: {
    flightNumber: String,
    airline: String,
    departureCity: String,
    arrivalCity: String,
    departureTime: String,
    arrivalTime: String,
  },
  totalAmount: Number,
  paymentMethod: String,
  bookingDate: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("Ticket", ticketSchema);
