const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie"); // Ensure you have a Movie model!

// @route   GET /api/movies
// @desc    Get all movies in watchlist
router.get("/", async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/movies
// @desc    Add a new movie
router.post("/", async (req, res) => {
    const { title, genre } = req.body;
    const newMovie = new Movie({ title, genre });

    try {
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;