import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Play, Info, Sparkles, Star, Calendar, Tv, Film } from 'lucide-react';
import './HeroSection.css';

const HeroSection = ({ movies }) => {
  const [index, setIndex] = useState(0);
  const contentRef = useRef(null);
  const imgRef = useRef(null);
  const navigate = useNavigate();

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[index];

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % movies.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [movies.length]);

  useEffect(() => {
    if (imgRef.current && contentRef.current) {
      gsap.fromTo(imgRef.current,
        { opacity: 0, scale: 1.12 },
        { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }
      );
      gsap.fromTo(contentRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.2 }
      );
    }
  }, [index]);

  const getUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1400&auto=format&fit=crop';
    if (path.startsWith('http')) return path;
    return `https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${path}`;
  };

  const movieId = currentMovie.tmdbId || currentMovie.id;
  const rating = Number(currentMovie.vote_average || currentMovie.voteAverage || 7.5).toFixed(1);
  const year = (currentMovie.release_date || currentMovie.releaseDate || '2026').substring(0, 4);
  const isTV = currentMovie.media_type === 'tv';

  return (
    <div className="hero-pro-carousel">
      {/* Animated background image */}
      <div className="hero-slide">
        <img
          key={`bg-${movieId}`}
          ref={imgRef}
          src={getUrl(currentMovie.backdrop_path || currentMovie.backdropPath)}
          alt={currentMovie.title || 'Movie'}
          className="hero-img-carousel"
        />
        {/* Multi-layer cinematic gradient */}
        <div className="hero-gradient-overlay" />
        <div className="hero-gradient-bottom" />
        <div className="hero-gradient-left" />
        {/* Animated shimmer layer */}
        <div className="hero-shimmer-layer" />
      </div>

      <div className="container hero-content-overlay">
        <div className="hero-inner" ref={contentRef} key={`info-${movieId}`}>
          {/* Top badge */}
          <div className="vibe-tag">
            <Sparkles size={12} />
            <span>FEATURED {year}</span>
          </div>

          {/* Title */}
          <h1 className="hero-main-title">{currentMovie.title}</h1>

          {/* Meta Pills Row */}
          <div className="hero-meta-pills">
            <span className="meta-pill type-pill">
              {isTV ? <Tv size={12} /> : <Film size={12} />}
              {isTV ? 'TV Series' : 'Movie'}
            </span>
            <span className="meta-pill rating-pill">
              <Star size={12} fill="#ffc107" color="#ffc107" />
              {rating}
            </span>
            <span className="meta-pill year-pill">
              <Calendar size={12} />
              {year}
            </span>
            {currentMovie.genres && currentMovie.genres[0] && (
              <span className="meta-pill genre-pill-hero">
                {typeof currentMovie.genres[0] === 'string'
                  ? currentMovie.genres[0]
                  : currentMovie.genres[0].name}
              </span>
            )}
          </div>

          {/* Overview */}
          <p className="hero-overview">
            {currentMovie.overview
              ? `${currentMovie.overview.substring(0, 200)}...`
              : 'Experience the latest blockbusters and trending web series streaming in 4K HDR.'}
          </p>

          {/* Action Buttons */}
          <div className="hero-actions">
            <button
              className="btn-peachy-glow"
              onClick={() => navigate(`/movie/${movieId}`)}
            >
              <Play size={18} fill="#ffffff" />
              <span>Watch Now</span>
            </button>
            <button
              className="btn-glass-vibe"
              onClick={() => navigate(`/movie/${movieId}`)}
            >
              <Info size={18} />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Dots */}
      <div className="carousel-dots">
        {movies.slice(0, 8).map((_, i) => (
          <div
            key={i}
            className={`dot ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="hero-progress-bar">
        <div key={index} className="hero-progress-fill" />
      </div>
    </div>
  );
};

export default HeroSection;
