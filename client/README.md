# 🎬 Universal Movie Watchlist Manager

A professional **MERN Stack** application that allows users to search millions of Movies and TV Shows across all languages and manage a personal watchlist.

Powered by **TMDb (The Movie Database)**, this app features real-time search suggestions and high-quality movie posters.

---

## 🚀 Features

### 🌍 Global Multi-Search
Search for movies and TV shows in any language using TMDb API integration.

### ⚡ Dynamic Autocomplete
Real-time search suggestions with:
- Release years
- Mini-previews
- Instant dropdown results

### 🖼️ Poster Gallery
Automatically fetches and saves high-resolution posters to your personal database.

### 📌 Watchlist Management
- Add movies
- Delete movies
- Toggle "Watched / Unwatched" status with a single click

### 📱 Responsive UI
- Mobile-friendly design
- CSS gradients
- Hover effects
- Clean card layout

### 🔔 Notification System
Real-time success and error alerts for all database actions.

---

## 🛠️ Tech Stack

### Frontend
- React.js  
- Axios  
- CSS3 (Grid & Flexbox)

### Backend
- Node.js  
- Express.js  

### Database
- MongoDB (via Mongoose)

### API
- TMDb (The Movie Database)

---

## 📂 Project Structure

```
MOVIE-WATCHLIST-MANAGER/
│
├── client/                 # React Frontend
│   ├── public/             # Static files (index.html)
│   ├── src/
│   │   ├── App.js          # Main logic & Search Engine
│   │   ├── App.css         # Custom styling & animations
│   │   └── index.js        # React Entry point
│   └── package.json        # Frontend dependencies
│
├── server/                 # Node/Express Backend
│   ├── models/
│   │   └── Movie.js        # Mongoose Schema (Title, Genre, PosterUrl)
│   ├── routes/
│   │   ├── movies.js       # CRUD API Routes
│   │   └── auth.js         # Authentication placeholder
│   ├── .env                # Environment variables (Mongo URI & TMDb Key)
│   ├── server.js           # Main Express server file
│   └── package.json        # Backend dependencies
│
└── README.md
```

---

## ⚙️ Setup & Installation

### 1️⃣ Prerequisite: TMDb API Key

Get a free API key from **The Movie Database (TMDb)**.

Open:

```
client/src/App.js
```

Add your key:

```javascript
const TMDB_API_KEY = "your_key_here";
```

---

### 2️⃣ Environment Variables

Create a `.env` file inside the `server` folder:

```
MONGO_URI=mongodb://127.0.0.1:27017/movieApp
PORT=5000
```

---

### 3️⃣ Installation

Open two terminals.

#### Terminal 1 — Backend

```bash
cd server
npm install
node server.js
```

#### Terminal 2 — Frontend

```bash
cd client
npm install
npm start
```

---

## 📖 API Endpoints

| Method | Endpoint           | Description                                      |
|--------|-------------------|--------------------------------------------------|
| GET    | /api/movies        | Fetch all movies from your database             |
| POST   | /api/movies        | Save a new movie (including Poster URL)         |
| PUT    | /api/movies/:id    | Toggle watched/unwatched status                 |
| DELETE | /api/movies/:id    | Remove a movie from the database                |

---

## 📝 Usage Tips

- **Real-time Search:** Type at least 3 characters to trigger TMDb global search.
- **Poster Loading:** Click a movie from the dropdown list to automatically fetch its official poster.
- **Status Toggle:** Use the "Mark Watched" button to categorize films; card color updates automatically.
- **Instant Updates:** Watchlist changes reflect immediately with notifications.

---
```