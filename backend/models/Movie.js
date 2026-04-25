const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  posterPath: String,
  backdropPath: String,
  overview: String,
  releaseDate: String,
  voteAverage: Number,
  genres: [String]
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
