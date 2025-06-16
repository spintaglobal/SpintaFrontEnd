import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

const TestFeedback = ({ 
  score, 
  testType, 
  testCode, 
  onRetakeTest, 
  onNewTest,
  answers = [] 
}) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationDelay, setAnimationDelay] = useState(0);

  useEffect(() => {
    // Trigger confetti for good scores
    if (score.percentage >= 70) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [score.percentage]);

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

  // Calculate stars based on percentage
  const getStars = (percentage) => {
    if (percentage >= 90) return 5;
    if (percentage >= 80) return 4;
    if (percentage >= 70) return 3;
    if (percentage >= 60) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const stars = getStars(score.percentage);

  // Get feedback message based on score
  const getFeedbackMessage = (percentage) => {
    if (percentage >= 90) return "Outstanding! You're an IELTS superstar! 🌟";
    if (percentage >= 80) return "Excellent work! You're doing great! 🎉";
    if (percentage >= 70) return "Good job! Keep up the momentum! 👏";
    if (percentage >= 60) return "Not bad! You're getting there! 💪";
    if (percentage >= 50) return "Keep practicing! You can do better! 📚";
    return "Don't give up! Practice makes perfect! 🚀";
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreEmoji = (percentage) => {
    if (percentage >= 90) return "🥇";
    if (percentage >= 80) return "🥈";
    if (percentage >= 70) return "🥉";
    if (percentage >= 60) return "👍";
    if (percentage >= 50) return "😊";
    return "😔";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <span className="text-2xl">
                {['🎉', '🌟', '✨', '🎊', '💫'][Math.floor(Math.random() * 5)]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-pink-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
              <span className="text-white/80 font-medium">Test Results</span>
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
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section with Score */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mb-8 shadow-2xl animate-bounce">
              <span className="text-4xl">{getScoreEmoji(score.percentage)}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Test Complete!
              </span>
            </h1>
            
            <p className="text-2xl text-white/80 mb-8">
              {getFeedbackMessage(score.percentage)}
            </p>

            {/* Stars Display */}
            <div className="flex justify-center space-x-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`transition-all duration-500 transform ${
                    i < stars ? 'scale-110 animate-pulse' : 'scale-90 opacity-30'
                  }`}
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  <span className={`text-4xl ${i < stars ? 'text-yellow-400' : 'text-gray-500'}`}>
                    ⭐
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Score Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 mb-8 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
              <span className="material-icons mr-3 text-pink-400 text-4xl">assessment</span>
              Your Results
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="bg-green-500/20 rounded-2xl p-6 border border-green-400/30">
                  <div className="text-4xl font-bold text-green-400 mb-2 animate-pulse">
                    {score.correct}
                  </div>
                  <div className="text-white/70 text-lg">Correct</div>
                  <div className="text-green-300 text-sm mt-2">Great job! 🎯</div>
                </div>
              </div>
              
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="bg-red-500/20 rounded-2xl p-6 border border-red-400/30">
                  <div className="text-4xl font-bold text-red-400 mb-2">
                    {score.total - score.correct}
                  </div>
                  <div className="text-white/70 text-lg">Incorrect</div>
                  <div className="text-red-300 text-sm mt-2">Room to improve! 📈</div>
                </div>
              </div>
              
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="bg-purple-500/20 rounded-2xl p-6 border border-purple-400/30">
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(score.percentage)} animate-bounce`}>
                    {score.percentage}%
                  </div>
                  <div className="text-white/70 text-lg">Score</div>
                  <div className="text-purple-300 text-sm mt-2">Keep it up! 💪</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8">
              <div className="text-center text-white/70 mb-4">Overall Performance</div>
              <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    score.percentage >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    score.percentage >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${score.percentage}%` }}
                >
                  <div className="h-full bg-gradient-to-r from-white/20 to-transparent rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Info */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/10 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Test Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-white/60 text-sm mb-1">Test Type</div>
                <div className="text-white font-medium text-lg">{testType}</div>
              </div>
              <div>
                <div className="text-white/60 text-sm mb-1">Test Code</div>
                <div className="text-white font-medium text-lg">{testCode}</div>
              </div>
            </div>
          </div>

          {/* Detailed Answer Review */}
          {answers.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
                <span className="material-icons mr-3 text-blue-400">assignment_turned_in</span>
                Answer Review
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {answers.map((answer, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      answer.isCorrect 
                        ? 'border-green-400 bg-green-500/20' 
                        : 'border-red-400 bg-red-500/20'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-bold text-white">Q{answer.questionNumber}</span>
                      {answer.isCorrect ? (
                        <span className="material-icons text-green-400 animate-bounce">check_circle</span>
                      ) : (
                        <span className="material-icons text-red-400 animate-pulse">cancel</span>
                      )}
                    </div>
                    <div className="text-sm">
                      <div className="text-white/70">Your answer:</div>
                      <div className="text-white font-medium">{answer.userAnswer || '(no answer)'}</div>
                      {!answer.isCorrect && (
                        <>
                          <div className="text-white/70 mt-2">Correct answer:</div>
                          <div className="text-green-400 font-medium">{answer.correctAnswer}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={onRetakeTest}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  <span className="material-icons text-2xl group-hover:rotate-12 transition-transform duration-300">refresh</span>
                  <span className="text-lg">Retake Same Test</span>
                </div>
              </button>
              
              <button
                onClick={onNewTest}
                className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  <span className="material-icons text-2xl group-hover:translate-x-1 transition-transform duration-300">play_arrow</span>
                  <span className="text-lg">Take New Test</span>
                </div>
              </button>
            </div>
            
            <button
              onClick={handleBack}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300"
            >
              Back to Question Types
            </button>
          </div>

          {/* Motivational Quote */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-lg text-white/70 px-8 py-4 rounded-full border border-white/20">
              <span className="material-icons text-yellow-400 animate-spin">auto_awesome</span>
              <span className="font-medium italic">
                {score.percentage >= 80 
                  ? "Excellence is a journey, not a destination!" 
                  : "Every expert was once a beginner!"}
              </span>
              <span className="material-icons text-pink-400 animate-pulse">favorite</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestFeedback; 