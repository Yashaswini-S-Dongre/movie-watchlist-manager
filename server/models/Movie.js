const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    genre: String,
    rating: Number,
    status: { type: String, default: "unwatched" }
}, { timestamps: true });

module.exports = mongoose.model("Movie", movieSchema);