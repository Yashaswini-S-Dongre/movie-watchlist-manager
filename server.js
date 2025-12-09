const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let movies = [];
let nextId = 1;

// GET all movies
app.get("/api/movies", (req, res) => {
  res.json({ movies });
});

// ADD a movie
app.post("/api/movies", (req, res) => {
  const { title, genre, rating, status } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const movie = {
    id: nextId++,
    title,
    genre: genre || "Unknown",
    rating: rating || null,
    status: status || "unwatched"
  };

  movies.push(movie);
  res.json({ movie });
});

// DELETE a movie
app.delete("/api/movies/:id", (req, res) => {
  const id = parseInt(req.params.id);
  movies = movies.filter((m) => m.id !== id);
  res.json({ message: "deleted" });
});

// UPDATE movie (watch status)
app.put("/api/movies/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;

  let found = false;

  movies = movies.map((m) => {
    if (m.id === id) {
      found = true;
      return { ...m, ...updates };
    }
    return m;
  });

  if (!found) return res.status(404).json({ error: "Movie not found" });

  res.json({ message: "updated" });
});

app.listen(PORT, () => {
  console.log("🎬 Backend running at http://localhost:5000/api/movies");
});
