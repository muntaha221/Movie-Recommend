const axios = require('axios');

// In-memory cache to avoid redundant TMDB API calls
const tmdbCache = new Map();

/**
 * Format TMDB item (handles both Movie and TV objects)
 */
const formatTMDBItem = (item) => {
  if (!item) return null;
  const isTv = !item.title && !!item.name;
  return {
    id: item.id,
    tmdbId: item.id,
    title: item.title || item.name || 'Untitled',
    poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
    posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
    vote_average: item.vote_average || 7.0,
    voteAverage: item.vote_average || 7.0,
    release_date: item.release_date || item.first_air_date || '2026',
    releaseDate: item.release_date || item.first_air_date || '2026',
    overview: item.overview || '',
    media_type: item.media_type || (isTv ? 'tv' : 'movie'),
    genre_ids: item.genre_ids || []
  };
};

/**
 * Fetches real movie/TV data from TMDB Search API based on title.
 */
const fetchTMDBData = async (title) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;
  if (tmdbCache.has(title)) return tmdbCache.get(title);

  try {
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(title)}`;
    const response = await axios.get(searchUrl);
    const results = response.data.results || [];
    const bestMatch = results.find(r => r.poster_path);
    
    if (bestMatch) {
      const data = formatTMDBItem(bestMatch);
      tmdbCache.set(title, data);
      return data;
    }
    return null;
  } catch (error) {
    console.error(`TMDB Search Error for "${title}":`, error.message);
    return null;
  }
};

/**
 * GET /api/movies/trending
 * Returns trending global movies & TV for hero banner and top row
 */
exports.getTrending = async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (apiKey) {
      const response = await axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`);
      const enriched = (response.data.results || [])
        .filter(m => m.poster_path)
        .map(formatTMDBItem);
      return res.json(enriched);
    }
    res.json([]);
  } catch (error) {
    console.error('getTrending error:', error.message);
    res.json([]);
  }
};

/**
 * GET /api/movies/collections
 * Dynamic real-time categories: Trending TV Series, Trending Movies, Latest Releases, Top Rated, Bollywood Hits, Popular Anime
 */
exports.getCollections = async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.json({});
    }

    const [seriesRes, moviesRes, latestRes, topRatedRes, bollywoodRes, animeRes] = await Promise.allSettled([
      axios.get(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`),
      axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`),
      axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}`),
      axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}`),
      axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=hi&sort_by=popularity.desc`),
      axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=16&sort_by=popularity.desc`)
    ]);

    const formatResults = (resPromise) => {
      if (resPromise.status === 'fulfilled' && resPromise.value.data?.results) {
        return resPromise.value.data.results.filter(m => m.poster_path).map(formatTMDBItem);
      }
      return [];
    };

    const enriched = {
      trending_series: formatResults(seriesRes),
      trending_movies: formatResults(moviesRes),
      latest_releases: formatResults(latestRes),
      top_rated: formatResults(topRatedRes),
      bollywood_hits: formatResults(bollywoodRes),
      popular_anime: formatResults(animeRes)
    };

    res.json(enriched);
  } catch (error) {
    console.error('getCollections error:', error.message);
    res.json({});
  }
};

/**
 * GET /api/movies/by-genre/:genreId
 * Returns dynamic movies/series by TMDB Genre ID
 */
exports.getByGenre = async (req, res) => {
  try {
    const { genreId } = req.params;
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return res.json([]);

    let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc`;
    if (genreId === 'series' || genreId === 'tv') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&sort_by=popularity.desc`;
    } else if (genreId === 'bollywood') {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=hi&sort_by=popularity.desc`;
    } else if (genreId === 'hollywood') {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=en&sort_by=popularity.desc`;
    } else if (genreId === 'anime') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=16&sort_by=popularity.desc`;
    }

    const response = await axios.get(url);
    const results = (response.data.results || []).filter(m => m.poster_path).map(formatTMDBItem);
    res.json(results);
  } catch (error) {
    console.error('getByGenre error:', error.message);
    res.json([]);
  }
};

/**
 * GET /api/movies/details/:id
 * Fetches details + similar + videos for movie or TV show
 */
exports.getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = process.env.TMDB_API_KEY;
    
    if (!apiKey) {
      return res.status(404).json({ error: 'TMDB API key not configured' });
    }

    // Try fetching movie details first
    let isTv = false;
    let details, similar, videos;

    try {
      [details, similar, videos] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`),
        axios.get(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${apiKey}`),
        axios.get(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`).catch(() => ({ data: { results: [] } }))
      ]);
    } catch (movieErr) {
      // If movie fails (e.g. 404), try TV endpoint
      isTv = true;
      [details, similar, videos] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`),
        axios.get(`https://api.themoviedb.org/3/tv/${id}/similar?api_key=${apiKey}`),
        axios.get(`https://api.themoviedb.org/3/tv/${id}/videos?api_key=${apiKey}`).catch(() => ({ data: { results: [] } }))
      ]);
    }

    const raw = details.data;
    const enrichedDetails = {
      ...raw,
      id: raw.id,
      tmdbId: raw.id,
      title: raw.title || raw.name,
      media_type: isTv ? 'tv' : 'movie',
      release_date: raw.release_date || raw.first_air_date,
      poster_path: raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null,
      backdrop_path: raw.backdrop_path ? `https://image.tmdb.org/t/p/original${raw.backdrop_path}` : null,
      videos: videos?.data?.results || [],
      similar: (similar?.data?.results || []).filter(m => m.poster_path).map(formatTMDBItem)
    };

    res.json(enrichedDetails);
  } catch (error) {
    console.error('getMovieDetails error:', error.message);
    res.status(404).json({ error: 'Media not found' });
  }
};

/**
 * Watchlist & Reviews logic
 */
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
        posterPath: movie.poster_path || movie.posterPath,
        backdropPath: movie.backdrop_path || movie.backdropPath,
        overview: movie.overview,
        releaseDate: movie.release_date || movie.releaseDate,
        voteAverage: movie.vote_average || movie.voteAverage,
        genres: movie.genres?.map(g => (typeof g === 'string' ? g : g.name)) || []
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

