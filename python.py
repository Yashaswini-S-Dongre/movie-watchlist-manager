from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import uuid
from datetime import datetime

app = Flask(_name_)
CORS(app)

# In-memory database (you can replace with actual database)
movies_db = []

def save_to_file():
    """Save movies to JSON file for persistence"""
    try:
        with open('movies_data.json', 'w') as f:
            json.dump(movies_db, f, indent=2)
    except Exception as e:
        print(f"Error saving to file: {e}")

def load_from_file():
    """Load movies from JSON file"""
    try:
        with open('movies_data.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    except Exception as e:
        print(f"Error loading from file: {e}")
        return []

# Load existing data on startup
movies_db = load_from_file()

@app.route('/api/movies', methods=['GET'])
def get_movies():
    """Get all movies"""
    return jsonify({
        'success': True,
        'movies': movies_db,
        'count': len(movies_db)
    })

@app.route('/api/movies', methods=['POST'])
def add_movie():
    """Add a new movie"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({'success': False, 'error': 'Title is required'}), 400
        
        # Create new movie object
        movie = {
            'id': str(uuid.uuid4()),
            'title': data['title'],
            'genre': data.get('genre', 'Not specified'),
            'rating': data.get('rating'),
            'status': data.get('status', 'unwatched'),
            'created_at': datetime.now().isoformat()
        }
        
        # Validate rating if provided
        if movie['rating'] is not None:
            try:
                rating = float(movie['rating'])
                if rating < 1 or rating > 10:
                    return jsonify({'success': False, 'error': 'Rating must be between 1 and 10'}), 400
                movie['rating'] = rating
            except (ValueError, TypeError):
                return jsonify({'success': False, 'error': 'Invalid rating format'}), 400
        
        # Validate status
        if movie['status'] not in ['watched', 'unwatched']:
            return jsonify({'success': False, 'error': 'Status must be "watched" or "unwatched"'}), 400
        
        movies_db.append(movie)
        save_to_file()
        
        return jsonify({
            'success': True,
            'message': 'Movie added successfully',
            'movie': movie
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/movies/<movie_id>', methods=['PUT'])
def update_movie(movie_id):
    """Update a movie's status or other fields"""
    try:
        data = request.get_json()
        
        # Find the movie
        movie = next((m for m in movies_db if m['id'] == movie_id), None)
        
        if not movie:
            return jsonify({'success': False, 'error': 'Movie not found'}), 404
        
        # Update fields
        if 'status' in data:
            if data['status'] not in ['watched', 'unwatched']:
                return jsonify({'success': False, 'error': 'Status must be "watched" or "unwatched"'}), 400
            movie['status'] = data['status']
        
        if 'title' in data:
            movie['title'] = data['title']
        
        if 'genre' in data:
            movie['genre'] = data['genre']
        
        if 'rating' in data:
            if data['rating'] is not None:
                try:
                    rating = float(data['rating'])
                    if rating < 1 or rating > 10:
                        return jsonify({'success': False, 'error': 'Rating must be between 1 and 10'}), 400
                    movie['rating'] = rating
                except (ValueError, TypeError):
                    return jsonify({'success': False, 'error': 'Invalid rating format'}), 400
            else:
                movie['rating'] = None
        
        movie['updated_at'] = datetime.now().isoformat()
        save_to_file()
        
        return jsonify({
            'success': True,
            'message': 'Movie updated successfully',
            'movie': movie
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/movies/<movie_id>', methods=['DELETE'])
def delete_movie(movie_id):
    """Delete a movie"""
    try:
        global movies_db
        
        # Find the movie
        movie = next((m for m in movies_db if m['id'] == movie_id), None)
        
        if not movie:
            return jsonify({'success': False, 'error': 'Movie not found'}), 404
        
        # Remove the movie
        movies_db = [m for m in movies_db if m['id'] != movie_id]
        save_to_file()
        
        return jsonify({
            'success': True,
            'message': 'Movie deleted successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/movies/stats', methods=['GET'])
def get_stats():
    """Get statistics about movies"""
    try:
        total = len(movies_db)
        watched = len([m for m in movies_db if m['status'] == 'watched'])
        unwatched = len([m for m in movies_db if m['status'] == 'unwatched'])
        
        # Calculate average rating
        rated_movies = [m for m in movies_db if m['rating'] is not None]
        avg_rating = sum(m['rating'] for m in rated_movies) / len(rated_movies) if rated_movies else 0
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total,
                'watched': watched,
                'unwatched': unwatched,
                'average_rating': round(avg_rating, 2)
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Movie Watchlist API is running'
    })

if _name_ == '_main_':
    print("🎬 Movie Watchlist Manager API")
    print("=" * 50)
    print("Server running on http://localhost:5000")
    print("API endpoints:")
    print("  GET    /api/movies        - Get all movies")
    print("  POST   /api/movies        - Add a new movie")
    print("  PUT    /api/movies/<id>   - Update a movie")
    print("  DELETE /api/movies/<id>   - Delete a movie")
    print("  GET    /api/movies/stats  - Get statistics")
    print("  GET    /api/health        - Health check")
    print("=" * 50)
    
    app.run(debug=True, port=5000)
