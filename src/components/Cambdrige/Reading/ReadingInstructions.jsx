import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

const ReadingInstructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Get level from navigation state, default to 'b1' if not provided
  const selectedLevel = location.state?.level || 'b1';

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackToLevels = () => {
    navigate('/cambridge/reading');
  };

  const handleStartExam = async () => {
    setIsLoading(true);
    try {
      const level = selectedLevel.toUpperCase();
      const testNumber = Math.floor(Math.random() * 10) + 1;
      const testId = `CAM.READ.${level}.T${testNumber}`;
      
      console.log(`Fetching Cambridge ${level} reading test ${testNumber}...`);
      
      const apiUrl = `https://fesix53cz3.execute-api.us-east-1.amazonaws.com/prod/cambridge/${level}/${testId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load test: ${response.status} ${response.statusText}`);
      }

      const testData = await response.json();
      
      console.log('Test data loaded successfully:', testData);
      
      // Navigate to test interface with test data
      navigate('/cambridge/reading/test', { 
        state: { 
          testData,
          level,
          testId 
        } 
      });
      
    } catch (error) {
      console.error('Error fetching Cambridge reading test:', error);
      alert(`Failed to load Cambridge test: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelInfo = () => {
    const levelData = {
      b1: { name: 'B1 Preliminary', color: 'text-green-400', description: 'Intermediate level reading comprehension' },
      b2: { name: 'B2 First', color: 'text-blue-400', description: 'Upper-intermediate reading skills' },
      c1: { name: 'C1 Advanced', color: 'text-purple-400', description: 'Advanced reading and language use' },
      c2: { name: 'C2 Proficiency', color: 'text-red-400', description: 'Proficiency level comprehension' }
    };
    return levelData[selectedLevel] || levelData.b1;
  };

  const levelInfo = getLevelInfo();

  const testFeatures = [
    {
      icon: 'menu_book',
      title: 'Reading Passages',
      description: '8 parts with authentic Cambridge reading materials'
    },
    {
      icon: 'timer',
      title: '90 Minutes',
      description: 'Standard Cambridge reading & use of English duration'
    },
    {
      icon: 'quiz',
      title: '56 Questions',
      description: 'Various question types including multiple choice, cloze, and transformations'
    },
    {
      icon: 'assessment',
      title: 'Instant Feedback',
      description: 'Get your results immediately after completion'
    }
  ];

  const instructions = [
    {
      step: 1,
      title: "Test Structure",
      content: "The test consists of 8 parts covering reading comprehension and use of English. Each part tests different language skills and question types."
    },
    {
      step: 2,
      title: "Question Types",
      content: "You'll encounter multiple choice, open cloze, word formation, key word transformations, gapped text, and multiple matching questions."
    },
    {
      step: 3,
      title: "Navigation",
      content: "Navigate between questions using the previous/next buttons. You can flag questions for review and return to them later."
    },
    {
      step: 4,
      title: "Time Management",
      content: "You have 90 minutes to complete all 8 parts. The timer can be toggled on/off, and your progress is automatically saved."
    },
    {
      step: 5,
      title: "Completion",
      content: "Review your answers before submitting. You'll receive instant feedback with detailed results for each section."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
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
                onClick={handleBackToLevels}
                className="text-white/80 hover:text-white transition duration-200 flex items-center space-x-2"
              >
                <span className="material-icons text-sm">arrow_back</span>
                <span>Back to Levels</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
            <span className="material-icons text-white text-3xl">menu_book</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cambridge <span className={levelInfo.color}>{levelInfo.name}</span>
          </h1>
          <h2 className="text-2xl text-white/90 mb-4">Reading & Use of English</h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {levelInfo.description}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Test Features */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Test Overview</h3>
              <div className="space-y-6">
                {testFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="material-icons text-blue-400">{feature.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">{feature.title}</h4>
                      <p className="text-white/70">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Instructions */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Instructions</h3>
              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <div key={index} className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-purple-400 font-bold text-sm">{instruction.step}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{instruction.title}</h4>
                        <p className="text-white/70 leading-relaxed">{instruction.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Start Test Section */}
          <div className="mt-12 text-center">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Begin?</h3>
              <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                Make sure you're in a quiet environment with a stable internet connection. 
                The test will take approximately 90 minutes to complete.
              </p>
              
              <button
                onClick={handleStartExam}
                disabled={isLoading}
                className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 mx-auto ${
                  isLoading
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading Test...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons">play_arrow</span>
                    <span>Start Reading Test</span>
                  </>
                )}
              </button>

              {isLoading && (
                <p className="text-white/60 mt-4 text-sm">
                  Preparing your Cambridge {levelInfo.name} test...
                </p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 p-6 bg-blue-500/10 border border-blue-400/20 rounded-xl">
            <div className="flex items-start space-x-3">
              <span className="material-icons text-blue-400 mt-1">info</span>
              <div>
                <h4 className="text-white font-semibold mb-2">Before You Start</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Find a quiet environment free from distractions</li>
                  <li>• The test will automatically save your progress</li>
                  <li>• You can use the timer to track your progress</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReadingInstructions; 