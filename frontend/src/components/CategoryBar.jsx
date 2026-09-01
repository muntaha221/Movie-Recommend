import React from 'react';
import { Sparkles, Film, Tv, Flame, Clapperboard, Globe, Heart, ShieldAlert, Rocket, Smile, Eye } from 'lucide-react';
import './CategoryBar.css';

export const CATEGORIES = [
  { id: 'all', name: 'All Featured', icon: Sparkles },
  { id: 'series', name: 'Web Series', icon: Tv },
  { id: 'movies', name: 'Trending Movies', icon: Film },
  { id: 'latest_releases', name: 'Latest Releases', icon: Flame },
  { id: '28', name: 'Action', icon: ShieldAlert },
  { id: '878', name: 'Sci-Fi', icon: Rocket },
  { id: '35', name: 'Comedy', icon: Smile },
  { id: '27', name: 'Horror', icon: Eye },
  { id: 'anime', name: 'Anime', icon: Sparkles },
  { id: 'bollywood', name: 'Bollywood', icon: Clapperboard },
  { id: 'hollywood', name: 'Hollywood', icon: Globe },
  { id: '10749', name: 'Romance', icon: Heart }
];

const CategoryBar = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="category-bar-wrapper">
      <div className="container category-container">
        <div className="category-scroll">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                className={`category-pill ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                <Icon size={16} className="category-icon" />
                <span>{cat.name}</span>
                {isActive && <div className="active-dot" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
