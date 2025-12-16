const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// File to store movies persistently
const DATA_FILE = path.join(__dirname, "movies_data.json");

// Load movies from file
function loadMovies() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading movies:", error);
  }
  return [];
}

// Save movies to file
function saveMovies(movies) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(movies, null, 2));
  } catch (error) {
    console.error("Error saving movies:", error);
  }
}

let movies = loadMovies();

// GET all movies
app.get("/api/movies", (req, res) => {
  res.json({ 
    success: true,
    movies,
    count: movies.length
  });
});

// ADD a movie
app.post("/api/movies", (req, res) => {
  const { title, genre, rating, status } = req.body;

  if (!title) {
    return res.status(400).json({ 
      success: false,
      error: "Title is required" 
    });
  }

  // Validate rating if provided
  if (rating !== null && rating !== undefined && rating !== "") {
    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 10"
      });
    }
  }

  const movie = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title,
    genre: genre || "Not specified",
    rating: rating ? parseFloat(rating) : null,
    status: status || "unwatched",
    created_at: new Date().toISOString()
  };

  movies.push(movie);
  saveMovies(movies);
  
  res.status(201).json({ 
    success: true,
    message: "Movie added successfully",
    movie 
  });
});

// DELETE a movie
app.delete("/api/movies/:id", (req, res) => {
  const id = req.params.id;
  const initialLength = movies.length;
  
  movies = movies.filter((m) => m.id !== id);
  
  if (movies.length === initialLength) {
    return res.status(404).json({ 
      success: false,
      error: "Movie not found" 
    });
  }
  
  saveMovies(movies);
  res.json({ 
    success: true,
    message: "Movie deleted successfully" 
  });
});

// UPDATE movie (watch status or other fields)
app.put("/api/movies/:id", (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  let found = false;
  let updatedMovie = null;

  movies = movies.map((m) => {
    if (m.id === id) {
      found = true;
      updatedMovie = { 
        ...m, 
        ...updates,
        updated_at: new Date().toISOString()
      };
      return updatedMovie;
    }
    return m;
  });

  if (!found) {
    return res.status(404).json({ 
      success: false,
      error: "Movie not found" 
    });
  }

  saveMovies(movies);
  res.json({ 
    success: true,
    message: "Movie updated successfully",
    movie: updatedMovie
  });
});

// GET statistics
app.get("/api/movies/stats", (req, res) => {
  const total = movies.length;
  const watched = movies.filter(m => m.status === "watched").length;
  const unwatched = movies.filter(m => m.status === "unwatched").length;
  
  const ratedMovies = movies.filter(m => m.rating !== null);
  const avgRating = ratedMovies.length > 0
    ? ratedMovies.reduce((sum, m) => sum + m.rating, 0) / ratedMovies.length
    : 0;

  res.json({
    success: true,
    stats: {
      total,
      watched,
      unwatched,
      average_rating: Math.round(avgRating * 100) / 100
    }
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Movie Watchlist API is running"
  });
});

app.listen(PORT, () => {
  console.log("🎬 Movie Watchlist Manager API");
  console.log("=" .repeat(50));
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("API endpoints:");
  console.log("  GET    /api/movies        - Get all movies");
  console.log("  POST   /api/movies        - Add a new movie");
  console.log("  PUT    /api/movies/:id    - Update a movie");
  console.log("  DELETE /api/movies/:id    - Delete a movie");
  console.log("  GET    /api/movies/stats  - Get statistics");
  console.log("  GET    /api/health        - Health check");
  console.log("=" .repeat(50));
  console.log(`Loaded ${movies.length} movies from storage`);
});