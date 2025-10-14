
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); 
require("dotenv").config();
const cookieParser = require("cookie-parser");

const { connect } = require("./config/databse"); // DB connect
const user = require("./routes/user"); // user routes



const app = express();
app.use(express.json());
app.use(cookieParser())


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); 
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(null, true); 
      }
    },
    
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

connect();


app.use("/api/v1", user);
const paymentRoutes = require("./routes/amount");


function getReturnDate(outbound_date, return_date) {
  if (return_date) return return_date;
  const date = new Date(outbound_date);
  date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0];
}


app.get("/api/flights", async (req, res) => {
  try {
    const { from, to, outbound_date, return_date } = req.query;

    if (!from || !to || !outbound_date) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const finalReturnDate = getReturnDate(outbound_date, return_date);
    const API_KEY = process.env.SERPAPI_KEY;

    if (!API_KEY) {
      return res
        .status(500)
        .json({ error: "Missing SerpAPI key in environment" });
    }

    
    app.use("/api/payment", paymentRoutes);


    const url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${from}&arrival_id=${to}&outbound_date=${outbound_date}&return_date=${finalReturnDate}&currency=USD&hl=en&api_key=${API_KEY}`;

    console.log("Fetching URL:", url);

    const response = await fetch(url);
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch flights from SerpAPI" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/",(req,res)=>{
  res.send("API WORKING");
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));





