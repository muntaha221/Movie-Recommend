import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Search, LogOut, Sun, Moon } from 'lucide-react';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar pro-nav">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <div className="logo-vibe">
            <Sparkles size={24} color="#e50914" fill="#e50914" />
          </div>
          <span className="logo-text">VIBE<span className="peachy-text">FLIX</span> AI</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/discover" className="nav-link">Mood Matcher</Link>
          
          <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="nav-user-menu">
              <Link to="/profile" className="nav-user-profile">
                <User size={18} /> <span>{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-peachy btn-sm">Join the Vibe</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
