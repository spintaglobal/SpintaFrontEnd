import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';
import TalkToMe from './Games/TalkToMe';
import SentenceBuilder from './Games/SentenceBuilder';
import WordDrop from './Games/WordDrop';
import DragZilla from './Games/DragZilla';

import MarkTheWords from './Games/MarkTheWords';
import Action from './Games/Action/Action';

const GamesHome = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  
  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      
      // Store logout intent in sessionStorage
      sessionStorage.setItem('showLogoutSuccess', 'true');
      
      // Sign out and immediately navigate
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };
  
  const games = [
    {
      id: 'talktome',
      title: "Talk To Me",
      icon: "record_voice_over",
      description: "Practice speaking skills by answering questions and get AI feedback to improve fluency and accuracy.",
      color: "from-purple-500 to-violet-500"
    },
    {
      id: 'sentencebuilder',
      title: "Sentence Builder",
      icon: "grid_view",
      description: "Build perfect sentences by arranging scrambled words in the correct order with AI-generated questions.",
      color: "from-cyan-500 to-blue-500"
    },
    {
      id: 'worddrop',
      title: "Word Drop",
      icon: "arrow_downward",
      description: "Catch falling words that match the given category to build vocabulary and improve recognition speed.",
      color: "from-amber-500 to-orange-500"
    },
    {
      id: 'dragzilla',
      title: "DragZilla",
      icon: "drag_indicator",
      description: "Drag and drop words to match definitions, synonyms, or antonyms and expand your vocabulary.",
      color: "from-emerald-500 to-teal-500"
    },

    {
      id: 'markthewords',
      title: "Mark The Words",
      icon: "highlight_alt",
      description: "Identify specific parts of speech in sentences to improve your grammar recognition and understanding.",
      color: "from-teal-500 to-cyan-500"
    },
    {
      id: 'action',
      title: "Action",
      icon: "directions_run",
      description: "Look at images and choose the correct verb to complete sentences. Learn action words through visual learning.",
      color: "from-pink-500 to-rose-500"
    }
  ];
  
  const handleBackToGames = () => {
    setActiveGame(null);
  };
  
  // Render active game component
  if (activeGame === 'talktome') {
    return <TalkToMe onBackToGames={handleBackToGames} />;
  } else if (activeGame === 'sentencebuilder') {
    return <SentenceBuilder onBackToGames={handleBackToGames} />;
  } else if (activeGame === 'worddrop') {
    return <WordDrop onBackToGames={handleBackToGames} />;
  } else if (activeGame === 'dragzilla') {
    return <DragZilla onBackToGames={handleBackToGames} />;

  } else if (activeGame === 'markthewords') {
    return <MarkTheWords onBackToGames={handleBackToGames} />;
  } else if (activeGame === 'action') {
    return <Action onBackToGames={handleBackToGames} />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <button 
              onClick={() => navigate('/skills')}
              className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img 
                  src="/logo.ico" 
                  alt="SPINTA Logo" 
                  className="w-8 h-8 rounded-lg object-contain" 
                  style={{
                    imageRendering: 'crisp-edges',
                    filter: 'contrast(1.1) brightness(1.05)',
                    WebkitFilter: 'contrast(1.1) brightness(1.05)'
                  }} 
                />
              </div>
              <span className="text-2xl font-bold text-white drop-shadow-lg">SPINTA</span>
            </button>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/play-zone')}
                className="text-white/80 hover:text-white transition duration-200 flex items-center space-x-1"
              >
                <span className="material-icons text-sm">arrow_back</span>
                <span>Play Zone</span>
              </button>
              <div className="text-white/60">|</div>
              <span className="text-white/80 font-medium">Games</span>
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="group flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white/80 px-4 py-2 rounded-lg hover:bg-white/20 hover:text-white transition-all duration-300 border border-white/20"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">Logging out...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons text-lg group-hover:translate-x-1 transition-transform duration-300">logout</span>
                    <span className="text-sm font-medium">Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-12 pt-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-6 shadow-xl">
              <span className="material-icons text-white text-3xl">videogame_asset</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Games & Activities
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Make learning fun with interactive games designed to boost your English skills through engaging gameplay.
            </p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game, index) => (
              <div
                key={index}
                className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
                onClick={() => setActiveGame(game.id)}
                style={{animationDelay: `${0.1 * (index + 1)}s`}}
              >
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 transition-all duration-500 group-hover:shadow-2xl group-hover:bg-white/20 h-full flex flex-col">
                  {/* Floating icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${game.color} rounded-2xl mb-6 shadow-lg transform transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-xl`}>
                    <span className="material-icons text-white text-2xl">{game.icon}</span>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white">
                    {game.title}
                  </h3>
                  <p className="text-white/70 mb-6 leading-relaxed group-hover:text-white/80 flex-grow">
                    {game.description}
                  </p>
                  
                  {/* Play button */}
                  <button 
                    className={`w-full bg-gradient-to-r ${game.color} text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center group-hover:scale-105`}
                  >
                    Play Now
                    <span className="material-icons ml-2 text-lg group-hover:translate-x-1 transition-transform duration-300">play_arrow</span>
                  </button>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <footer className="relative z-10 border-t border-white/20 bg-black/20 backdrop-blur-lg py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-cyan-400 font-medium mb-4 md:mb-0">Designed for focused IELTS preparation</p>
            <div className="flex space-x-4">
              <span className="text-white/60 flex items-center">
                <span className="material-icons text-lg mr-1">sports_esports</span>
                Play
              </span>
              <span className="text-white/60 flex items-center">
                <span className="material-icons text-lg mr-1">star</span>
                Learn
              </span>
              <span className="text-white/60 flex items-center">
                <span className="material-icons text-lg mr-1">emoji_events</span>
                Master
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GamesHome;
