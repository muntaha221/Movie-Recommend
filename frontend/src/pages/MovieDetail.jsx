import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Clock, Calendar, Bookmark, Play, ArrowLeft, Check, X, Sparkles, ExternalLink } from 'lucide-react';
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
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (movie && user) {
      setInWatchlist(user.watchlist?.some(m => m.tmdbId === (movie.tmdbId || movie.id) || m._id === movie.id));
    }
  }, [movie, user]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/movies/details/${id}`);
        setMovie(res.data);
      } catch (err) {
        console.error('Error fetching movie details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleWatchlist = async () => {
    if (!user) return alert('Please sign in to save titles to your watchlist!');
    try {
      const targetId = movie.tmdbId || movie.id;
      if (inWatchlist) {
        const dbId = user.watchlist.find(m => m.tmdbId === targetId || m._id === targetId)?._id;
        await axios.delete(`/api/movies/watchlist/${dbId || targetId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        await axios.post(
          '/api/movies/watchlist',
          {
            movie: {
              tmdbId: targetId,
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
      await axios.post(
        '/api/movies/review',
        { movieId: movie.tmdbId || movie.id, rating, comment: 'Rated via Vibeflix UI' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (err) {
      console.error('Rating failed:', err);
    }
  };

  // Find trailer key from backend videos or search fallback
  const trailerVideo = movie?.videos?.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || movie?.videos?.[0];
  const trailerKey = trailerVideo?.key;

  const handleWatchTrailer = () => {
    if (trailerKey) {
      setShowTrailer(true);
    } else {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent((movie?.title || 'movie') + ' official trailer')}`, '_blank');
    }
  };

  if (loading) {
    return <div className="loading-state container">🎬 Loading Cinematic Details...</div>;
  }
  if (!movie) {
    return (
      <div className="error-state container">
        <h2>Title Not Found</h2>
        <Link to="/" className="back-btn"><ArrowLeft size={18} /> Back to Gallery</Link>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200';
  const posterUrl = movie.poster_path || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500';
  const releaseYear = (movie.release_date || '2026').substring(0, 4);

  return (
    <div className="movie-detail-page reveal">
      {/* YouTube Trailer Modal */}
      {showTrailer && trailerKey && (
        <div className="trailer-modal-overlay" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close-btn" onClick={() => setShowTrailer(false)}>
              <X size={26} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
              title="Trailer"
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
          <Link to="/" className="back-btn"><ArrowLeft size={18} /> Back to Gallery</Link>
          
          <div className="detail-main">
            <div className="detail-poster-container animate-glow">
              <img src={posterUrl} alt={movie.title} className="detail-poster" />
              <div className="quality-tag">{movie.media_type === 'tv' ? 'WEB SERIES' : '4K ULTRA HD'}</div>
            </div>
            
            <div className="detail-info">
              <h1 className="detail-title">{movie.title}</h1>
              {movie.tagline && <p className="detail-tagline">"{movie.tagline}"</p>}
              
              <div className="detail-meta">
                <span className="meta-item"><Star size={17} fill="#ffc107" color="#ffc107" /> {Number(movie.vote_average || 7.5).toFixed(1)}</span>
                {movie.runtime ? <span className="meta-item"><Clock size={17} /> {movie.runtime} min</span> : null}
                <span className="meta-item"><Calendar size={17} /> {releaseYear}</span>
                <span className="meta-item-type">{movie.media_type === 'tv' ? 'TV Series' : 'Movie'}</span>
              </div>
              
              <div className="detail-genres">
                {movie.genres?.map(g => (
                  <span key={g.id || g} className="genre-pill">
                    {typeof g === 'string' ? g : g.name}
                  </span>
                ))}
              </div>
              
              <div className="detail-story">
                <h3>Storyline 📖</h3>
                <p>{movie.overview || 'No synopsis provided for this title yet.'}</p>
              </div>

              <div className="detail-actions">
                <button className="btn btn-primary" onClick={handleWatchTrailer}>
                  <Play fill="currentColor" size={18} /> Watch Trailer
                </button>
                <button
                  className="btn btn-watch-online"
                  onClick={() => window.open(`https://watch-v2.autoembed.app/search?q=${encodeURIComponent(movie.title || '')}`, '_blank')}
                >
                  <ExternalLink size={18} /> Watch / Download
                </button>
                <button 
                  className={`btn ${inWatchlist ? 'btn-success' : 'btn-outline'}`}
                  onClick={handleWatchlist}
                >
                  {inWatchlist ? <><Check size={18} /> In Watchlist</> : <><Bookmark size={18} /> Add to Watchlist</>}
                </button>
              </div>

              <div className="user-rating-section glass-panel">
                <h4>Rate this title ⭐</h4>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={26} 
                      className={userRating >= star ? 'star active' : 'star'} 
                      onClick={() => submitRating(star)}
                    />
                  ))}
                </div>
                {userRating > 0 && <p className="rating-thanks">You rated this {userRating} / 5 stars!</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Relevant Recommendations / Related Universe */}
      {movie.similar && movie.similar.length > 0 && (
        <div className="container similar-movies-section">
          <div className="similar-header">
            <Sparkles size={20} color="#e50914" />
            <h2 className="section-title">Related & Franchise Recommendations</h2>
          </div>
          <div className="movie-grid">
            {movie.similar.slice(0, 10).map((m, idx) => (
              <MovieCard key={m.tmdbId || m.id || idx} movie={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
