import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

const QuestionTypesPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hoveredType, setHoveredType] = useState(null);
  
  const handleTypeSelection = (typeId) => {
    // Navigate to specific question type instructions
    if (typeId === 'table-completion') {
      navigate('/ielts/table-completion/instructions');
    } else if (typeId === 'form-completion') {
      navigate('/ielts/form-completion/instructions');
    } else if (typeId === 'note-completion') {
      navigate('/ielts/form-completion/instructions'); // Note completion uses form completion logic
    } else if (typeId === 'short-answer') {
      navigate('/ielts/short-answer/instructions');
    } else if (typeId === 'matching') {
      navigate('/ielts/matching/instructions');
    } else if (typeId === 'map-labeling') {
      navigate('/ielts/map-labeling/instructions');
    } else if (typeId === 'mc-single') {
      navigate('/ielts/multiple-choice/instructions');
    } else if (typeId === 'mc-multiple') {
      navigate('/ielts/multiple-choice-multiple/instructions');
    } else if (typeId === 'sentence-completion') {
      navigate('/ielts/sentence-completion/instructions');
    } else if (typeId === 'flowchart') {
      navigate('/ielts/flowchart-completion/instructions');
    } else {
      console.log(`Question type ${typeId} not yet implemented`);
    }
  };
  
  const handleBack = () => {
    navigate('/ielts-skills');
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
  
  const questionTypes = [
    {
      id: 'table-completion',
      name: 'Table Completion',
      icon: 'table_chart',
      description: 'Complete missing information in tables',
      color: 'from-cyan-500 to-cyan-700',
      iconBg: 'bg-cyan-600',
      delay: '0.1s'
    },
    {
      id: 'form-completion',
      name: 'Form Completion',
      icon: 'description',
      description: 'Fill in forms with correct information',
      color: 'from-emerald-500 to-emerald-700',
      iconBg: 'bg-emerald-600',
      delay: '0.2s'
    },
    {
      id: 'note-completion',
      name: 'Note Completion',
      icon: 'sticky_note_2',
      description: 'Complete notes with missing details',
      color: 'from-blue-500 to-blue-700',
      iconBg: 'bg-blue-600',
      delay: '0.3s'
    },
    {
      id: 'sentence-completion',
      name: 'Sentence Completion',
      icon: 'format_align_left',
      description: 'Complete sentences with appropriate words',
      color: 'from-purple-500 to-purple-700',
      iconBg: 'bg-purple-600',
      delay: '0.4s'
    },
    {
      id: 'short-answer',
      name: 'Short Answer',
      icon: 'short_text',
      description: 'Provide brief answers to questions',
      color: 'from-pink-500 to-pink-700',
      iconBg: 'bg-pink-600',
      delay: '0.5s'
    },
    {
      id: 'mc-multiple',
      name: 'Multiple Choice (Multiple)',
      icon: 'checklist',
      description: 'Select multiple correct answers',
      color: 'from-indigo-500 to-indigo-700',
      iconBg: 'bg-indigo-600',
      delay: '0.6s'
    },
    {
      id: 'mc-single',
      name: 'Multiple Choice (Single)',
      icon: 'radio_button_checked',
      description: 'Choose one correct answer',
      color: 'from-teal-500 to-teal-700',
      iconBg: 'bg-teal-600',
      delay: '0.7s'
    },
    {
      id: 'matching',
      name: 'Matching',
      icon: 'connect_without_contact',
      description: 'Match items from different lists',
      color: 'from-orange-500 to-orange-700',
      iconBg: 'bg-orange-600',
      delay: '0.8s'
    },
    {
      id: 'map-labeling',
      name: 'Map Labeling',
      icon: 'map',
      description: 'Label locations on maps and diagrams',
      color: 'from-lime-500 to-lime-700',
      iconBg: 'bg-lime-600',
      delay: '0.9s'
    },
    {
      id: 'flowchart',
      name: 'Flowchart',
      icon: 'account_tree',
      description: 'Complete flowcharts and process diagrams',
      color: 'from-red-500 to-red-700',
      iconBg: 'bg-red-600',
      delay: '1.0s'
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="material-icons text-white text-lg">school</span>
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
                <span>Back</span>
              </button>
              <div className="text-white/60">|</div>
              <span className="text-white/80 font-medium">Practice by Question Types</span>
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
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-xl">
              <span className="material-icons text-white text-3xl">quiz</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Practice by
              </span>
              <br />
              <span className="text-white/90">Question Types</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Master specific question types with targeted practice. Choose from 10 different question formats
              commonly found in IELTS exams to strengthen your skills.
            </p>
            
            {/* Progress indicators */}
            <div className="flex justify-center mt-8 space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">10</div>
                <div className="text-sm text-white/60">Question Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">∞</div>
                <div className="text-sm text-white/60">Practice</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">AI</div>
                <div className="text-sm text-white/60">Powered</div>
              </div>
            </div>
          </div>

          {/* Question Types Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {questionTypes.map((type) => (
              <div
                key={type.id}
                className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
                onClick={() => handleTypeSelection(type.id)}
                onMouseEnter={() => setHoveredType(type.id)}
                onMouseLeave={() => setHoveredType(null)}
                style={{animationDelay: type.delay}}
              >
                <div className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 transition-all duration-500 group-hover:bg-white/20 group-hover:shadow-2xl min-h-[280px] flex flex-col`}>
                  {/* Floating icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 ${type.iconBg} rounded-xl mb-4 shadow-lg transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl`}>
                    <span className="material-icons text-white text-xl">{type.icon}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-white leading-tight">
                      {type.name}
                    </h3>
                    <p className="text-white/70 mb-4 leading-relaxed group-hover:text-white/80 flex-grow text-sm">
                      {type.description}
                    </p>
                  </div>
                  
                  {/* Action indicator */}
                  <div className="flex items-center justify-between text-sm text-white/60 pt-4 border-t border-white/20 mt-auto">
                    <span className="font-medium">Practice</span>
                    <span className="material-icons text-lg group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
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
              <span className="material-icons text-purple-400">psychology</span>
              <span className="font-medium">Choose a question type to start practicing</span>
              <span className="material-icons text-pink-400 animate-pulse">arrow_forward</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionTypesPage; 