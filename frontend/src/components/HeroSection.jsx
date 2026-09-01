import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Play, Info, Sparkles } from 'lucide-react';
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
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [movies.length]);

  useEffect(() => {
    if (imgRef.current && contentRef.current) {
      gsap.fromTo(imgRef.current, 
        { opacity: 0.1, scale: 1.15 }, 
        { opacity: 0.75, scale: 1, duration: 1.2, ease: 'power2.out' }
      );
      
      gsap.fromTo(contentRef.current, 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [index]);

  const getUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop';
    if (path.startsWith('http')) return path;
    return `https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${path}`;
  };

  const movieId = currentMovie.tmdbId || currentMovie.id;

  return (
    <div className="hero-pro-carousel">
      <div className="hero-slide">
        <img 
          key={`bg-${movieId}`}
          ref={imgRef}
          src={getUrl(currentMovie.backdrop_path || currentMovie.backdropPath)} 
          alt={currentMovie.title || 'Movie'} 
          className="hero-img-carousel" 
        />
        <div className="hero-gradient-overlay"></div>
      </div>
      
      <div className="container hero-content-overlay">
        <div className="hero-inner" ref={contentRef} key={`info-${movieId}`}>
          <div className="vibe-tag">
            <Sparkles size={13} />
            <span>FEATURED 2026</span>
          </div>
          <h1 className="hero-main-title">{currentMovie.title}</h1>
          <p className="hero-overview">
            {currentMovie.overview ? `${currentMovie.overview.substring(0, 180)}...` : 'Experience the latest blockbusters and trending web series streaming in 4K HDR.'}
          </p>
          
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
    </div>
  );
};

export default HeroSection;
