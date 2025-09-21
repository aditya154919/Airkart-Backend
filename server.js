
// import express from "express";
// import fetch from "node-fetch";
// import cors from "cors";

// const app = express();
// app.use(cors());

// //  calculate return date
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

//     // frontend kya bhej raha hai
//     console.log("Received Query Params:", req.query);

//     if (!from || !to || !outbound_date) {
//       return res.status(400).json({ error: "Missing required parameters" });
//     }

//     // return_date
//     const finalReturnDate = getReturnDate(outbound_date, return_date);

    
//     const url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${from}&arrival_id=${to}&outbound_date=${outbound_date}&return_date=${return_date || finalReturnDate}&currency=USD&hl=en&api_key=ba9420b5d2722ede0174af944b8420c65b237c2ffa7e545818007a2f7729bf37`;

//     console.log("Fetching URL:", url);

//     const response = await fetch(url);
//     const data = await response.json();

//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching flights:", error);
//     res.status(500).json({ error: "Failed to fetch flights" });
//   }
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));




import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// ✅ Allow only your frontend in production
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // set FRONTEND_URL in .env during deploy
    methods: ["GET"],
  })
);


function getReturnDate(outbound_date, return_date) {
  if (return_date) return return_date; 

  const date = new Date(outbound_date); 
  date.setDate(date.getDate() + 7);     // add 7 days
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
