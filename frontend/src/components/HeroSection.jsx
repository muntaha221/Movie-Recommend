import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './HeroSection.css';

const HeroSection = ({ movies }) => {
  const [index, setIndex] = useState(0);
  const contentRef = useRef(null);
  const imgRef = useRef(null);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[index];

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % movies.length);
  };

  useEffect(() => {
    // 5 SECOND PAUSE AS REQUESTED
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [movies.length]);

  useEffect(() => {
    if (imgRef.current && contentRef.current) {
      // Background Fade + Zoom
      gsap.fromTo(imgRef.current, 
        { opacity: 0.1, scale: 1.2 }, 
        { opacity: 0.7, scale: 1, duration: 1.5, ease: 'power2.out' }
      );
      
      // Text reveal
      gsap.fromTo(contentRef.current, 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );
    }
  }, [index]);

  const getUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop';
    if (path.startsWith('http')) return path;
    // Using an image proxy to bypass potential regional blocks
    return `https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${path}`;
  };

  return (
    <div className="hero-pro-carousel">
      <div className="hero-slide">
        <img 
          key={`bg-${currentMovie.id}`}
          ref={imgRef}
          src={getUrl(currentMovie.backdrop_path || currentMovie.backdropPath)} 
          alt="backdrop" 
          className="hero-img-carousel" 
        />
        <div className="hero-gradient-overlay"></div>
      </div>
      
      <div className="container hero-content-overlay">
        <div className="hero-inner" ref={contentRef} key={`info-${currentMovie.id}`}>
          <div className="vibe-tag">VIBE SELECTION 2026</div>
          <h1 className="hero-main-title">{currentMovie.title}</h1>
          <p className="hero-overview">{currentMovie.overview?.substring(0, 200)}...</p>
          
          <div className="hero-actions">
            <button className="btn-peachy-glow">Watch Movie</button>
            <button className="btn-glass-vibe">Add Watchlist</button>
          </div>
        </div>
      </div>

      <div className="carousel-dots">
        {movies.slice(0, 8).map((_, i) => (
          <div 
            key={i} 
            className={`dot ${i === index ? 'active' : ''}`} 
            onClick={() => setIndex(i)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
