import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToeflReadingContext } from './ToeflReadingContext';
import { Button } from '../../ui/button';
import './ToeflReading.css';

const ToeflReadingFeedback = () => {
  const navigate = useNavigate();
  const {
    passages,
    userAnswers,
    resetTest,
    testCompleted,
    getCorrectAnswerForScoring
  } = useToeflReadingContext();

  const [animatedScore, setAnimatedScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  if (!testCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-white/80 text-lg">Processing your results...</p>
        </div>
      </div>
    );
  }

  // Calculate score with support for different question types
  const calculateScore = () => {
    let correctAnswers = 0;
    let totalQuestions = 0;

    passages.forEach(passage => {
      passage.questions.forEach(question => {
        totalQuestions++;
        const userAnswer = userAnswers[question.id];
        const correctAnswer = getCorrectAnswerForScoring(question);
        
        if (question.type === 'PROSE_SUMMARY') {
          // For prose summary, check if user selected exactly the 3 correct answers
          if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
            const userSet = new Set(userAnswer);
            const correctSet = new Set(correctAnswer);
            if (userSet.size === correctSet.size && 
                [...correctSet].every(answer => userSet.has(answer))) {
              correctAnswers++;
            }
          }
        } else if (question.type === 'FILL_IN_A_TABLE') {
          // For table questions, check if all categorizations are correct
          if (typeof userAnswer === 'object' && question.statementsToCategorize) {
            let allCorrect = true;
            question.statementsToCategorize.forEach((statement, index) => {
              if (userAnswer[index] !== statement.correctCategoryIndex) {
                allCorrect = false;
              }
            });
            if (allCorrect) {
              correctAnswers++;
            }
          }
        } else {
          // For standard questions, compare directly
          if (userAnswer === correctAnswer) {
            correctAnswers++;
          }
        }
      });
    });

    return {
      correct: correctAnswers,
      total: totalQuestions,
      percentage: Math.round((correctAnswers / totalQuestions) * 100)
    };
  };

  const score = calculateScore();

  // Animate score on load
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = score.percentage / 50;
      const scoreAnimation = setInterval(() => {
        current += increment;
        if (current >= score.percentage) {
          current = score.percentage;
          clearInterval(scoreAnimation);
          if (score.percentage >= 80) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
          }
        }
        setAnimatedScore(Math.round(current));
      }, 20);
    }, 500);

    return () => clearTimeout(timer);
  }, [score.percentage]);

  const getScoreBand = (percentage) => {
    if (percentage >= 95) return { 
      band: 'Outstanding', 
      color: 'from-purple-500 to-pink-500', 
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-400/30',
      textColor: 'text-purple-200',
      icon: 'emoji_events',
      stars: 5,
      message: 'Exceptional performance! You\'re ready for the real TOEFL!'
    };
    if (percentage >= 85) return { 
      band: 'Excellent', 
      color: 'from-emerald-500 to-green-500', 
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-400/30',
      textColor: 'text-emerald-200',
      icon: 'star',
      stars: 4,
      message: 'Great job! You have strong reading comprehension skills.'
    };
    if (percentage >= 75) return { 
      band: 'Good', 
      color: 'from-cyan-500 to-blue-500', 
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-400/30',
      textColor: 'text-cyan-200',
      icon: 'thumb_up',
      stars: 3,
      message: 'Well done! Keep practicing to reach excellence.'
    };
    if (percentage >= 65) return { 
      band: 'Fair', 
      color: 'from-amber-500 to-orange-500', 
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-400/30',
      textColor: 'text-amber-200',
      icon: 'trending_up',
      stars: 2,
      message: 'You\'re on the right track! Focus on weak areas.'
    };
    return { 
      band: 'Needs Work', 
      color: 'from-red-500 to-pink-500', 
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-400/30',
      textColor: 'text-red-200',
      icon: 'school',
      stars: 1,
      message: 'Keep practicing! Every expert was once a beginner.'
    };
  };

  const scoreBand = getScoreBand(score.percentage);

  const formatUserAnswer = (question, userAnswer) => {
    if (userAnswer === undefined) return 'No answer selected';
    
    switch (question.type) {
      case 'PROSE_SUMMARY':
        if (Array.isArray(userAnswer)) {
          return userAnswer
            .map(index => `${String.fromCharCode(65 + index)}. ${question.options[index]}`)
            .join(', ');
        }
        return 'No answer selected';
        
      case 'FILL_IN_A_TABLE':
        if (typeof userAnswer === 'object') {
          return question.statementsToCategorize
            .map((statement, index) => 
              `"${statement.statement}" → ${question.tableCategories[userAnswer[index]] || 'Not categorized'}`
            )
            .join('; ');
        }
        return 'No answer selected';
        
      default:
        return `${String.fromCharCode(65 + userAnswer)}. ${question.options[userAnswer]}`;
    }
  };

  const formatCorrectAnswer = (question) => {
    const correctAnswer = getCorrectAnswerForScoring(question);
    
    switch (question.type) {
      case 'PROSE_SUMMARY':
        if (Array.isArray(correctAnswer)) {
          return correctAnswer
            .map(index => `${String.fromCharCode(65 + index)}. ${question.options[index]}`)
            .join(', ');
        }
        return 'N/A';
        
      case 'FILL_IN_A_TABLE':
        return question.statementsToCategorize
          .map(statement => 
            `"${statement.statement}" → ${question.tableCategories[statement.correctCategoryIndex]}`
          )
          .join('; ');
          
      default:
        if (typeof question.correctAnswer === 'string') {
          const answerIndex = question.correctAnswer.charCodeAt(0) - 65;
          return `${question.correctAnswer}. ${question.options[answerIndex]}`;
        }
        return `${String.fromCharCode(65 + correctAnswer)}. ${question.options[correctAnswer]}`;
    }
  };

  const isAnswerCorrect = (question, userAnswer) => {
    const correctAnswer = getCorrectAnswerForScoring(question);
    
    switch (question.type) {
      case 'PROSE_SUMMARY':
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          const userSet = new Set(userAnswer);
          const correctSet = new Set(correctAnswer);
          return userSet.size === correctSet.size && 
                 [...correctSet].every(answer => userSet.has(answer));
        }
        return false;
        
      case 'FILL_IN_A_TABLE':
        if (typeof userAnswer === 'object' && question.statementsToCategorize) {
          return question.statementsToCategorize.every((statement, index) => 
            userAnswer[index] === statement.correctCategoryIndex
          );
        }
        return false;
        
      default:
        return userAnswer === correctAnswer;
    }
  };

  function getQuestionTypeStats() {
    const typeStats = {};
    
    passages.forEach(passage => {
      passage.questions.forEach(question => {
        if (!typeStats[question.type]) {
          typeStats[question.type] = { correct: 0, total: 0 };
        }
        
        typeStats[question.type].total++;
        
        const userAnswer = userAnswers[question.id];
        if (isAnswerCorrect(question, userAnswer)) {
          typeStats[question.type].correct++;
        }
      });
    });
    
    return Object.entries(typeStats).map(([type, stats]) => ({
      type,
      ...stats,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }));
  }

  function getWorstPerformingTypes() {
    return getQuestionTypeStats()
      .filter(stat => stat.percentage < 60)
      .map(stat => stat.type);
  }

  const handleBackToHome = () => {
    navigate('/toefl-skills');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Back to Home Button */}
      <div className="relative z-10 p-6">
        <button
          onClick={handleBackToHome}
          className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 text-white transition-all duration-200"
        >
          <span className="material-icons text-sm">arrow_back</span>
          <span className="text-sm font-medium">Back to Home</span>
        </button>
      </div>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-6xl animate-bounce">🎉</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-bold animate-pulse">
            Outstanding Performance!
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section - Score and Performance */}
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
              <div className={`w-20 h-20 bg-gradient-to-r ${scoreBand.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                <span className="material-icons text-white text-3xl">{scoreBand.icon}</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Test Complete!</h1>
              <p className="text-white/80 text-lg mb-6">{scoreBand.message}</p>
              
              {/* Star Rating */}
              <div className="flex justify-center space-x-1 mb-6">
                {[...Array(5)].map((_, index) => (
                  <span 
                    key={index} 
                    className={`text-2xl ${index < scoreBand.stars ? 'text-yellow-400' : 'text-gray-500'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Score Dashboard */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="text-center mb-8">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`text-gradient-to-r ${scoreBand.color}`}
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${animatedScore}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{animatedScore}%</span>
                    <span className="text-white/60 text-sm">Overall Score</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="material-icons text-green-400">check_circle</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{score.correct}</div>
                  <div className="text-white/60 text-sm">Correct</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <span className="material-icons text-blue-400">quiz</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{score.total}</div>
                  <div className="text-white/60 text-sm">Total</div>
                </div>
                
                <div className="text-center">
                  <div className={`w-12 h-12 ${scoreBand.bgColor} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <span className={`material-icons ${scoreBand.textColor}`}>grade</span>
                  </div>
                  <div className="text-lg font-bold text-white">{scoreBand.band}</div>
                  <div className="text-white/60 text-sm">Performance</div>
                </div>
              </div>
            </div>

            {/* Skills Analysis */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="material-icons text-white">analytics</span>
                </div>
                <h2 className="text-xl font-bold text-white">Skills Analysis</h2>
              </div>
              
              <div className="space-y-4">
                {getQuestionTypeStats().map((stat, index) => (
                  <div key={stat.type} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                          <span className="material-icons text-white/70 text-sm">
                            {stat.type.includes('VOCABULARY') ? 'translate' :
                             stat.type.includes('INFERENCE') ? 'psychology' :
                             stat.type.includes('SUMMARY') ? 'summarize' :
                             stat.type.includes('TABLE') ? 'table_chart' :
                             'quiz'}
                          </span>
                        </div>
                        <h3 className="text-white font-medium text-sm">{stat.type.replace(/_/g, ' ')}</h3>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${stat.percentage >= 70 ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.percentage}%
                        </div>
                        <div className="text-white/60 text-xs">{stat.correct}/{stat.total}</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          stat.percentage >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {stat.percentage >= 90 ? (
                        <>
                          <span className="material-icons text-yellow-400 text-sm">star</span>
                          <span className="text-yellow-400 text-xs font-medium">Excellent</span>
                        </>
                      ) : stat.percentage >= 70 ? (
                        <>
                          <span className="material-icons text-green-400 text-sm">thumb_up</span>
                          <span className="text-green-400 text-xs font-medium">Good</span>
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-orange-400 text-sm">trending_up</span>
                          <span className="text-orange-400 text-xs font-medium">Needs Practice</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Detailed Review */}
          <div className="space-y-8">
            {/* Improvement Tips */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="material-icons text-white">lightbulb</span>
                </div>
                <h2 className="text-xl font-bold text-white">Personalized Tips</h2>
              </div>
              
              <div className="space-y-4">
                {score.percentage < 70 && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="material-icons text-blue-400 text-sm">library_books</span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm mb-2">Daily Reading Practice</h3>
                        <p className="text-white/70 text-xs leading-relaxed">Read academic passages daily to improve comprehension speed and accuracy.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {score.percentage < 80 && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="material-icons text-purple-400 text-sm">timer</span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm mb-2">Time Management</h3>
                        <p className="text-white/70 text-xs leading-relaxed">Practice timing yourself - aim for 17-18 minutes per passage including all questions.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="material-icons text-emerald-400 text-sm">psychology</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm mb-2">Question Strategy</h3>
                      <p className="text-white/70 text-xs leading-relaxed">Learn specific strategies for each question type. Practice identifying keywords.</p>
                    </div>
                  </div>
                </div>
                
                {getWorstPerformingTypes().map(type => (
                  <div key={type} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="material-icons text-red-400 text-sm">target</span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm mb-2">Focus: {type.replace(/_/g, ' ')}</h3>
                        <p className="text-white/70 text-xs leading-relaxed">This question type needs extra attention. Practice identifying key information.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Question Review */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <span className="material-icons text-white">rate_review</span>
                </div>
                <h2 className="text-xl font-bold text-white">Question Review</h2>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {passages.map((passage, passageIndex) => 
                  passage.questions.map((question, questionIndex) => {
                    const globalQuestionNumber = passages
                      .slice(0, passageIndex)
                      .reduce((total, p) => total + p.questions.length, 0) + questionIndex + 1;
                    
                    const userAnswer = userAnswers[question.id];
                    const isCorrect = isAnswerCorrect(question, userAnswer);
                    
                    return (
                      <div key={question.id} className={`bg-white/5 rounded-2xl p-4 border ${
                        isCorrect ? 'border-green-400/30' : 'border-red-400/30'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                            }`}>
                              <span className={`material-icons text-sm ${
                                isCorrect ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {isCorrect ? 'check' : 'close'}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-white font-medium text-sm">Question {globalQuestionNumber}</h3>
                              <p className="text-white/60 text-xs">{question.type.replace(/_/g, ' ')}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-white/60">Your Answer: </span>
                            <span className={`${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              {formatUserAnswer(question, userAnswer)}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div>
                              <span className="text-white/60">Correct Answer: </span>
                              <span className="text-green-400">
                                {formatCorrectAnswer(question)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={resetTest}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold"
              >
                <span className="material-icons">refresh</span>
                <span>Take Another Test</span>
              </button>
              
              <button
                onClick={handleBackToHome}
                className="w-full flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-2xl border border-white/20 transition-all duration-300 font-medium"
              >
                <span className="material-icons">home</span>
                <span>Back to Skills</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToeflReadingFeedback; 