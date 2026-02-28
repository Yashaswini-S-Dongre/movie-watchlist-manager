const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");

router.get("/", async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.json({ movies }); 
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

router.post("/", async (req, res) => {
    try {
        // 📸 NEW: We added posterUrl here
        const { title, genre, rating, status, posterUrl } = req.body;
        
        if (!title) return res.status(400).json({ error: "Title is required" });

        const newMovie = new Movie({ title, genre, rating, status, posterUrl });
        const savedMovie = await newMovie.save();
        
        res.status(201).json({ movie: savedMovie }); 
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) return res.status(404).json({ error: "Movie not found" });
        res.json({ message: "Movie deleted" });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { status } = req.body;
        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id, { status }, { new: true }
        );
        res.json({ movie: updatedMovie });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;