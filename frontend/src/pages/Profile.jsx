import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return <div className="container" style={{ padding: '4rem 1rem' }}>Loading profile...</div>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem', fontWeight: 800 }}>Welcome, {user.username}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{user.email}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>
      
      <section style={{ marginTop: '3rem' }}>
        <h2 className="section-title" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Your Watchlist</h2>
        {user.watchlist && user.watchlist.length > 0 ? (
          <div className="movie-grid">
            {user.watchlist.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Your watchlist is empty. Go discover some movies!</p>
        )}
      </section>
    </div>
  );
};

export default Profile;
