import React from 'react';
import { Link } from 'react-router-dom';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const getPosterUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500&auto=format&fit=crop';
    if (path.startsWith('http')) return path;
    
    // Fallback for relative TMDB paths if they still slip through
    return `https://images.weserv.nl/?url=${encodeURIComponent(`https://image.tmdb.org/t/p/w500${path}`)}`;
  };

  return (
    <Link to={`/movie/${movie.tmdbId}`} className="movie-card-pro">
      <div className="pro-poster-wrapper">
        <div className="card-badge-quality">4K HDR</div>
        <div className="card-badge-rating">⭐ {movie.vote_average?.toFixed(1) || movie.voteAverage?.toFixed(1) || '8.0'}</div>
        <img 
          src={getPosterUrl(movie.poster_path || movie.posterPath)} 
          alt={movie.title} 
          className="pro-img" 
          loading="lazy"
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500&auto=format&fit=crop'; 
          }}
        />
        <div className="card-overlay-hover">
          <div className="play-icon-vibe">▶</div>
        </div>
      </div>
      <div className="pro-details">
        <h4 className="pro-title">{movie.title}</h4>
        <p className="pro-date">
          {(movie.release_date || movie.releaseDate)?.substring(0, 4) || '2026'}
        </p>
      </div>
    </Link>
  );
};

export default MovieCard;
