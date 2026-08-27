import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Clock, Calendar, Bookmark, Play, ArrowLeft, Check, X } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import './MovieDetail.css';
import { useAuth } from '../context/AuthContext';

const MovieDetail = () => {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerLoading, setTrailerLoading] = useState(false);

  useEffect(() => {
    if (movie && user) {
      setInWatchlist(user.watchlist?.some(m => m.tmdbId === movie.id || m._id === movie.id));
    }
  }, [movie, user]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`https://vibeflix-ai.vercel.app/api/movies/details/${id}`);
        setMovie(res.data);
      } catch (err) {
        console.error('Error fetching movie details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleWatchlist = async () => {
    if (!user) return alert('Please sign in to save movies!');
    try {
      if (inWatchlist) {
        // Find the database ID if we only have tmdbId
        const dbId = user.watchlist.find(m => m.tmdbId === movie.id || m._id === movie.id)?._id;
        await axios.delete(`https://vibeflix-ai.vercel.app/api/movies/watchlist/${dbId || movie.id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        await axios.post('https://vibeflix-ai.vercel.app/api/movies/watchlist',
          { 
            movie: {
              tmdbId: movie.id,
              title: movie.title,
              posterPath: movie.poster_path,
              backdropPath: movie.backdrop_path,
              overview: movie.overview,
              releaseDate: movie.release_date,
              voteAverage: movie.vote_average,
              genres: movie.genres
            }
          }, 
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }
      refreshUser();
    } catch (err) {
      console.error('Watchlist action failed:', err);
    }
  };

  const submitRating = async (rating) => {
    setUserRating(rating);
    if (!user) return;
    try {
      await axios.post('https://vibeflix-ai.vercel.app/api/movies/review',
        { movieId: movie.id, rating, comment: 'Rated via CineMatch UI' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (err) {
      console.error('Rating failed:', err);
    }
  };

  // Fetch YouTube trailer from TMDB /videos endpoint
  const handleWatchTrailer = useCallback(async () => {
    if (trailerKey) {
      setShowTrailer(true);
      return;
    }
    setTrailerLoading(true);
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=db05c190cd16bafcd10c7f8dc6b1c446`);
      const videos = res.data.results;
      // Prefer official trailers, then teasers, then any YouTube video
      const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer')
        || videos.find(v => v.site === 'YouTube' && v.type === 'Teaser')
        || videos.find(v => v.site === 'YouTube');
      if (trailer) {
        setTrailerKey(trailer.key);
        setShowTrailer(true);
      } else {
        alert('No trailer available for this title.');
      }
    } catch (err) {
      console.error('Failed to fetch trailer:', err);
      // Fallback: search YouTube directly
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`, '_blank');
    } finally {
      setTrailerLoading(false);
    }
  }, [id, trailerKey, movie]);

  // Close trailer modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setShowTrailer(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (loading) return <div className="loading-state container">🎬 Loading Cinematic Details...</div>;
  if (!movie) return <div className="error-state container">Movie not found.</div>;

  const backdropUrl = movie.backdrop_path?.startsWith('http') ? movie.backdrop_path : (movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200');
  const posterUrl = movie.poster_path?.startsWith('http') ? movie.poster_path : (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500');

  return (
    <div className="movie-detail-page reveal">
      {/* YouTube Trailer Modal */}
      {showTrailer && trailerKey && (
        <div className="trailer-modal-overlay" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close-btn" onClick={() => setShowTrailer(false)}>
              <X size={28} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
              title="Movie Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="trailer-iframe"
            />
          </div>
        </div>
      )}
      <div className="detail-hero">
        <div className="detail-backdrop" style={{ backgroundImage: `url(${backdropUrl})` }}>
          <div className="detail-gradient"></div>
        </div>
        
        <div className="container detail-content">
          <Link to="/" className="back-btn"><ArrowLeft size={20} /> Back to Gallery</Link>
          
          <div className="detail-main">
            <div className="detail-poster-container animate-glow">
              <img src={posterUrl} alt={movie.title} className="detail-poster" />
              <div className="quality-tag">4K ULTRA HD</div>
            </div>
            
            <div className="detail-info">
              <h1 className="detail-title">{movie.title}</h1>
              <p className="detail-tagline">{movie.tagline}</p>
              
              <div className="detail-meta">
                <span className="meta-item"><Star size={18} fill="#ffc107" color="#ffc107" /> {movie.vote_average?.toFixed(1)} <small>(Official)</small></span>
                <span className="meta-item"><Clock size={18} /> {movie.runtime} min</span>
                <span className="meta-item"><Calendar size={18} /> {movie.release_date?.substring(0, 4)}</span>
              </div>
              
              <div className="detail-genres">
                {movie.genres?.map(g => <span key={g.id} className="genre-pill">{g.name}</span>)}
              </div>
              
              <div className="detail-story">
                <h3>The Story 📖</h3>
                <p>{movie.overview}</p>
              </div>

              <div className="detail-actions">
                <button className="btn btn-primary" onClick={handleWatchTrailer} disabled={trailerLoading}>
                  <Play fill="currentColor" /> {trailerLoading ? 'Loading...' : 'Watch Trailer'}
                </button>
                <button 
                  className={`btn ${inWatchlist ? 'btn-success' : 'btn-outline'}`}
                  onClick={handleWatchlist}
                >
                  {inWatchlist ? <><Check /> In Watchlist</> : <><Bookmark /> Add to Watchlist</>}
                </button>
              </div>

              <div className="user-rating-section glass-panel">
                <h4>How would you rate this? ⭐</h4>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={28} 
                      className={userRating >= star ? 'star active' : 'star'} 
                      onClick={() => submitRating(star)}
                    />
                  ))}
                </div>
                {userRating > 0 && <p className="rating-thanks">Thanks for your rating of {userRating}/5!</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container similar-movies-section">
        <h2 className="section-title">Similar Movies You May Like 💎</h2>
        <div className="movie-grid">
          {movie.similar?.slice(0, 6).map(m => (
            <MovieCard key={m.id} movie={{
              tmdbId: m.id,
              title: m.title,
              posterPath: m.poster_path,
              voteAverage: m.vote_average,
              releaseDate: m.release_date
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
