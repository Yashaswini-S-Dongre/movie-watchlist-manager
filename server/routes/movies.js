const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");

// @route   GET /api/movies (Get all movies)
router.get("/", async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.json({ movies }); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// @route   POST /api/movies (Add a new movie)
router.post("/", async (req, res) => {
    try {
        const { title, genre, rating, status } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }

        const newMovie = new Movie({ title, genre, rating, status });
        const savedMovie = await newMovie.save();
        
        // Return exactly what React expects: { movie: { ... } }
        res.status(201).json({ movie: savedMovie }); 
    } catch (err) {
        console.error("Error saving movie:", err);
        res.status(400).json({ error: err.message });
    }
});

// @route   DELETE /api/movies/:id (Delete a movie)
router.delete("/:id", async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) return res.status(404).json({ error: "Movie not found" });
        res.json({ message: "Movie deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// @route   PUT /api/movies/:id (Update watch status)
router.put("/:id", async (req, res) => {
    try {
        const { status } = req.body;
        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        res.json({ movie: updatedMovie });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;