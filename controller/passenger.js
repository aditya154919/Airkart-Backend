const Passenger = require("../modules/passenger");

exports.PassengerDetails = async (req, res) => {
  try {
    const { passengers } = req.body;

    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Passenger details are missing or invalid",
      });
    }

    // save in db
    const savedPassengers = await Passenger.insertMany(passengers);

    return res.status(200).json({
      success: true,
      message: "All passenger details saved successfully",
      data: savedPassengers,
    });
  } catch (error) {
    console.error("Error saving passenger details:", error);
    return res.status(500).json({
      success: false,
      message: "Error saving passenger details",
      error: error.message,
    });
  }
};


 