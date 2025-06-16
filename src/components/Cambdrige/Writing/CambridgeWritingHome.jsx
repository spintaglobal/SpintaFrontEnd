import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext.jsx';
import CambridgeWritingExam from './CambridgeWritingExam.jsx';

const CambridgeWritingHome = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [examData, setExamData] = useState(null);
  const [showExam, setShowExam] = useState(false);
  
  const handleLevelSelection = async (level) => {
    setSelectedLevel(level);
    setIsLoading(true);
    
    try {
      // Map level IDs to API endpoints
      const apiEndpoints = {
        'a2-key': 'a2',
        'b1-preliminary': 'b1',
        'b2-first': 'b2',
        'c1-advanced': 'c1',
        'c2-proficiency': 'c2'
      };
      
      const endpoint = apiEndpoints[level.id];
      const response = await fetch(`https://fesix53cz3.execute-api.us-east-1.amazonaws.com/prod/cambridge/writing/${endpoint}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exam data');
      }
      
      const data = await response.json();
      setExamData(data);
      setIsLoading(false);
      setShowExam(true);
    } catch (error) {
      console.error('Error fetching exam data:', error);
      setIsLoading(false);
      // You could show an error message here
    }
  };
  
  const handleBack = () => {
    navigate('/cambridge-skills');
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
  
  const levels = [
    {
      id: 'a2-key',
      name: 'A2 Key',
      fullName: 'Cambridge English: Key',
      level: 'A2',
      duration: 30,
      tasks: 2,
      description: 'Basic writing skills for everyday situations',
      taskTypes: ['Email/Note', 'Story/Article'],
      color: 'from-green-500 to-green-700',
      iconBg: 'bg-green-600',
      delay: '0.1s',
      cefr: 'A2 - Elementary'
    },
    {
      id: 'b1-preliminary',
      name: 'B1 Preliminary',
      fullName: 'Cambridge English: Preliminary',
      level: 'B1',
      duration: 45,
      tasks: 2,
      description: 'Intermediate writing for practical communication',
      taskTypes: ['Email/Letter', 'Article/Story'],
      color: 'from-blue-500 to-blue-700',
      iconBg: 'bg-blue-600',
      delay: '0.2s',
      cefr: 'B1 - Intermediate'
    },
    {
      id: 'b2-first',
      name: 'B2 First',
      fullName: 'Cambridge English: First',
      level: 'B2',
      duration: 80,
      tasks: 2,
      description: 'Upper-intermediate writing for academic and professional contexts',
      taskTypes: ['Essay', 'Article/Email/Letter/Report/Review'],
      color: 'from-purple-500 to-purple-700',
      iconBg: 'bg-purple-600',
      delay: '0.3s',
      cefr: 'B2 - Upper Intermediate'
    },
    {
      id: 'c1-advanced',
      name: 'C1 Advanced',
      fullName: 'Cambridge English: Advanced',
      level: 'C1',
      duration: 90,
      tasks: 2,
      description: 'Advanced writing for complex academic and professional tasks',
      taskTypes: ['Essay', 'Letter/Proposal/Report/Review'],
      color: 'from-red-500 to-red-700',
      iconBg: 'bg-red-600',
      delay: '0.4s',
      cefr: 'C1 - Advanced'
    },
    {
      id: 'c2-proficiency',
      name: 'C2 Proficiency',
      fullName: 'Cambridge English: Proficiency',
      level: 'C2',
      duration: 90,
      tasks: 2,
      description: 'Proficiency-level writing demonstrating mastery of English',
      taskTypes: ['Essay', 'Article/Letter/Report/Review'],
      color: 'from-orange-500 to-orange-700',
      iconBg: 'bg-orange-600',
      delay: '0.5s',
      cefr: 'C2 - Proficiency'
    }
  ];
  
  // If exam is loaded, show the exam interface
  if (showExam && examData) {
    return <CambridgeWritingExam examData={examData} />;
  }
  
  return (
    <>
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
                  <span className="material-icons text-sm">arrow_back</span>
                  <span>Cambridge</span>
                </button>
                <div className="text-white/60">|</div>
                <span className="text-white/80 font-medium">Writing Levels</span>
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

        {/* Main Content */}
        <main className="relative z-10 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl mb-8 shadow-2xl">
                <span className="material-icons text-white text-4xl">edit_note</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                  Cambridge
                </span>
                <br />
                <span className="text-white/90">Writing</span>
              </h1>
              <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed mb-8">
                Choose your Cambridge English level and master writing skills with targeted practice. 
                From A2 Key to C2 Proficiency, develop your writing abilities with expert guidance.
              </p>
              
              {/* Key Features */}
              <div className="flex justify-center mb-12 space-x-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">5</div>
                  <div className="text-sm text-white/60">Levels</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">2</div>
                  <div className="text-sm text-white/60">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-400">Real</div>
                  <div className="text-sm text-white/60">Format</div>
                </div>
              </div>
            </div>

            {/* Level Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levels.map((level) => (
                <div
                  key={level.id}
                  className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
                  onClick={() => handleLevelSelection(level)}
                  onMouseEnter={() => setHoveredLevel(level.id)}
                  onMouseLeave={() => setHoveredLevel(null)}
                  style={{animationDelay: level.delay}}
                >
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 transition-all duration-500 group-hover:shadow-2xl group-hover:bg-white/20 h-full">
                    {/* Level badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${level.color} text-white`}>
                        {level.level}
                      </span>
                    </div>
                    
                    {/* Floating icon */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${level.iconBg} rounded-2xl mb-4 shadow-lg transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl`}>
                      <span className="material-icons text-white text-2xl">school</span>
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-white">
                      {level.name}
                    </h3>
                    <h4 className="text-sm font-medium text-white/70 mb-3 group-hover:text-white/80">
                      {level.fullName}
                    </h4>
                    <p className="text-white/70 mb-4 leading-relaxed text-sm group-hover:text-white/80">
                      {level.description}
                    </p>
                    
                    {/* Exam details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-white/70">
                        <span className="material-icons text-green-400 text-lg mr-2">schedule</span>
                        <span>{level.duration} minutes</span>
                      </div>
                      <div className="flex items-center text-sm text-white/70">
                        <span className="material-icons text-blue-400 text-lg mr-2">assignment</span>
                        <span>{level.tasks} tasks</span>
                      </div>
                      <div className="flex items-center text-sm text-white/70">
                        <span className="material-icons text-purple-400 text-lg mr-2">trending_up</span>
                        <span>{level.cefr}</span>
                      </div>
                    </div>
                    
                    {/* Task types */}
                    <div className="mb-4">
                      <div className="text-xs text-white/60 mb-2">Task Types:</div>
                      <div className="flex flex-wrap gap-1">
                        {level.taskTypes.map((task, index) => (
                          <span key={index} className="inline-block px-2 py-1 bg-white/10 rounded text-xs text-white/70">
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action indicator */}
                    <div className="flex items-center justify-between text-sm text-white/60 pt-4 border-t border-white/20">
                      <span className="font-medium">Start {level.name}</span>
                      <span className="material-icons text-lg group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                    </div>
                    
                    {/* Progress bar simulation */}
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mt-4">
                      <div 
                        className={`h-full bg-gradient-to-r ${level.color} rounded-full transition-all duration-1000 ${
                          hoveredLevel === level.id ? 'w-full' : 'w-0'
                        }`}
                      ></div>
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Call to action */}
            <div className="text-center mt-16">
              <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-lg text-white/70 px-8 py-4 rounded-full border border-white/20">
                <span className="material-icons text-emerald-400">star</span>
                <span className="font-medium">Choose your level and start practicing Cambridge Writing</span>
                <span className="material-icons text-green-400 animate-pulse">edit_note</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Loading Modal */}
      {isLoading && selectedLevel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Spinner */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl mb-6 shadow-lg">
                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              
              {/* Loading text */}
              <h3 className="text-2xl font-bold text-white mb-2">
                Fetching your {selectedLevel.name} Writing exam...
              </h3>
              <p className="text-white/70 mb-4">
                Preparing your personalized writing practice session
              </p>
              
              {/* Progress indicator */}
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CambridgeWritingHome; 