import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight } from 'lucide-react';
import './Auth.css';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) return;
    
    setLoading(true);
    try {
      await login(null, null, username); // Adapting to current backend
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page reveal">
      <div className="auth-container glass-panel animate-glow">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <User size={32} color="white" />
          </div>
          <h2 className="auth-title">Welcome to <span className="gradient-text">CineMatch</span></h2>
          <p className="auth-subtitle">Just enter a username to start your journey.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Pick a unique username..." 
              className="form-input premium-input" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Entering...' : <>Continue <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
