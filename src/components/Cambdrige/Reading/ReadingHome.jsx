import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext.jsx';

const ReadingHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const levels = [
    {
      id: 'B1',
      name: 'B1 Preliminary',
      description: 'Intermediate level - everyday English for work, study and travel',
      color: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-600',
      difficulty: 'Intermediate',
      duration: '90 minutes',
      parts: 8,
      questions: 56
    },
    {
      id: 'B2',
      name: 'B2 First',
      description: 'Upper-intermediate level - complex texts and abstract topics',
      color: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-600',
      difficulty: 'Upper-Intermediate',
      duration: '90 minutes',
      parts: 8,
      questions: 56
    },
    {
      id: 'C1',
      name: 'C1 Advanced',
      description: 'Advanced level - sophisticated vocabulary and complex ideas',
      color: 'from-purple-500 to-violet-600',
      iconBg: 'bg-purple-600',
      difficulty: 'Advanced',
      duration: '90 minutes',
      parts: 8,
      questions: 56
    },
    {
      id: 'C2',
      name: 'C2 Proficiency',
      description: 'Proficiency level - near-native English understanding',
      color: 'from-red-500 to-rose-600',
      iconBg: 'bg-red-600',
      difficulty: 'Proficiency',
      duration: '90 minutes',
      parts: 8,
      questions: 56
    }
  ];

  const handleLevelSelect = (level) => {
    // Navigate to instructions page with selected level
    navigate('/cambridge/reading/instructions', { 
      state: { level: level.toLowerCase() } 
    });
  };

  const handleBack = () => {
    navigate('/cambridge');
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      sessionStorage.setItem('showLogoutSuccess', 'true');
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate('/skills')}
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
            
            <nav className="flex items-center space-x-6">
              <button 
                onClick={handleBack}
                className="text-white/80 hover:text-white transition duration-200 flex items-center space-x-2"
              >
                <span className="material-icons text-sm">arrow_back</span>
                <span>Cambridge Home</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-8 shadow-2xl">
            <span className="material-icons text-white text-3xl">menu_book</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Reading & Use of English
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Choose your Cambridge English level and practice with authentic exam materials. 
            Each test includes 8 parts covering reading comprehension and language use.
          </p>
        </div>

        {/* Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {levels.map((level) => (
            <div
              key={level.id}
              className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
              onClick={() => handleLevelSelect(level.id)}
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 h-full group-hover:shadow-2xl group-hover:bg-white/20 transition-all duration-500">
                {/* Level Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${level.iconBg} rounded-xl shadow-lg`}>
                    <span className="material-icons text-white text-xl">school</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{level.id}</span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">
                  {level.name}
                </h3>
                <p className="text-white/70 mb-4 leading-relaxed text-sm group-hover:text-white/80 transition-colors">
                  {level.description}
                </p>

                {/* Stats */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Difficulty:</span>
                    <span className="text-white/80 font-medium">{level.difficulty}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Duration:</span>
                    <span className="text-white/80 font-medium">{level.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Questions:</span>
                    <span className="text-white/80 font-medium">{level.questions}</span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <span className="text-white/80 font-medium text-sm">Practice Test</span>
                  <span className="material-icons text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                    arrow_forward
                  </span>
                </div>

                {/* Hover effect */}
                <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`h-full bg-gradient-to-r ${level.color} rounded-full w-0 group-hover:w-full transition-all duration-1000 delay-200`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Information Panel */}
        <div className="mt-12 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <span className="material-icons">info</span>
            <span>Test Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/80">
            <div>
              <h4 className="font-semibold text-white mb-2">What to Expect</h4>
              <ul className="space-y-1 text-sm">
                <li>• Multiple choice questions</li>
                <li>• Open cloze exercises</li>
                <li>• Word formation tasks</li>
                <li>• Key word transformations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Test Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• Automatic progress saving</li>
                <li>• Question navigation</li>
                <li>• Timer and progress tracking</li>
                <li>• Detailed feedback</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReadingHome; 