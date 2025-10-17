const express = require("express");
const router = express.Router();
const Ticket = require("../modules/Ticket");

// GET tickets for  user
router.get("/user/:userid", async (req, res) => {
  try {
    const { userid } = req.params;
    const tickets = await Ticket.find({ user: userid })
      .populate("passengers") 
      .sort({ createdAt: -1 }) 
      .lean();

    return res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Fetch tickets error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching tickets",
    });
  }
});

module.exports = router;
