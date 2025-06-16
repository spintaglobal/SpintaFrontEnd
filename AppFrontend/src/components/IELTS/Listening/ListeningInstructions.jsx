import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

const ListeningInstructions = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleStartExam = async () => {
    setIsLoading(true);
    try {
      // Use default test number 3
      const testNumber = 3;
      
      // Make API request to get test data
      const response = await fetch(`https://r55vpkomzf.execute-api.us-east-1.amazonaws.com/prod/tests/${testNumber}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch test data');
      }
      
      const testData = await response.json();
      
      // Navigate to exam with test data - start with part 1
      navigate('/ielts/listening/exam', { 
        state: { 
          testData,
          currentPart: 1
        } 
      });
    } catch (error) {
      console.error('Error fetching test data:', error);
      // You might want to show an error message to the user here
      alert('Failed to load test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const testFeatures = [
    {
      icon: 'headphones',
      title: 'Audio Recordings',
      description: '4 sections with authentic listening materials'
    },
    {
      icon: 'timer',
      title: '30 Minutes',
      description: 'Standard IELTS listening test duration'
    },
    {
      icon: 'quiz',
      title: '40 Questions',
      description: 'Various question types including multiple choice, form filling, and matching'
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
      content: "The test consists of 4 parts with increasing difficulty. Each part has its own audio recording and set of questions."
    },
    {
      step: 2,
      title: "Audio Playback",
      content: "You can play, pause, and replay the audio for each section. Make sure your headphones are working properly."
    },
    {
      step: 3,
      title: "Question Types",
      content: "You'll encounter multiple choice questions, fill-in-the-blank, and other question formats similar to the actual IELTS test."
    },
    {
      step: 4,
      title: "Navigation",
      content: "Complete each part in order. You can review and change your answers within each part before moving to the next."
    },
    {
      step: 5,
      title: "Completion",
      content: "After completing all 4 parts, you'll receive immediate feedback with your score and detailed analysis."
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
              onClick={() => navigate('/ielts-skills')}
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
                onClick={() => navigate('/ielts-skills')}
                className="text-white/80 hover:text-white transition duration-200 flex items-center space-x-1"
              >
                <span className="material-icons text-sm">arrow_back</span>
                <span>Back to Skills</span>
              </button>
              <div className="text-white/60">|</div>
              <span className="text-white/80 font-medium">IELTS Listening</span>
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
                IELTS
              </span>
              <br />
              <span className="text-white/90">Listening Test</span>
            </h1>
            <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed mb-8">
              Test your listening comprehension skills with authentic IELTS materials. 
              Complete 4 sections with increasing difficulty levels.
            </p>
          </div>

          {/* Test Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {testFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                  <span className="material-icons text-white text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Test Instructions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <span className="material-icons text-blue-400 mr-3">info</span>
              Test Instructions
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Column - Instructions */}
              <div className="space-y-6">
                {instructions.slice(0, 3).map((instruction) => (
                  <div key={instruction.step} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{instruction.step}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{instruction.title}</h3>
                      <p className="text-white/70 text-sm leading-relaxed">{instruction.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Right Column - Instructions */}
              <div className="space-y-6">
                {instructions.slice(3).map((instruction) => (
                  <div key={instruction.step} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{instruction.step}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{instruction.title}</h3>
                      <p className="text-white/70 text-sm leading-relaxed">{instruction.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
                <span className="material-icons mr-2">warning</span>
                Important Notes
              </h3>
              <ul className="space-y-2 text-white/80">
                <li className="flex items-start">
                  <span className="material-icons text-yellow-400 mr-3 mt-0.5 text-sm">check_circle</span>
                  <span>Ensure you have a quiet environment and working headphones</span>
                </li>
                <li className="flex items-start">
                  <span className="material-icons text-yellow-400 mr-3 mt-0.5 text-sm">check_circle</span>
                  <span>You can pause and replay audio within each section</span>
                </li>
                <li className="flex items-start">
                  <span className="material-icons text-yellow-400 mr-3 mt-0.5 text-sm">check_circle</span>
                  <span>Complete all sections to receive your final score</span>
                </li>
                <li className="flex items-start">
                  <span className="material-icons text-yellow-400 mr-3 mt-0.5 text-sm">check_circle</span>
                  <span>The test will automatically progress through all 4 parts</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Start Test Button */}
          <div className="text-center">
            <button
              onClick={handleStartExam}
              disabled={isLoading}
              className={`group inline-flex items-center space-x-4 px-12 py-6 rounded-2xl text-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
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
                  <span className="material-icons text-3xl group-hover:scale-110 transition-transform duration-300">play_arrow</span>
                  <span>Begin Listening Test</span>
                  <span className="material-icons text-2xl group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                </>
              )}
            </button>
            <p className="text-white/60 mt-4 text-sm">
              The test will begin immediately after loading
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListeningInstructions; 