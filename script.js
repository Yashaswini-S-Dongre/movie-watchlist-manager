// JavaScript logic for Movie Watchlist Manager

const API_URL = 'http://localhost:5000/api';

let movies = [];
let filteredMovies = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadMovies();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('addMovieForm').addEventListener('submit', addMovie);
    document.getElementById('filterStatus').addEventListener('change', filterMovies);
    document.getElementById('searchMovie').addEventListener('input', filterMovies);
}

async function loadMovies() {
    try {
        const response = await fetch(`${API_URL}/movies`);
        const data = await response.json();
        movies = data.movies || [];
        filteredMovies = movies;
        renderMovies();
        showNotification('Movies loaded successfully!', 'success');
    } catch (error) {
        console.error('Error loading movies:', error);
        showNotification('Error loading movies', 'error');
    }
}

async function addMovie(e) {
    e.preventDefault();
    
    const title = document.getElementById('movieTitle').value.trim();
    const genre = document.getElementById('movieGenre').value.trim();
    const rating = document.getElementById('movieRating').value;
    const status = document.getElementById('watchStatus').value;
    
    if (!title) {
        showNotification('Please enter a movie title', 'error');
        return;
    }
    
    const movie = {
        title,
        genre: genre || 'Not specified',
        rating: rating ? parseFloat(rating) : null,
        status
    };
    
    try {
        const response = await fetch(`${API_URL}/movies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movie)
        });

        const data = await response.json();
        
        if (response.ok) {
            movies.push(data.movie);
            filteredMovies = movies;
            renderMovies();
            document.getElementById('addMovieForm').reset();
            showNotification('Movie added successfully!', 'success');
        } else {
            showNotification(data.error || 'Error adding movie', 'error');
        }
    } catch (error) {
        console.error('Error adding movie:', error);
        showNotification('Error adding movie (Check server)', 'error');
    }
}

async function deleteMovie(id) {
    if (!confirm('Are you sure you want to delete this movie?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/movies/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            movies = movies.filter(m => m.id !== id);
            filteredMovies = filteredMovies.filter(m => m.id !== id);
            renderMovies();
            showNotification('Movie deleted successfully!', 'success');
        } else {
            showNotification('Error deleting movie', 'error');
        }
    } catch (error) {
        console.error('Error deleting movie:', error);
        showNotification('Error deleting movie', 'error');
    }
}

async function toggleWatchStatus(id) {
    const movie = movies.find(m => m.id === id);
    if (!movieName) {
                        showNotification("Movie name cannot be empty", "error");
                        return;
                    }

    
    const newStatus = movie.status === 'watched' ? 'unwatched' : 'watched';
    
    try {
        const response = await fetch(`${API_URL}/movies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            movie.status = newStatus;
            filterMovies();
            renderMovies();
            showNotification(`Marked as ${newStatus}!`, 'success');
        } else {
            showNotification(data.error || 'Error updating movie', 'error');
        }
    } catch (error) {
        console.error('Error updating movie:', error);
        showNotification('Error updating movie', 'error');
    }
}

function filterMovies() {
    const statusFilter = document.getElementById('filterStatus').value;
    const searchTerm = document.getElementById('searchMovie').value.toLowerCase();
    
    filteredMovies = movies.filter(movie => {
        const matchesStatus = statusFilter === 'all' || movie.status === statusFilter;
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        return matchesStatus && matchesSearch;
    });
    
    renderMovies();
}

function renderMovies() {
    const moviesList = document.getElementById('moviesList');
    const emptyState = document.getElementById('emptyState');
    const movieCount = document.getElementById('movieCount');
    
    movieCount.textContent = filteredMovies.length;
    
    if (filteredMovies.length === 0) {
        moviesList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    moviesList.style.display = 'grid';
    emptyState.style.display = 'none';
    
    moviesList.innerHTML = filteredMovies.map(movie => `
        <div class="movie-card ${movie.status}">
            <div class="movie-title">${escapeHtml(movie.title)}</div>
            <div class="movie-info">
                <p><strong>Genre:</strong> ${escapeHtml(movie.genre)}</p>
                ${movie.rating 
                    ? `<p><strong>Rating:</strong> <span class="rating-display">⭐ ${movie.rating}/10</span></p>` 
                    : ''}
                <p><strong>Status:</strong> <span class="status-badge ${movie.status}">${movie.status}</span></p>
            </div>
            <div class="movie-actions">
                <button class="btn ${movie.status === 'watched' ? 'btn-danger' : 'btn-success'}" 
                        onclick="toggleWatchStatus('${movie.id}')">
                    ${movie.status === 'watched' ? 'Mark Unwatched' : 'Mark Watched'}
                </button>
                <button class="btn btn-danger" onclick="deleteMovie('${movie.id}')">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}
// Show success or error notification to user
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}