import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../Auth/AuthContext';
import TestFeedback from '../TestFeedback';

const MatchingTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const audioRef = useRef(null);
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingNewTest, setIsLoadingNewTest] = useState(false);

  // Get test data from navigation state
  const testData = location.state?.testData;

  useEffect(() => {
    if (!testData) {
      navigate('/ielts/practice-by-types');
      return;
    }

    // Initialize user answers
    const initialAnswers = {};
    if (testData.testData.questions) {
      testData.testData.questions.forEach(question => {
        initialAnswers[question.questionNumber] = '';
      });
    }
    setUserAnswers(initialAnswers);
  }, [testData, navigate]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !testData?.audioUrl) return;

    const sanitizedAudioUrl = testData.audioUrl.replace(/\.nett/g, '.net');
    if (audio.src !== sanitizedAudioUrl) {
      audio.src = sanitizedAudioUrl;
    }

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      console.error('Audio loading error for URL:', sanitizedAudioUrl);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [testData]);

  const handleBack = () => {
    navigate('/ielts/practice-by-types');
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

  const handleAnswerChange = (questionNumber, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionNumber]: value
    }));
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const clickX = e.nativeEvent.offsetX;
    const width = e.currentTarget.offsetWidth;
    const newTime = (clickX / width) * duration;
    audio.currentTime = newTime;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    let total = 0;
    
    if (testData.testData.questions) {
      testData.testData.questions.forEach(question => {
        total++;
        const userAnswer = userAnswers[question.questionNumber];
        const correctAnswer = testData.testData.correctAnswer[question.questionNumber.toString()];
        if (userAnswer === correctAnswer) {
          correct++;
        }
      });
    }
    
    return {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0
    };
  };

  const handleRetakeTest = () => {
    navigate('/ielts/matching/instructions');
  };

  const handleNewTest = async () => {
    setIsLoadingNewTest(true);
    try {
      const randomTestNumber = Math.floor(Math.random() * 10) + 1;
      const newTestCode = `H-T${randomTestNumber}`;
      
      console.log('Fetching new test:', newTestCode);
      
      const response = await fetch(
        `https://q96vyw8ux1.execute-api.us-east-1.amazonaws.com/prod/testbyparts/${newTestCode}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        }
      );
      
      console.log('New test response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('New test API error:', errorText);
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }
      
      const newTestData = await response.json();
      console.log('Successfully fetched new test:', newTestData);
      
      // Navigate to new test
      navigate('/ielts/matching/test', { 
        state: { 
          testData: {
            testCode: newTestCode,
            testData: newTestData.testData,
            audioUrl: newTestData.audioUrl
          }
        } 
      });
    } catch (error) {
      console.error('Error fetching new test:', error);
      
      // Show user-friendly error message and provide fallback
      if (error.message.includes('Failed to fetch') || error.message.includes('TypeError')) {
        alert('Network error: Unable to load new test. Please check your connection and try again.');
      } else if (error.message.includes('API Error')) {
        alert(`Server error: ${error.message}. Redirecting to instructions page.`);
      } else {
        alert('Failed to load new test. Redirecting to instructions page.');
      }
      
      // Fallback to instructions page
      navigate('/ielts/matching/instructions');
    } finally {
      setIsLoadingNewTest(false);
    }
  };

  if (!testData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">No test data available</h1>
          <button 
            onClick={() => navigate('/ielts/practice-by-types')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const score = showResults ? calculateScore() : null;

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
              <span className="text-white/80 font-medium">Matching Test</span>
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
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
      <main className="relative z-10 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Audio Player */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <span className="material-icons text-white text-xl">headphones</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Audio Recording</h3>
                <p className="text-white/70 text-sm">Listen carefully and match the items below</p>
              </div>
            </div>

            <audio ref={audioRef} src={testData.audioUrl ? testData.audioUrl.replace(/\.nett/g, '.net') : ''} preload="metadata" />
            
            <div className="space-y-4">
              {/* Play/Pause Button */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlayPause}
                  className="flex items-center justify-center w-12 h-12 bg-orange-600 hover:bg-orange-700 rounded-full transition-colors duration-300"
                >
                  <span className="material-icons text-white text-xl">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                
                {/* Time Display */}
                <div className="text-white/80 text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Progress Bar */}
              <div 
                className="w-full h-2 bg-white/20 rounded-full cursor-pointer overflow-hidden"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all duration-100"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
            <div className="flex items-start space-x-3 mb-4">
              <span className="material-icons text-yellow-400 text-xl mt-1">info</span>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Instructions</h3>
                <p className="text-white/90">{testData.testData.instructions}</p>
              </div>
            </div>
          </div>

          {/* Choices Box (Answer Key) */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
            <div className="flex items-start space-x-3 mb-4">
              <span className="material-icons text-orange-400 text-xl mt-1">list</span>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Answer Choices</h3>
                <p className="text-white/70 text-sm">Use these options to match with the questions below</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testData.testData.choices.map((choice) => (
                <div key={choice.label} className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{choice.label}</span>
                  </div>
                  <div className="text-white/90 leading-relaxed">{choice.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Questions and Matching */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Match the Items
            </h2>

            <div className="space-y-6">
              {testData.testData.questions.map((question) => (
                <div key={question.questionNumber} className="space-y-4">
                  {/* Question */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{question.questionNumber}</span>
                    </div>
                    <div className="flex-grow">
                      <p className="text-white text-lg font-medium leading-relaxed">
                        {question.questionText}
                      </p>
                    </div>
                  </div>
                  
                  {/* Dropdown */}
                  <div className="ml-14">
                    <select
                      value={userAnswers[question.questionNumber] || ''}
                      onChange={(e) => handleAnswerChange(question.questionNumber, e.target.value)}
                      disabled={isSubmitted}
                      className={`w-full px-4 py-3 rounded-xl border-2 text-lg transition-all duration-300 ${
                        isSubmitted
                          ? userAnswers[question.questionNumber] === testData.testData.correctAnswer[question.questionNumber.toString()]
                            ? 'bg-green-100 border-green-500 text-green-800'
                            : 'bg-red-100 border-red-500 text-red-800'
                          : 'bg-white/90 border-white/30 text-gray-800 focus:border-orange-500 focus:bg-white'
                      }`}
                    >
                      <option value="">Select an answer...</option>
                      {testData.testData.choices.map((choice) => (
                        <option key={choice.label} value={choice.label}>
                          {choice.label} - {choice.text}
                        </option>
                      ))}
                    </select>
                    
                    {/* Result Indicator */}
                    {isSubmitted && (
                      <div className="mt-3 flex items-center space-x-3">
                        {userAnswers[question.questionNumber] === testData.testData.correctAnswer[question.questionNumber.toString()] ? (
                          <div className="flex items-center space-x-2">
                            <span className="material-icons text-green-500 text-xl">check_circle</span>
                            <span className="text-green-400 font-medium">Correct!</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="material-icons text-red-500 text-xl">cancel</span>
                            <span className="text-white/70">Correct answer:</span>
                            <span className="text-green-400 font-medium bg-white/10 px-3 py-1 rounded-lg">
                              {testData.testData.correctAnswer[question.questionNumber.toString()]} - {
                                testData.testData.choices.find(choice => 
                                  choice.label === testData.testData.correctAnswer[question.questionNumber.toString()]
                                )?.text || 'Unknown'
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results Section */}
          {showResults && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-xl ${
                  score.percentage >= 70 ? 'bg-green-600' : score.percentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  <span className="material-icons text-white text-3xl">
                    {score.percentage >= 70 ? 'star' : score.percentage >= 50 ? 'thumb_up' : 'refresh'}
                  </span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4">Test Complete!</h3>
                <div className="text-6xl font-black text-white mb-4">
                  {score.percentage}%
                </div>
                <p className="text-xl text-white/70 mb-6">
                  You got {score.correct} out of {score.total} questions correct
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleRetakeTest}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300 flex items-center space-x-2"
                  >
                    <span className="material-icons">refresh</span>
                    <span>Retake Same Test</span>
                  </button>
                  <button
                    onClick={handleNewTest}
                    disabled={isLoadingNewTest}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300 flex items-center space-x-2"
                  >
                    {isLoadingNewTest ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-icons">play_arrow</span>
                        <span>Take New Test</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBack}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300 flex items-center space-x-2"
                  >
                    <span className="material-icons">arrow_back</span>
                    <span>Back to Question Types</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!isSubmitted && (
            <div className="text-center">
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Submit Answers
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MatchingTest; 