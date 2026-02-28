const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, default: 'Not specified' },
  rating: { type: Number, default: null },
  status: { type: String, default: 'unwatched' } // React sends 'watched' or 'unwatched'
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);