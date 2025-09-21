# ✈️ Airline Reservation Backend (Airkart)

This is the **backend service** for the Airline Reservation System.  
It provides a flight search API using **Express.js** and the **SerpAPI Google Flights engine**.

---

## 🚀 Features
- Flight search API (`/api/flights`)
- Auto fallback return date (+7 days if not provided)
- CORS support (secured with `FRONTEND_URL`)
- Environment-based config (via `.env`)
- Ready for deployment on **Render**

---

## 🛠️ Tech Stack
- Node.js (ES Modules)
- Express.js
- SerpAPI
- CORS
- dotenv

---

## ⚙️ Setup (Local)

### 1. Clone repo
```bash
git clone https://github.com/your-username/airkart-backend.git
cd airkart-backend
