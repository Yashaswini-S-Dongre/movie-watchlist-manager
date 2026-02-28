require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth"); 
const movieRoutes = require("./routes/movies");

const app = express();

// Middleware (Crucial for receiving POST requests)
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);

// Root Route
app.get("/", (req, res) => {
    res.send("🎬 Movie Watchlist API is Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});