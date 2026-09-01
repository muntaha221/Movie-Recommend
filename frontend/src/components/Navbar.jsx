import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, User, LogOut, Sun, Moon, Menu, X, Compass, Home as HomeIcon } from 'lucide-react';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar pro-nav">
        <div className="container nav-container">
          <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
            <div className="logo-vibe">
              <Sparkles size={22} color="#e50914" fill="#e50914" />
            </div>
            <span className="logo-text">VIBE<span className="peachy-text">FLIX</span> AI</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links desktop-only">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              <HomeIcon size={16} /> Home
            </Link>
            <Link to="/discover" className={`nav-link ${location.pathname === '/discover' ? 'active' : ''}`}>
              <Compass size={16} /> Mood Matcher
            </Link>
            
            <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="nav-user-menu">
                <Link to="/profile" className="nav-user-profile">
                  <User size={16} /> <span>{user.username}</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn" title="Log Out">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-peachy btn-sm">Join Vibe</Link>
            )}
          </div>

          {/* Mobile Actions (Theme toggle + Hamburger) */}
          <div className="mobile-nav-actions mobile-only">
            <button className="theme-toggle-btn-mobile" onClick={toggleTheme}>
              {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              className="hamburger-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-content">
          <Link to="/" className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <HomeIcon size={20} />
            <span>Home</span>
          </Link>
          <Link to="/discover" className={`mobile-nav-link ${location.pathname === '/discover' ? 'active' : ''}`}>
            <Compass size={20} />
            <span>Mood Matcher AI</span>
          </Link>

          <div className="mobile-divider" />

          {user ? (
            <div className="mobile-user-section">
              <Link to="/profile" className="mobile-nav-link">
                <User size={20} />
                <span>Profile ({user.username})</span>
              </Link>
              <button onClick={handleLogout} className="mobile-logout-btn">
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <Link to="/login" className="btn btn-peachy btn-block">Sign In / Join</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
