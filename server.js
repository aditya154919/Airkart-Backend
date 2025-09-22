
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";

// dotenv.config();
// const app = express();

// // ✅ Allow only your frontend in production
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5174", 
//     methods: ["GET"],
//   })
// );


// function getReturnDate(outbound_date, return_date) {
//   if (return_date) return return_date; 

//   const date = new Date(outbound_date); 
//   date.setDate(date.getDate() + 7);     // add 7 days
//   return date.toISOString().split("T")[0]; // format: YYYY-MM-DD
// }

// // Flight Search API
// app.get("/api/flights", async (req, res) => {
//   try {
//     const { from, to, outbound_date, return_date } = req.query;
//     console.log("Received Query Params:", req.query);

//     if (!from || !to || !outbound_date) {
//       return res.status(400).json({ error: "Missing required parameters" });
//     }

//     const finalReturnDate = getReturnDate(outbound_date, return_date);
//     const API_KEY = process.env.SERPAPI_KEY;

//     if (!API_KEY) {
//       return res.status(500).json({ error: "Missing SerpAPI key in environment" });
//     }

//     const url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${from}&arrival_id=${to}&outbound_date=${outbound_date}&return_date=${return_date || finalReturnDate}&currency=USD&hl=en&api_key=${API_KEY}`;

//     console.log("Fetching URL:", url);

//     const response = await fetch(url);

//     if (!response.ok) {
//       return res
//         .status(response.status)
//         .json({ error: "Failed to fetch flights from SerpAPI" });
//     }

//     const data = await response.json();
//     res.json(data);
//   } catch (err) {
//     console.error("Server error:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));






import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // make sure node-fetch is installed

dotenv.config();
const app = express();

// ✅ Flexible CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL // deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET"],
  })
);

function getReturnDate(outbound_date, return_date) {
  if (return_date) return return_date; 

  const date = new Date(outbound_date); 
  date.setDate(date.getDate() + 7); // add 7 days
  return date.toISOString().split("T")[0]; // format: YYYY-MM-DD
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

    const url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${from}&arrival_id=${to}&outbound_date=${outbound_date}&return_date=${return_date || finalReturnDate}&currency=USD&hl=en&api_key=${API_KEY}`;

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
