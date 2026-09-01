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
        setTrending(Array.isArray(trendRes.data) ? trendRes.data : []);
        setCollections(collRes.data && typeof collRes.data === 'object' && !Array.isArray(collRes.data) ? collRes.data : {});
      } catch (err) {
        console.error('Failed to fetch home data:', err);
        setTrending([]);
        setCollections({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && rowsRef.current.length > 0) {
      gsap.fromTo(rowsRef.current.filter(Boolean), 
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
      <HeroSection movies={Array.isArray(trending) ? trending.slice(0, 8) : []} />
      
      <div className="container main-content">
        {collectionOrder.map((section, idx) => {
          const raw = section.data || (collections && collections[section.key]) || [];
          const sectionData = Array.isArray(raw) ? raw : [];
          if (sectionData.length === 0) return null;

          return (
            <section key={idx} className="row-section" ref={el => rowsRef.current[idx] = el}>
              <div className="row-header">
                <h3 className="section-title-glow">{section.title}</h3>
              </div>
              <div className="horizontal-scroll premium-scroll">
                {sectionData.map((m, mIdx) => (
                  <div key={m?.tmdbId || m?.id || mIdx} className="scroll-item">
                    <MovieCard movie={{
                      tmdbId: m?.tmdbId || m?.id,
                      title: m?.title || m?.name || 'Untitled',
                      posterPath: m?.poster_path || m?.posterPath,
                      voteAverage: m?.vote_average || m?.voteAverage,
                      releaseDate: m?.release_date || m?.releaseDate
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
