const axios = require('axios');

// In-memory cache to avoid redundant TMDB API calls
const tmdbCache = new Map();

/**
 * Fetches real movie/TV data from TMDB Search API based on title.
 * Follows the strict mandatory process requested by the user.
 */
const fetchTMDBData = async (title) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.warn('TMDB_API_KEY is missing. Using fallback for:', title);
    return null;
  }
  
  if (tmdbCache.has(title)) return tmdbCache.get(title);

  try {
    // 2. Send a request to TMDB Search API (multi search to handle both movies and TV)
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
    const response = await axios.get(searchUrl);
    const results = response.data.results;
    
    // 3. Pick the FIRST valid result with a poster
    const bestMatch = results.find(r => r.poster_path);
    
    if (bestMatch) {
      const data = {
        tmdbId: bestMatch.id,
        title: bestMatch.title || bestMatch.name,
        // 4. Build poster image URL
        poster_path: `https://image.tmdb.org/t/p/w500${bestMatch.poster_path}`,
        backdrop_path: bestMatch.backdrop_path ? `https://image.tmdb.org/t/p/original${bestMatch.backdrop_path}` : null,
        vote_average: bestMatch.vote_average,
        release_date: bestMatch.release_date || bestMatch.first_air_date,
        overview: bestMatch.overview
      };
      tmdbCache.set(title, data);
      return data;
    }
    return null;
  } catch (error) {
    console.error(`TMDB Search Error for "${title}":`, error.message);
    return null;
  }
};

const collections = {
  trending_series: ['The Boys', 'Daredevil', 'Monarch: Legacy of Monsters'],
  trending_movies: ['The Fall Guy', 'La La Land', 'Wrath of the Titans']
};

/**
 * Enriches a list of titles with real TMDB metadata.
 */
const enrichCollection = async (titles) => {
  return Promise.all(titles.map(async (title) => {
    const data = await fetchTMDBData(title);
    if (data) return data;
    
    // Fallback placeholder (ONLY if no result found or poster_path is null)
    return {
      tmdbId: Math.random().toString(36).substr(2, 9),
      title: title,
      poster_path: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500&auto=format&fit=crop',
      vote_average: 0,
      release_date: '2026-01-01'
    };
  }));
};

exports.getTrending = async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (apiKey) {
      // Fetch actual trending movies from TMDB
      const response = await axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`);
      const enriched = response.data.results.map(m => ({
        ...m,
        tmdbId: m.id,
        poster_path: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        backdrop_path: `https://image.tmdb.org/t/p/original${m.backdrop_path}`,
        vote_average: m.vote_average,
        release_date: m.release_date || m.first_air_date
      }));
      return res.json(enriched);
    }
    
    // Fallback to searching our curated titles
    const fallback = await enrichCollection([...collections.trending_series, ...collections.trending_movies]);
    res.json(fallback);
  } catch (error) {
    res.json([]);
  }
};

exports.getCollections = async (req, res) => {
  const enriched = {};
  for (const [key, titles] of Object.entries(collections)) {
    enriched[key] = await enrichCollection(titles);
  }
  res.json(enriched);
};

exports.getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = process.env.TMDB_API_KEY;
    
    if (!apiKey) {
      const all = await enrichCollection([...collections.trending_series, ...collections.trending_movies]);
      const movie = all.find(m => m.tmdbId == id) || all[0];
      return res.json({ ...movie, similar: all.filter(m => m.tmdbId != id).slice(0, 10) });
    }

    const [details, similar] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`),
      axios.get(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${apiKey}`)
    ]);

    const enrichedDetails = {
      ...details.data,
      tmdbId: details.data.id,
      poster_path: `https://image.tmdb.org/t/p/w500${details.data.poster_path}`,
      backdrop_path: `https://image.tmdb.org/t/p/original${details.data.backdrop_path}`,
      similar: similar.data.results.map(m => ({
        ...m,
        tmdbId: m.id,
        poster_path: `https://image.tmdb.org/t/p/w500${m.poster_path}`
      }))
    };

    res.json(enrichedDetails);
  } catch (error) {
    res.status(404).json({ error: 'Movie not found' });
  }
};

exports.addToWatchlist = async (req, res) => {
  try {
    const { movie } = req.body;
    const User = require('../models/User');
    const Movie = require('../models/Movie');

    let dbMovie = await Movie.findOne({ tmdbId: movie.tmdbId });
    if (!dbMovie) {
      dbMovie = new Movie({
        tmdbId: movie.tmdbId,
        title: movie.title,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        overview: movie.overview,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average,
        genres: movie.genres?.map(g => g.name) || []
      });
      await dbMovie.save();
    }

    const user = await User.findById(req.user.id);
    if (!user.watchlist.includes(dbMovie._id)) {
      user.watchlist.push(dbMovie._id);
      await user.save();
    }
    res.json(user.watchlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await require('../models/User').findById(req.user.id);
    user.watchlist = user.watchlist.filter(id => id.toString() !== movieId);
    await user.save();
    res.json(user.watchlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const review = new (require('../models/Review'))({
      user: req.user.id,
      movie: movieId,
      rating,
      comment
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMovieReviews = async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const reviews = await require('../models/Review').find({ movie: tmdbId }).populate('user', 'username');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
