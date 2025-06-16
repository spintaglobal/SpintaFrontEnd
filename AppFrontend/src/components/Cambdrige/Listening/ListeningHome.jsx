import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

const ListeningHome = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState(null);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    navigate('/cambridge/listening/instructions', { state: { level } });
  };

  const handleBackToCambridge = () => {
    navigate('/cambridge-skills');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const levels = [
    {
      code: 'b1',
      name: 'B1 Intermediate',
      description: 'Can understand clear speech about familiar topics',
      color: 'from-green-500 to-emerald-600',
      icon: '🟢',
      features: ['Basic conversations', 'Familiar topics', 'Clear pronunciation']
    },
    {
      code: 'b2',
      name: 'B2 Upper Intermediate', 
      description: 'Can understand main ideas of complex speech',
      color: 'from-blue-500 to-cyan-600',
      icon: '🔵',
      features: ['Complex discussions', 'Abstract topics', 'Natural speech patterns']
    },
    {
      code: 'c1',
      name: 'C1 Advanced',
      description: 'Can understand a wide range of long, complex texts',
      color: 'from-purple-500 to-violet-600',
      icon: '🟣',
      features: ['Implicit meaning', 'Specialized topics', 'Rapid speech']
    },
    {
      code: 'c2',
      name: 'C2 Proficiency',
      description: 'Can understand virtually everything heard',
      color: 'from-red-500 to-pink-600',
      icon: '🔴',
      features: ['All contexts', 'Native-like understanding', 'Any accent or speed']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={handleBackToCambridge}
              className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img 
                  src="/logo.ico" 
                  alt="SPINTA Logo" 
                  className="w-8 h-8 rounded-lg object-contain" 
                />
              </div>
              <span className="text-2xl font-bold text-white drop-shadow-lg">SPINTA</span>
            </button>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={handleBackToCambridge}
                className="text-white/80 hover:text-white transition duration-200 flex items-center space-x-1"
              >
                <span className="material-icons text-sm">arrow_back</span>
                <span>Back to Cambridge</span>
              </button>
              <div className="text-white/60">|</div>
              <span className="text-white/80 font-medium">Cambridge Listening</span>
            </nav>
            
            <button 
              onClick={handleLogout}
              className="group flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white/80 px-4 py-2 rounded-lg hover:bg-white/20 hover:text-white transition-all duration-300 border border-white/20"
            >
              <span className="material-icons text-lg">logout</span>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl mb-8 shadow-2xl">
              <span className="material-icons text-white text-4xl">headphones</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Cambridge
              </span>
              <br />
              <span className="text-white/90">Listening Test</span>
            </h1>
            <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed mb-8">
              Test your listening comprehension skills with authentic Cambridge materials. 
              Choose your level and start your assessment.
            </p>
          </div>

          {/* Level Selection */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Choose Your Level
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {levels.map((level, index) => (
                <button
                  key={level.code}
                  onClick={() => handleLevelSelect(level.code)}
                  className={`group relative bg-gradient-to-br ${level.color} p-6 rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl text-left`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="text-4xl mb-4">{level.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{level.name}</h3>
                    <p className="text-white/90 text-sm mb-4 leading-relaxed">{level.description}</p>
                    
                    <div className="space-y-1">
                      {level.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-white/80 text-xs">
                          <span className="material-icons text-xs mr-1">check</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex items-center justify-center w-full py-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all duration-300">
                      <span className="text-white font-semibold text-sm">Select {level.name}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Test Features */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center justify-center">
              <span className="material-icons text-blue-400 mr-3">info</span>
              What to Expect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                  <span className="material-icons text-white text-2xl">headphones</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Audio Recordings</h3>
                <p className="text-white/70 text-sm">4 sections with authentic Cambridge materials</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4 shadow-lg">
                  <span className="material-icons text-white text-2xl">timer</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">30 Minutes</h3>
                <p className="text-white/70 text-sm">Standard Cambridge listening test duration</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4 shadow-lg">
                  <span className="material-icons text-white text-2xl">quiz</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Various Questions</h3>
                <p className="text-white/70 text-sm">Multiple choice, matching, and completion tasks</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-2xl mb-4 shadow-lg">
                  <span className="material-icons text-white text-2xl">assessment</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Instant Results</h3>
                <p className="text-white/70 text-sm">Get detailed feedback immediately after completion</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListeningHome; 