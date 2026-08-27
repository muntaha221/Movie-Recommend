import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';
import HeroSection from '../components/HeroSection';
import MovieCard from '../components/MovieCard';
import './Home.css';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState(true);
  const rowsRef = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, collRes] = await Promise.all([
          axios.get('/api/movies/trending'),
          axios.get('/api/movies/collections')
        ]);
        setTrending(trendRes.data);
        setCollections(collRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(rowsRef.current, 
        { y: 60, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out' }
      );
    }
  }, [loading]);

  if (loading) return <div className="loader-clean">Curating Your Vibe...</div>;

  const collectionOrder = [
    { id: 'trending', title: 'Trending Global', data: trending },
    { key: 'trending_series', title: 'Trending Web Series' },
    { key: 'trending_movies', title: 'Trending Movies' }
  ];

  return (
    <div className="home-clean">
      <HeroSection movies={trending.slice(0, 8)} />
      
      <div className="container main-content">
        {collectionOrder.map((section, idx) => {
          const sectionData = section.data || collections[section.key] || [];
          if (sectionData.length === 0) return null;

          return (
            <section key={idx} className="row-section" ref={el => rowsRef.current[idx] = el}>
              <div className="row-header">
                <h3 className="section-title-glow">{section.title}</h3>
              </div>
              <div className="horizontal-scroll premium-scroll">
                {sectionData.map((m, mIdx) => (
                  <div key={m.id || mIdx} className="scroll-item">
                    <MovieCard movie={{
                      tmdbId: m.id,
                      title: m.title,
                      posterPath: m.poster_path,
                      voteAverage: m.vote_average,
                      releaseDate: m.release_date
                    }} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
