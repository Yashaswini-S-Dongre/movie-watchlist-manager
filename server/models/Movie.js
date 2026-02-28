const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, default: 'Not specified' },
  rating: { type: Number, default: null },
  status: { type: String, default: 'unwatched' },
  posterUrl: { type: String, default: '' } // 📸 NEW: Saves the image link!
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);