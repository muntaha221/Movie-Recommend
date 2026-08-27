import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Loader, Search } from 'lucide-react';
import './AiRecommender.css';

const AiRecommender = ({ onRecommendations }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('https://vibeflix-ai.vercel.app/api/ai/recommend', { prompt });
      if (res.data.recommendations && res.data.recommendations.length > 0) {
        onRecommendations(res.data.recommendations);
      } else {
        setError('The internet is a bit busy right now. Please wait 30 seconds and try again!');
        onRecommendations([]);
      }
    } catch (err) {
      setError('Connection issue. Please try again in a moment.');
      onRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-recommender">
      <div className="ai-header text-center">
        <h2 className="pro-title">Mood Matcher</h2>
        <p className="ai-subtitle">For your perfect cinematic match.</p>
      </div>

      <form onSubmit={handleSubmit} className="ai-form-pro">
        <div className="search-box-vibe">
          <Search className="search-icon-vibe" size={20} />
          <input
            className="ai-input-flat"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What's your mood? (e.g. 'thought-provoking mystery for a rainy night')"
          />
        </div>
        <button type="submit" className="btn-vibe-search" disabled={loading}>
          {loading ? <Loader className="spin" size={18} /> : 'Search'}
        </button>
      </form>

      {error && <div className="ai-error-soft">{error}</div>}
    </div>
  );
};

export default AiRecommender;
