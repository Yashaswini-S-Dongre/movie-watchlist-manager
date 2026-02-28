import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api";

// 🔑 PASTE YOUR FREE TMDB API KEY HERE
const TMDB_API_KEY = "d390103265b89006fa92326dcf8e87a8"; 

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", 
  "Documentary", "Drama", "Fantasy", "Horror", "Mystery", 
  "Romance", "Sci-Fi", "Thriller", "Western", "Anime", "K-Drama"
];

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [formData, setFormData] = useState({
    title: "",
    genre: "", 
    rating: "",
    status: "unwatched",
  });
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "", show: false });

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification({ message: "", type: "", show: false }), 3000);
  };

  const fetchMovies = async () => {
    try {
      const res = await axios.get(`${API_URL}/movies`);
      if (res.data && Array.isArray(res.data.movies)) {
        setMovies(res.data.movies);
      } else if (Array.isArray(res.data)) {
        setMovies(res.data);
      } else {
        setMovies([]);
      }
    } catch (err) {
      showNotification("Could not connect to the backend server.", "error");
    }
  };

  // 🌍 THE NEW MAGIC: Live Multi-Search from TMDb API (Movies + TV + All Languages)
  const handleTitleChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, title: value });

    if (value.length > 2) {
      try {
        const res = await axios.get(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${value}`);
        
        if (res.data.results && res.data.results.length > 0) {
          // Filter out actors/people, keep only movies and TV shows
          const mediaResults = res.data.results.filter(
            item => item.media_type === 'movie' || item.media_type === 'tv'
          ).slice(0, 6); // Grab top 6 results

          const formattedSuggestions = mediaResults.map(item => {
            // TMDb uses 'title' for movies and 'name' for TV shows
            const title = item.media_type === 'movie' ? item.title : item.name;
            const date = item.media_type === 'movie' ? item.release_date : item.first_air_date;
            const year = date ? date.substring(0, 4) : "N/A";
            const type = item.media_type === 'movie' ? "Movie" : "TV Show";
            
            return `${title} (${year}) - ${type}`;
          });

          setSuggestions(formattedSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error("TMDb API Error:", err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestionString) => {
    // Extracts just the title before the "(Year)" part
    const cleanTitle = suggestionString.split(' (')[0];
    setFormData({ ...formData, title: cleanTitle });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!formData.title) return;
    if (!formData.genre) {
      showNotification("Please select a genre!", "error");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/movies`, formData);
      const addedMovie = res.data?.movie || res.data;

      if (addedMovie && addedMovie._id) {
        setMovies((prev) => [...prev, addedMovie]);
        setFormData({ title: "", genre: "", rating: "", status: "unwatched" });
        showNotification("Added successfully!", "success");
      } else {
        fetchMovies();
      }
    } catch (err) {
      showNotification(err.response?.data?.error || "Error adding to list.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this from your list?")) return;
    try {
      await axios.delete(`${API_URL}/movies/${id}`);
      setMovies((prev) => prev.filter((m) => m._id !== id && m.id !== id));
      showNotification("Deleted successfully!", "success");
    } catch (err) {
      showNotification("Error deleting.", "error");
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === "watched" ? "unwatched" : "watched";
    const itemId = item._id || item.id;
    try {
      await axios.put(`${API_URL}/movies/${itemId}`, { status: newStatus });
      setMovies((prev) =>
        prev.map((m) => ((m._id || m.id) === itemId ? { ...m, status: newStatus } : m))
      );
      showNotification(`Marked as ${newStatus}!`, "success");
    } catch (err) {
      showNotification("Error updating status.", "error");
    }
  };

  const safeMovies = Array.isArray(movies) ? movies : [];
  const filteredMovies = safeMovies.filter((movie) => {
    if (!movie || !movie.title) return false;
    const matchesStatus = filterStatus === "all" || movie.status === filterStatus;
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container">
      <div className={`notification ${notification.type} ${notification.show ? 'show' : ''}`}>
        {notification.message}
      </div>

      <header>
        <h1>🎬 Universal Watchlist</h1>
        <p className="subtitle">Movies, TV Shows, Anime, and International Drama</p>
      </header>

      {/* ADD SECTION */}
      <div className="add-movie-section">
        <h2>Add to Watchlist</h2>
        <form onSubmit={handleAddMovie} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-start" }}>
          
          <div className="autocomplete-container" style={{ position: 'relative', flex: "1", minWidth: "200px" }}>
            <input
              type="text"
              placeholder="Type any Movie or TV Show..."
              value={formData.title}
              onChange={handleTitleChange}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
              onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true) }}
              required
              style={{ width: "100%", padding: "12px", border: "2px solid #e0e0e0", borderRadius: "8px" }}
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list" style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #ccc", zIndex: 10, listStyle: "none", padding: 0, margin: 0, borderRadius: "0 0 8px 8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                {suggestions.map((suggestion, index) => (
                  <li 
                    key={index} 
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee" }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ flex: "1", minWidth: "150px" }}>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              required
              style={{ width: "100%", padding: "12px", border: "2px solid #e0e0e0", borderRadius: "8px" }}
            >
              <option value="" disabled>Select Genre</option>
              {GENRES.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: "1", minWidth: "150px" }}>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{ width: "100%", padding: "12px", border: "2px solid #e0e0e0", borderRadius: "8px" }}
            >
              <option value="unwatched">Unwatched</option>
              <option value="watched">Watched</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "auto" }}>
            Add
          </button>
        </form>
      </div>

      {/* FILTER SECTION */}
      <div className="filter-section">
        <h2>Filter & Search</h2>
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search your watchlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Content</option>
            <option value="watched">Watched</option>
            <option value="unwatched">Unwatched</option>
          </select>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="movies-section">
        <h2>Your Watchlist ({filteredMovies.length})</h2>
        
        {filteredMovies.length === 0 ? (
          <div className="empty-state">Nothing here yet. Search for a show or movie above!</div>
        ) : (
          <div className="movies-grid">
            {filteredMovies.map((movie) => (
              <div key={movie._id || Math.random()} className={`movie-card ${movie.status}`}>
                <div className="movie-title">{movie.title}</div>
                <div className="movie-info">
                  <p><strong>Genre:</strong> {movie.genre}</p>
                  <p>
                    <strong>Status:</strong> 
                    <span className={`status-badge ${movie.status}`}>
                      {movie.status}
                    </span>
                  </p>
                </div>
                <div className="movie-actions">
                  <button 
                    className={`btn ${movie.status === 'watched' ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => handleToggleStatus(movie)}
                  >
                    {movie.status === 'watched' ? 'Mark Unwatched' : 'Mark Watched'}
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(movie._id || movie.id)} 
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;