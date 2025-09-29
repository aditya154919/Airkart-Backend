
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();

//  frontend origins
const allowedOrigins = [
  "http://localhost:5173",               // local dev
  "http://localhost:5174",               // local dev alternate
  process.env.FRONTEND_URL               // deployed frontend from .env
];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET"],
  })
);

// claculate return date
function getReturnDate(outbound_date, return_date) {
  if (return_date) return return_date;
  const date = new Date(outbound_date);
  date.setDate(date.getDate() + 7); // default return after 7 days
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

// Flight Search API
app.get("/api/flights", async (req, res) => {
  try {
    const { from, to, outbound_date, return_date } = req.query;
    console.log("Received Query Params:", req.query);

    if (!from || !to || !outbound_date) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const finalReturnDate = getReturnDate(outbound_date, return_date);
    const API_KEY = process.env.SERPAPI_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "Missing SerpAPI key in environment" });
    }

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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
