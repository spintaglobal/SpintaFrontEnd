import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ReadingResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testData, answers, level, testId, timeSpent } = location.state || {};

  const [score, setScore] = useState(null);
  const [detailedResults, setDetailedResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testData || !answers) {
      navigate('/cambridge/reading');
      return;
    }

    // Calculate results
    calculateResults();
  }, [testData, answers, navigate]);

  const calculateResults = () => {
    let correctAnswers = 0;
    let totalQuestions = 0;
    const sectionResults = [];

    testData.sections.forEach((section, sectionIndex) => {
      const questions = section.passages?.[0]?.questions || [];
      let sectionCorrect = 0;
      const questionResults = [];

      questions.forEach((question, questionIndex) => {
        const questionId = `section_${sectionIndex}_question_${questionIndex}`;
        const userAnswer = answers[questionId];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) {
          correctAnswers++;
          sectionCorrect++;
        }
        
        totalQuestions++;
        
        questionResults.push({
          questionNumber: question.questionNumber,
          questionType: question.questionType,
          userAnswer: userAnswer || 'No Answer',
          correctAnswer: question.correctAnswer,
          isCorrect,
          questionText: question.questionText
        });
      });

      sectionResults.push({
        sectionTitle: section.sectionTitle,
        sectionNumber: section.sectionNumber,
        correct: sectionCorrect,
        total: questions.length,
        percentage: questions.length > 0 ? (sectionCorrect / questions.length) * 100 : 0,
        questions: questionResults
      });
    });

    const finalScore = {
      correct: correctAnswers,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
      level,
      timeSpent: formatTime(timeSpent),
      grade: getGrade(totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0)
    };

    setScore(finalScore);
    setDetailedResults(sectionResults);
    setLoading(false);
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (percentage >= 50) return { grade: 'C+', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (percentage >= 40) return { grade: 'C', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { grade: 'F', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Calculating results...</p>
        </div>
      </div>
    );
  }

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
                onClick={() => navigate('/cambridge/reading')}
                className="text-white/80 hover:text-white transition duration-200 flex items-center space-x-2"
              >
                <span className="material-icons text-sm">arrow_back</span>
                <span>Back to Reading</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-8 shadow-2xl">
            <span className="material-icons text-white text-3xl">assignment_turned_in</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Test Results</h1>
          <p className="text-xl text-white/80">
            Cambridge {level} Reading & Use of English - {testId}
          </p>
        </div>

        {/* Score Overview */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Overall Score */}
              <div className="md:col-span-2 text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 ${score.grade.bg} rounded-2xl mb-4`}>
                  <span className={`text-3xl font-bold ${score.grade.color}`}>
                    {score.grade.grade}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Overall Score</h3>
                <p className="text-4xl font-bold text-white mb-2">
                  {score.correct}/{score.total}
                </p>
                <p className="text-xl text-white/80">
                  {score.percentage.toFixed(1)}%
                </p>
              </div>

              {/* Time Spent */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="material-icons text-blue-400 text-2xl">schedule</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Time Spent</h4>
                <p className="text-xl text-blue-300">{score.timeSpent}</p>
              </div>

              {/* Level */}
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="material-icons text-purple-400 text-2xl">school</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Level</h4>
                <p className="text-xl text-purple-300">{level}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Results */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Section Breakdown</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {detailedResults.map((section, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  Part {section.sectionNumber}
                </h3>
                <p className="text-white/70 text-sm mb-3">{section.sectionTitle}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80">Score:</span>
                  <span className="text-white font-medium">
                    {section.correct}/{section.total}
                  </span>
                </div>
                
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${section.percentage}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-white/60 mt-2 text-center">
                  {section.percentage.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/cambridge/reading')}
              className="flex items-center justify-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
            >
              <span className="material-icons">refresh</span>
              <span>Take Another Test</span>
            </button>
            
            <button
              onClick={() => {
                // Review wrong answers functionality could be implemented here
                console.log('Review answers functionality');
              }}
              className="flex items-center justify-center space-x-2 px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors"
            >
              <span className="material-icons">quiz</span>
              <span>Review Answers</span>
            </button>
            
            <button
              onClick={() => navigate('/cambridge')}
              className="flex items-center justify-center space-x-2 px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-semibold transition-colors"
            >
              <span className="material-icons">home</span>
              <span>Cambridge Home</span>
            </button>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <span className="material-icons">lightbulb</span>
              <span>Performance Feedback</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/80">
              <div>
                <h4 className="font-semibold text-white mb-2">Strengths</h4>
                <ul className="space-y-1 text-sm">
                  {score.percentage >= 80 && <li>• Excellent overall performance</li>}
                  {score.percentage >= 60 && <li>• Good understanding of English structures</li>}
                  <li>• Completed the test within time limit</li>
                  {detailedResults.some(s => s.percentage >= 80) && (
                    <li>• Strong performance in {detailedResults.filter(s => s.percentage >= 80).length} section(s)</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Areas for Improvement</h4>
                <ul className="space-y-1 text-sm">
                  {score.percentage < 60 && <li>• Focus on vocabulary building</li>}
                  {score.percentage < 70 && <li>• Practice more reading comprehension</li>}
                  {detailedResults.some(s => s.percentage < 50) && (
                    <li>• Work on weaker sections: {detailedResults.filter(s => s.percentage < 50).map(s => `Part ${s.sectionNumber}`).join(', ')}</li>
                  )}
                  <li>• Continue regular practice with Cambridge materials</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReadingResults; 