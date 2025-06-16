import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

const ListeningFeedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [expandedPart, setExpandedPart] = useState(null);

  const { answers, testData, results } = location.state || {};

  useEffect(() => {
    if (!answers || !testData || !results) {
      navigate('/cambridge/listening');
    }
  }, [answers, testData, results, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRetakeTest = () => {
    navigate('/cambridge/listening');
  };

  const handleBackToLevels = () => {
    navigate('/cambridge/listening');
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return "Excellent! Outstanding performance!";
    if (percentage >= 80) return "Very Good! Strong listening skills demonstrated.";
    if (percentage >= 70) return "Good! Solid understanding shown.";
    if (percentage >= 60) return "Fair. Room for improvement in some areas.";
    if (percentage >= 50) return "Below Average. Consider more practice.";
    return "Needs Improvement. Focus on fundamental listening skills.";
  };

  const getBandDescription = (bandScore) => {
    if (bandScore >= 8.5) return "Expert User - Very high proficiency";
    if (bandScore >= 7.5) return "Very Good User - Good operational command";
    if (bandScore >= 6.5) return "Competent User - Generally effective command";
    if (bandScore >= 5.5) return "Modest User - Partial command";
    if (bandScore >= 4.5) return "Limited User - Basic competence";
    return "Non User - Essentially no ability";
  };

  const togglePartExpansion = (partId) => {
    setExpandedPart(expandedPart === partId ? null : partId);
  };

  const getPartAnalysis = (part) => {
    let correct = 0;
    const total = part.questions.length;
    
    part.questions.forEach(question => {
      const userAnswer = answers[question.id];
      const correctAnswer = question.correct_answer;
      
      if (userAnswer && correctAnswer) {
        const normalizedUserAnswer = userAnswer.toString().toLowerCase().trim();
        const normalizedCorrectAnswer = correctAnswer.toString().toLowerCase().trim();
        
        if (normalizedUserAnswer === normalizedCorrectAnswer) {
          correct++;
        }
      }
    });
    
    return {
      correct,
      total,
      percentage: ((correct / total) * 100).toFixed(1)
    };
  };

  if (!answers || !testData || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading results...</p>
        </div>
      </div>
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
                <span>Back to Levels</span>
              </button>
              <div className="text-white/60">|</div>
              <span className="text-white/80 font-medium">Cambridge Listening Results</span>
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
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl mb-8 shadow-2xl">
              <span className="material-icons text-white text-4xl">assessment</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Test Complete!
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Here are your Cambridge Listening Test results with detailed analysis
            </p>
          </div>

          {/* Overall Results Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Score */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
                  <span className="material-icons text-white text-3xl">score</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Your Score</h3>
                <div className={`text-4xl font-black mb-2 ${getScoreColor(results.percentage)}`}>
                  {results.correctAnswers}/{results.totalQuestions}
                </div>
                <p className="text-white/70">{results.percentage}% Correct</p>
              </div>

              {/* Band Score */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
                  <span className="material-icons text-white text-3xl">stars</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Band Score</h3>
                <div className="text-4xl font-black text-yellow-400 mb-2">
                  {results.bandScore}
                </div>
                <p className="text-white/70 text-sm">{getBandDescription(results.bandScore)}</p>
              </div>

              {/* Performance */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
                  <span className="material-icons text-white text-3xl">trending_up</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Performance</h3>
                <div className={`text-lg font-bold mb-2 ${getScoreColor(results.percentage)}`}>
                  {getPerformanceMessage(results.percentage).split('.')[0]}
                </div>
                <p className="text-white/70 text-sm">{getPerformanceMessage(results.percentage).split('.')[1]}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-center space-x-3 bg-green-500/20 rounded-lg py-4">
                  <span className="material-icons text-green-400 text-2xl">check_circle</span>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{results.correctAnswers}</div>
                    <div className="text-white/70 text-sm">Correct</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3 bg-red-500/20 rounded-lg py-4">
                  <span className="material-icons text-red-400 text-2xl">cancel</span>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{results.incorrectAnswers}</div>
                    <div className="text-white/70 text-sm">Incorrect</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3 bg-blue-500/20 rounded-lg py-4">
                  <span className="material-icons text-blue-400 text-2xl">quiz</span>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{results.totalQuestions}</div>
                    <div className="text-white/70 text-sm">Total Questions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis by Part */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <span className="material-icons text-purple-400 mr-3">analytics</span>
              Detailed Analysis
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {testData.parts.map((part) => {
                const analysis = getPartAnalysis(part);
                return (
                  <div
                    key={part.id}
                    className="bg-white/5 rounded-xl p-6 border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-300"
                    onClick={() => togglePartExpansion(part.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Part {part.id}</h3>
                      <span className="material-icons text-white/50">
                        {expandedPart === part.id ? 'expand_less' : 'expand_more'}
                      </span>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-bold mb-2 ${getScoreColor(analysis.percentage)}`}>
                        {analysis.correct}/{analysis.total}
                      </div>
                      <div className="text-white/70">{analysis.percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expanded Part Details */}
            {expandedPart && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6">Part {expandedPart} - Question Details</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {testData.parts.find(p => p.id === expandedPart)?.questions.map((question) => {
                    const userAnswer = answers[question.id];
                    const correctAnswer = question.correct_answer;
                    const isCorrect = userAnswer && correctAnswer && 
                      userAnswer.toString().toLowerCase().trim() === correctAnswer.toString().toLowerCase().trim();
                    
                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg border ${
                          isCorrect
                            ? 'bg-green-500/10 border-green-400/30'
                            : 'bg-red-500/10 border-red-400/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-white font-bold">Q{question.question_number}</span>
                              <span className={`material-icons text-lg ${
                                isCorrect ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {isCorrect ? 'check_circle' : 'cancel'}
                              </span>
                            </div>
                            <p className="text-white/80 text-sm mb-2">
                              {question.question_text || question.question}
                            </p>
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="text-white/60">Your answer: </span>
                                <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                                  {userAnswer || 'No answer'}
                                </span>
                              </div>
                              {!isCorrect && (
                                <div className="text-sm">
                                  <span className="text-white/60">Correct answer: </span>
                                  <span className="text-green-400">{correctAnswer}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetakeTest}
                className="group inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg font-semibold"
              >
                <span className="material-icons text-2xl group-hover:scale-110 transition-transform duration-300">refresh</span>
                <span>Take Another Test</span>
              </button>
              
              <button
                onClick={handleBackToLevels}
                className="group inline-flex items-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg font-semibold"
              >
                <span className="material-icons text-2xl group-hover:scale-110 transition-transform duration-300">home</span>
                <span>Back to Levels</span>
              </button>
            </div>
            
            <p className="text-white/60 text-sm">
              Great job completing the Cambridge Listening Test! 
              {results.percentage >= 70 ? ' Excellent work!' : ' Keep practicing to improve your score.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListeningFeedback; 