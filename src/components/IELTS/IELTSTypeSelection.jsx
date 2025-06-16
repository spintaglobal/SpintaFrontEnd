import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';
import MaterialIcon from '../common/MaterialIcon';

const IELTSTypeSelection = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hoveredType, setHoveredType] = useState(null);
  
  const handleTypeSelection = (type) => {
    if (type === 'practice-by-types') {
      navigate('/ielts/practice-by-types');
    } else {
      navigate(`/ielts/${type}/skills`);
    }
  };
  
  const handleBack = () => {
    navigate('/skills');
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
  
  const examTypes = [
    {
      id: 'general-training',
      name: 'General Training',
      icon: 'work',
      description: 'For immigration, work experience, or training programs',
      color: 'from-emerald-500 to-emerald-700',
      iconBg: 'bg-emerald-600',
      delay: '0.1s',
      features: ['Practical everyday contexts', 'Workplace scenarios', 'Social situations', 'General interest topics']
    },
    {
      id: 'academic',
      name: 'Academic',
      icon: 'school',
      description: 'For university admission and academic purposes',
      color: 'from-blue-500 to-blue-700',
      iconBg: 'bg-blue-600',
      delay: '0.2s',
      features: ['Academic texts and contexts', 'University-level content', 'Research-based materials', 'Scholarly discussions']
    },
    {
      id: 'practice-by-types',
      name: 'Practice by Question Types',
      icon: 'quiz',
      description: 'Practice specific question types to master your skills',
      color: 'from-purple-500 to-purple-700',
      iconBg: 'bg-purple-600',
      delay: '0.3s',
      features: ['10 different question types', 'Targeted practice', 'Skill-specific training', 'Focused improvement']
    }
  ];
  
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
                onClick={handleBack}
                className="text-white/80 hover:text-white transition duration-200 flex items-center space-x-1"
              >
                <MaterialIcon name="arrow_back" className="text-sm" />
                <span>Home</span>
              </button>
              <div className="text-white/60">|</div>
              <span className="text-white/80 font-medium">IELTS Selection</span>
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
                    <MaterialIcon name="logout" className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
                    <span className="text-sm font-medium">Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mb-6 shadow-xl">
              <MaterialIcon name="quiz" className="text-white text-3xl" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                IELTS
              </span>
              <br />
              <span className="text-white/90">Test Type</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Choose your IELTS test type to access tailored practice materials and exam preparation.
            </p>
            
            {/* Info indicators */}
            <div className="flex justify-center mt-8 space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">3</div>
                <div className="text-sm text-white/60">Test Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">4+</div>
                <div className="text-sm text-white/60">Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">AI</div>
                <div className="text-sm text-white/60">Powered</div>
              </div>
            </div>
          </div>

          {/* Test Types Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {examTypes.map((type) => (
              <div
                key={type.id}
                className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
                onClick={() => handleTypeSelection(type.id)}
                onMouseEnter={() => setHoveredType(type.id)}
                onMouseLeave={() => setHoveredType(null)}
                style={{animationDelay: type.delay}}
              >
                <div className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 transition-all duration-500 group-hover:bg-white/20 group-hover:shadow-2xl min-h-[400px] flex flex-col`}>
                  {/* Floating icon */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 ${type.iconBg} rounded-2xl mb-6 shadow-lg transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl`}>
                    <MaterialIcon name={type.icon} className="text-white text-3xl" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow flex flex-col">
                    <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-white">
                      {type.name}
                    </h3>
                    <p className="text-white/70 mb-6 leading-relaxed group-hover:text-white/80 text-lg">
                      {type.description}
                    </p>
                    
                    {/* Features list */}
                    <div className="space-y-3 mb-6">
                      {type.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span className="text-white/80 group-hover:text-white/90">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Action indicator */}
                    <div className="flex items-center justify-between text-sm text-white/60 pt-4 border-t border-white/20 mt-auto">
                      <span className="font-medium">Start {type.name} Practice</span>
                      <MaterialIcon name="arrow_forward" className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  {/* Progress bar simulation */}
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mt-4">
                    <div className={`h-full bg-gradient-to-r ${type.color} rounded-full transition-all duration-1000 group-hover:w-full w-0`}></div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Call to action */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-lg text-white/70 px-8 py-4 rounded-full border border-white/20">
              <MaterialIcon name="info" className="text-cyan-400" />
              <span className="font-medium">Choose the test type that matches your goals</span>
              <MaterialIcon name="arrow_forward" className="text-blue-400 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IELTSTypeSelection; 