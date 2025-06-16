import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../Auth/AuthContext';
import TestFeedback from '../TestFeedback';

const TableCompletionTest = () => {
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

    // Initialize user answers for all question cells
    const initialAnswers = {};
    if (testData.testData.table && testData.testData.table.rows) {
      testData.testData.table.rows.forEach(row => {
        testData.testData.table.headers.forEach(header => {
          const cell = row[header];
          if (cell && cell.questionNumber) {
            initialAnswers[cell.questionNumber] = '';
          }
        });
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
    // Limit to three words and/or numbers
    const words = value.trim().split(/\s+/);
    if (words.length > 3) {
      return; // Don't update if more than 3 words
    }
    
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
    
    if (testData.testData.table && testData.testData.table.rows) {
      testData.testData.table.rows.forEach(row => {
        testData.testData.table.headers.forEach(header => {
          const cell = row[header];
          if (cell && cell.questionNumber) {
            total++;
            const userAnswer = userAnswers[cell.questionNumber]?.trim().toLowerCase();
            const correctAnswer = cell.correctAnswer?.trim().toLowerCase();
            if (userAnswer === correctAnswer) {
              correct++;
            }
          }
        });
      });
    }
    
    return {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0
    };
  };

  const handleRetakeTest = () => {
    navigate('/ielts/table-completion/instructions');
  };

  const handleNewTest = async () => {
    setIsLoadingNewTest(true);
    try {
      const randomTestNumber = Math.floor(Math.random() * 10) + 1;
      const newTestCode = `A-T${randomTestNumber}`;
      
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
      navigate('/ielts/table-completion/test', { 
        state: { 
          testData: {
            testCode: newTestCode,
            testData: newTestData
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
      navigate('/ielts/table-completion/instructions');
    } finally {
      setIsLoadingNewTest(false);
    }
  };

  // Function to render table cell content
  const renderTableCell = (cell, header, rowIndex) => {
    if (!cell) return '';
    
    // Check if this is a question cell
    if (cell.questionNumber) {
      const isCorrect = isSubmitted && 
        userAnswers[cell.questionNumber]?.trim().toLowerCase() === cell.correctAnswer?.trim().toLowerCase();
      const isIncorrect = isSubmitted && 
        userAnswers[cell.questionNumber]?.trim().toLowerCase() !== cell.correctAnswer?.trim().toLowerCase();
      
      return (
        <div className="relative">
          <input
            type="text"
            value={userAnswers[cell.questionNumber] || ''}
            onChange={(e) => handleAnswerChange(cell.questionNumber, e.target.value)}
            disabled={isSubmitted}
            className={`w-full px-3 py-2 rounded-lg border-2 transition-all duration-300 ${
              isSubmitted 
                ? isCorrect
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : 'border-red-500 bg-red-50 text-red-800'
                : 'border-gray-300 bg-white focus:border-cyan-500 focus:outline-none'
            }`}
            placeholder={`Answer ${cell.questionNumber}`}
            maxLength={50}
          />
          {isSubmitted && (
            <div className="absolute -top-2 -right-2">
              {isCorrect ? (
                <span className="material-icons text-green-500 text-lg bg-white rounded-full">check_circle</span>
              ) : (
                <span className="material-icons text-red-500 text-lg bg-white rounded-full">cancel</span>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Static cell content
    return <span className="text-gray-800">{cell.value || ''}</span>;
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

  // Prepare answers data for TestFeedback component
  const prepareAnswersData = () => {
    const answers = [];
    if (testData.testData.table && testData.testData.table.rows) {
      testData.testData.table.rows.forEach(row => {
        testData.testData.table.headers.forEach(header => {
          const cell = row[header];
          if (cell && cell.questionNumber) {
            const userAnswer = userAnswers[cell.questionNumber];
            const correctAnswer = cell.correctAnswer;
            const isCorrect = userAnswer?.trim().toLowerCase() === correctAnswer?.trim().toLowerCase();
            
            answers.push({
              questionNumber: cell.questionNumber,
              userAnswer: userAnswer || '',
              correctAnswer: correctAnswer,
              isCorrect: isCorrect
            });
          }
        });
      });
    }
    return answers;
  };

  // Show feedback page if test is submitted
  if (isSubmitted && showResults) {
    return (
      <TestFeedback
        score={score}
        testType="Table Completion"
        testCode={testData.testCode}
        onRetakeTest={handleRetakeTest}
        onNewTest={handleNewTest}
        answers={prepareAnswersData()}
      />
    );
  }

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
              <span className="text-white/80 font-medium">Table Completion Test</span>
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
      <main className="relative z-10 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Test Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-2xl mb-4 shadow-xl">
              <span className="material-icons text-white text-2xl">table_chart</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                Table Completion Test
              </span>
            </h1>
            <p className="text-lg text-white/70">
              Test Code: {testData.testCode} | Questions: {Object.keys(userAnswers).length}
            </p>
          </div>

          {/* Audio Player */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center">
                <span className="material-icons text-white text-xl">headphones</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Audio Recording</h3>
                <p className="text-white/70 text-sm">Listen to the recording and complete the table</p>
              </div>
            </div>

            <audio ref={audioRef} src={testData.audioUrl ? testData.audioUrl.replace(/\.nett/g, '.net') : ''} preload="metadata" />
            
            <div className="space-y-4">
              {/* Play/Pause Button */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlayPause}
                  className="flex items-center justify-center w-12 h-12 bg-cyan-600 hover:bg-cyan-700 rounded-full transition-colors duration-300"
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
                  className="h-full bg-cyan-500 rounded-full transition-all duration-100"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          {testData.testData.instructions && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="material-icons mr-3 text-cyan-400">info</span>
                Instructions
              </h2>
              <p className="text-white/90">{testData.testData.instructions}</p>
            </div>
          )}

          {/* Table */}
          {testData.testData.table && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="material-icons mr-3 text-cyan-400">table_chart</span>
                Complete the Table
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-cyan-600">
                      {testData.testData.table.headers.map((header, index) => (
                        <th 
                          key={index} 
                          className="px-6 py-4 text-left font-bold text-white border-r border-cyan-500 last:border-r-0"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  
                  {/* Table Body */}
                  <tbody>
                    {testData.testData.table.rows.map((row, rowIndex) => (
                      <tr 
                        key={rowIndex} 
                        className={`${rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors duration-200`}
                      >
                        {testData.testData.table.headers.map((header, colIndex) => (
                          <td 
                            key={colIndex} 
                            className="px-6 py-4 border-r border-gray-200 last:border-r-0 align-top"
                          >
                            {renderTableCell(row[header], header, rowIndex)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submit/Results Section */}
          <div className="text-center">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                className="group bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  <span className="material-icons text-2xl group-hover:translate-x-1 transition-transform duration-300">check_circle</span>
                  <span className="text-lg">Submit Answers</span>
                </div>
              </button>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TableCompletionTest; 