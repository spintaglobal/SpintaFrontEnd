import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

const ListeningFeedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  
  // Get data from navigation state
  const { answers = {}, testData = null, results = null } = location.state || {};

  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRetakeTest = async () => {
    setIsLoading(true);
    
    try {
      // Generate a random test number between 3 and 22
      const randomTestNumber = Math.floor(Math.random() * 20) + 3;
      
      // Make API request to get new test data
      const response = await fetch(`https://r55vpkomzf.execute-api.us-east-1.amazonaws.com/prod/tests/${randomTestNumber}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch test data');
      }
      
      const newTestData = await response.json();
      
      // Navigate directly to exam with new test data - start with part 1
      navigate('/ielts/listening/exam', { 
        state: { 
          testData: newTestData,
          currentPart: 1
        },
        replace: true
      });
      
    } catch (error) {
      console.error('Error fetching new test data:', error);
      alert('Failed to load new test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/ielts/listening');
  };

  // If no data, redirect back
  if (!testData || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">No test data found</p>
          <button
            onClick={() => navigate('/ielts/listening')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Listening Home
          </button>
        </div>
      </div>
    );
  }

  const getBandColor = (band) => {
    if (band >= 8) return 'text-green-400';
    if (band >= 6) return 'text-blue-400';
    if (band >= 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return "Outstanding performance! You have excellent listening skills.";
    if (percentage >= 80) return "Great job! Your listening comprehension is very good.";
    if (percentage >= 70) return "Good work! You have solid listening skills with room for improvement.";
    if (percentage >= 60) return "Fair performance. Focus on improving your listening strategies.";
    if (percentage >= 50) return "You're making progress. More practice will help improve your skills.";
    return "Keep practicing! Regular listening practice will help you improve significantly.";
  };

  const getStarRating = (percentage) => {
    if (percentage >= 90) return 5;
    if (percentage >= 80) return 4;
    if (percentage >= 70) return 3;
    if (percentage >= 60) return 2;
    return 1;
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span 
        key={index} 
        className={`text-3xl ${index < rating ? 'text-yellow-400' : 'text-gray-500/40'}`}
        style={{ 
          filter: index < rating ? 'drop-shadow(0 0 8px #fbbf24)' : 'none',
          opacity: index < rating ? 1 : 0.3
        }}
      >
        ⭐
      </span>
    ));
  };

  const renderQuestionAnalysis = (part) => {
    return part.questions.map((question) => {
      const userAnswer = answers[question.id] || '';
      const correctAnswer = question.correct_answer || question.correctAnswer;
      const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
      
      return (
        <div key={question.id} className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80 text-sm font-medium">Q{question.question_number || question.id}</span>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${
              isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <span className="material-icons text-sm">
                {isCorrect ? 'check_circle' : 'cancel'}
              </span>
              <span>{isCorrect ? 'Correct' : 'Wrong'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <span className="text-white/60 text-sm min-w-fit">Your answer:</span>
              <span className={`font-medium text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {userAnswer || 'No answer'}
              </span>
            </div>
            
            {!isCorrect && (
              <div className="flex items-start space-x-3">
                <span className="text-white/60 text-sm min-w-fit">Correct answer:</span>
                <span className="text-green-400 font-medium text-sm">{correctAnswer}</span>
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  const starRating = getStarRating(results.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
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
              <span className="text-white/80 font-medium">IELTS Listening Results</span>
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
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Hero Results Section */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-6 shadow-2xl">
                <span className="material-icons text-white text-3xl">assessment</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                🎉 Test Complete! 🎉
              </h1>
              
              {/* Star Rating Display */}
              <div className="flex justify-center items-center space-x-1 mb-6">
                {renderStars(starRating)}
              </div>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                {getPerformanceMessage(results.percentage)}
              </p>
            </div>
          </div>

          {/* Main Score Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">{results.correct}</div>
                <div className="text-white/70 text-sm">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">{results.total}</div>
                <div className="text-white/70 text-sm">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{results.percentage}%</div>
                <div className="text-white/70 text-sm">Accuracy</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl md:text-4xl font-bold mb-2 ${getBandColor(results.band)}`}>
                  {results.band}
                </div>
                <div className="text-white/70 text-sm">IELTS Band</div>
              </div>
            </div>
          </div>

          {/* Part-by-Part Performance */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="material-icons text-blue-400 mr-3">analytics</span>
              Performance by Part
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {testData.parts.map((part) => {
                const partCorrect = part.questions.filter(q => {
                  const userAnswer = answers[q.id] || '';
                  return userAnswer.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim();
                }).length;
                
                const partPercentage = Math.round((partCorrect / part.questions.length) * 100);
                
                return (
                  <div key={part.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">{part.title}</h3>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-400">
                          {partCorrect}/{part.questions.length}
                        </div>
                        <div className="text-sm text-white/70">{partPercentage}%</div>
                      </div>
                    </div>
                    
                    {/* Progress bar for this part */}
                    <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${partPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Question Analysis - Collapsible */}
          <div className="mb-8">
            <details className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
              <summary className="p-6 cursor-pointer hover:bg-white/5 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="material-icons text-purple-400 mr-3">quiz</span>
                    Detailed Question Analysis
                  </h2>
                  <span className="material-icons text-white/60">expand_more</span>
                </div>
              </summary>
              
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {testData.parts.map((part) => (
                    <div key={part.id} className="bg-white/5 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <span className="material-icons text-blue-400 mr-2 text-sm">folder</span>
                        {part.title}
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {renderQuestionAnalysis(part)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </div>

          {/* Band Score Guide - Compact */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="material-icons text-yellow-400 mr-3">school</span>
              IELTS Band Score Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-green-400 font-bold text-lg mb-2">Band 7-9</div>
                <div className="text-white/70 text-sm">Expert User</div>
                <div className="text-yellow-400 mt-2">⭐⭐⭐⭐⭐</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-blue-400 font-bold text-lg mb-2">Band 5-6</div>
                <div className="text-white/70 text-sm">Competent User</div>
                <div className="text-yellow-400 mt-2">⭐⭐⭐</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-yellow-400 font-bold text-lg mb-2">Band 1-4</div>
                <div className="text-white/70 text-sm">Limited User</div>
                <div className="text-yellow-400 mt-2">⭐</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetakeTest}
              disabled={isLoading}
              className="inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading New Test...</span>
                </div>
              ) : (
                <>
                  <span className="material-icons">refresh</span>
                  <span>Take New Test</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/20 font-semibold"
            >
              <span className="material-icons">home</span>
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListeningFeedback; 