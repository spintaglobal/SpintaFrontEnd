import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

const ListeningInstructions = () => {
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
    navigate('/cambridge/listening');
  };

  const handleStartExam = async () => {
    setIsLoading(true);
    try {
      const level = selectedLevel;
      const testNumber = Math.floor(Math.random() * 20) + 1;
      
      console.log(`Fetching Cambridge ${level.toUpperCase()} test ${testNumber}...`);
      
      // Fetch all 4 parts in parallel for efficiency
      const partPromises = [];
      for (let partNumber = 1; partNumber <= 4; partNumber++) {
        const url = `https://fesix53cz3.execute-api.us-east-1.amazonaws.com/prod/cambridge/listening/${level}/tests/${testNumber}/parts/${partNumber}`;
        partPromises.push(
          fetch(url)
            .then(response => ({
              partNumber,
              success: response.ok,
              status: response.status,
              data: response.ok ? response.json() : null
            }))
            .catch(error => ({
              partNumber,
              success: false,
              error: error.message,
              data: null
            }))
        );
      }
      
      // Wait for all parts to complete
      const partResults = await Promise.all(partPromises);
      
      // Process results and get actual data
      const parts = [];
      for (const result of partResults) {
        if (result.success && result.data) {
          const partData = await result.data;
          parts.push({ partNumber: result.partNumber, data: partData });
          console.log(`Part ${result.partNumber}: Success`);
        } else {
          console.warn(`Part ${result.partNumber}: Failed (${result.status || result.error})`);
        }
      }
      
      console.log(`Successfully loaded ${parts.length} parts:`, parts.map(p => p.partNumber));
      
      if (parts.length === 0) {
        throw new Error('No test parts could be loaded. Please try again.');
      }
      
      // Transform the API response to match our component structure
      const testData = {
        test_id_composite: `cambridge_${level}_test_${testNumber}`,
        level,
        test_number: testNumber,
        parts: {}
      };

      // Process each successfully fetched part
      parts.forEach(({ partNumber, data }) => {
        console.log(`Processing Part ${partNumber}:`, data);
        
        // Handle different API response structures
        let sectionsData;
        if (data.questions_data && Array.isArray(data.questions_data)) {
          // Standard structure: data.questions_data is an array of sections
          sectionsData = data.questions_data.map(section => ({
            section_id: section.section_id,
            section_description: section.section_description,
            question_type: section.question_type,
            questions: section.questions,
            matching_options: section.matching_options || undefined
          }));
        } else if (data.sections && Array.isArray(data.sections)) {
          // Direct sections structure (for multiple_matching like Part 4)
          sectionsData = data.sections.map(section => ({
            section_id: section.section_id,
            section_description: section.section_description,
            question_type: section.question_type,
            questions: section.questions,
            matching_options: section.matching_options || undefined
          }));
        } else {
          console.warn(`Part ${partNumber}: Unknown data structure`, data);
          sectionsData = [];
        }

        testData.parts[partNumber.toString()] = {
          audio_url: data.audio_url,
          part_number: data.part_number,
          total_questions: data.total_questions,
          questions_data: {
            sections: sectionsData
          },
          // Also store direct sections for compatibility
          sections: sectionsData
        };
      });
      
      console.log('Test data prepared:', testData);
      console.log('Parts in final test data:', Object.keys(testData.parts));
      
      // Navigate to exam with test data
      navigate('/cambridge/listening/exam', { 
        state: { 
          testData,
          currentPart: 1
        } 
      });
    } catch (error) {
      console.error('Error fetching Cambridge test data:', error);
      alert(`Failed to load Cambridge test: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelInfo = () => {
    const levelData = {
      b1: { name: 'B1 Intermediate', color: 'text-green-400', description: 'Clear speech about familiar topics' },
      b2: { name: 'B2 Upper Intermediate', color: 'text-blue-400', description: 'Main ideas of complex speech' },
      c1: { name: 'C1 Advanced', color: 'text-purple-400', description: 'Wide range of long, complex texts' },
      c2: { name: 'C2 Proficiency', color: 'text-red-400', description: 'Virtually everything heard' }
    };
    return levelData[selectedLevel] || levelData.b1;
  };

  const levelInfo = getLevelInfo();

  const testFeatures = [
    {
      icon: 'headphones',
      title: 'Audio Recordings',
      description: '4 sections with authentic Cambridge B1 listening materials'
    },
    {
      icon: 'timer',
      title: '30 Minutes',
      description: 'Standard Cambridge listening test duration'
    },
    {
      icon: 'quiz',
      title: 'Multiple Questions',
      description: 'Various question types including multiple choice and more'
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
      content: "You'll encounter multiple choice questions and other question formats from authentic Cambridge B1 tests."
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
              onClick={handleBackToLevels}
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
                onClick={handleBackToLevels}
                className="text-white/80 hover:text-white transition duration-200 flex items-center space-x-1"
              >
                <span className="material-icons text-sm">arrow_back</span>
                <span>Back to Level Selection</span>
              </button>
              <div className="text-white/60">|</div>
              <span className={`font-medium ${levelInfo.color}`}>Cambridge {levelInfo.name} Listening</span>
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
              <span className={`bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent`}>
                Cambridge {levelInfo.name}
              </span>
              <br />
              <span className="text-white/90">Listening Test</span>
            </h1>
            <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed mb-8">
              Test your listening comprehension skills with authentic Cambridge {levelInfo.name} materials. 
              Complete 4 sections designed to assess your listening abilities at this level.
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

          {/* Test Information */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <span className="material-icons text-blue-400 mr-3">info</span>
              Test Information
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Column - Instructions */}
              <div className="space-y-6">
                {instructions.slice(0, 3).map((instruction) => (
                  <div key={instruction.step} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {instruction.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{instruction.title}</h3>
                      <p className="text-white/80 leading-relaxed">{instruction.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Right Column - Instructions */}
              <div className="space-y-6">
                {instructions.slice(3).map((instruction) => (
                  <div key={instruction.step} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {instruction.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{instruction.title}</h3>
                      <p className="text-white/80 leading-relaxed">{instruction.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cambridge B1 Specific Information */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <span className="material-icons text-blue-400 text-2xl">school</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-400 mb-2">Cambridge B1 Level</h3>
                  <ul className="space-y-2 text-white/80">
                    <li className="flex items-center space-x-2">
                      <span className="material-icons text-sm text-blue-400">check_circle</span>
                      <span>{levelInfo.name}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="material-icons text-sm text-blue-400">check_circle</span>
                      <span>{levelInfo.description}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Start Test Button */}
          <div className="text-center">
            <button
              onClick={handleStartExam}
              disabled={isLoading}
              className={`group inline-flex items-center space-x-4 px-12 py-6 rounded-2xl text-white text-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 ${
                isLoading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading Cambridge Test...</span>
                </>
              ) : (
                <>
                  <span className="material-icons text-3xl group-hover:scale-110 transition-transform duration-300">play_arrow</span>
                  <span>Start Cambridge {levelInfo.name} Listening Test</span>
                  <span className="material-icons text-2xl group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                </>
              )}
            </button>
            <p className="text-white/60 mt-4 text-sm">
              {isLoading 
                ? 'Fetching a random test from our collection of 20 Cambridge B1 tests...' 
                : 'Click when you\'re ready to begin a randomly selected Cambridge B1 test'
              }
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListeningInstructions; 