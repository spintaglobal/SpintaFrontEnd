import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Award, FileText, ArrowLeft, Home } from 'lucide-react';

// Results View Component for displaying exam scores and feedback
const ReadingResults = ({
  testData,
  finalScore,
  resultsFeedback,
  onReset,
  onExit
}) => {
  // Calculate total possible score - fixed at 40 questions for IELTS Reading
  const calculateTotalPossibleScore = () => {
    // The total number of questions in IELTS Reading is fixed at 40
    return 40;
  };

  // Calculate estimated IELTS band score based on correct answers
  const calculateBandScore = (score, totalQuestions) => {
    if (totalQuestions === 0) return 0;

    // Calculate percentage
    const percentage = (score / totalQuestions) * 100;

    // Approximate IELTS band score conversion
    if (percentage >= 90) return 9.0;
    if (percentage >= 85) return 8.5;
    if (percentage >= 80) return 8.0;
    if (percentage >= 75) return 7.5;
    if (percentage >= 70) return 7.0;
    if (percentage >= 65) return 6.5;
    if (percentage >= 60) return 6.0;
    if (percentage >= 55) return 5.5;
    if (percentage >= 50) return 5.0;
    if (percentage >= 40) return 4.5;
    if (percentage >= 30) return 4.0;
    if (percentage >= 20) return 3.5;
    if (percentage >= 10) return 3.0;
    return 2.5;
  };

  const totalPossibleScore = calculateTotalPossibleScore();
  const estimatedBandScore = calculateBandScore(finalScore, totalPossibleScore);
  const percentageScore = Math.round((finalScore / totalPossibleScore) * 100);

  // Calculate performance metrics
  const correctAnswers = resultsFeedback?.filter(result => result.isCorrect).length || 0;
  const incorrectAnswers = resultsFeedback?.filter(result => !result.isCorrect && result.isAnswered).length || 0;
  const skippedAnswers = resultsFeedback?.filter(result => !result.isAnswered).length || 0;

  // Add overflow-y-auto to the entire page to allow scrolling from anywhere
  return (
    <div className="results-view bg-gradient-to-b from-indigo-50 to-white min-h-screen pb-24 overflow-y-auto">
      <div className="w-full flex justify-center">
        {/* Main Content Area - Reduced Width */}
        <div className="w-full max-w-5xl px-8 py-6">
          {/* Page Title - Changed from IELTS Reading Test Results to Test Results */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-800">Test Results</h1>
          </div>
          
          {/* Summary Dashboard - Top Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Overall Score Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <Award className="w-6 h-6 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-indigo-800">Overall Score</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-6xl font-bold text-indigo-600 mb-1">{finalScore}</div>
                  <div className="text-gray-500">out of {totalPossibleScore} points</div>
                </div>
                <div className="w-24 h-24 rounded-full border-8 border-indigo-100 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-indigo-500 transition-all duration-1000"
                      style={{ height: `${percentageScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xl font-bold text-indigo-800">{percentageScore}%</span>
                </div>
              </div>
            </div>

            {/* Band Score Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <Award className="w-6 h-6 text-amber-500 mr-3" />
                <h3 className="text-xl font-semibold text-indigo-800">IELTS Band</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-6xl font-bold text-amber-500 mb-1">{estimatedBandScore.toFixed(1)}</div>
                  <div className="text-gray-500">Estimated Band Score</div>
                </div>
                <div className="w-24 h-24 rounded-full border-8 border-amber-100 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-amber-400 transition-all duration-1000"
                      style={{ height: `${(estimatedBandScore / 9) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xl font-bold text-amber-800">9.0</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-indigo-800">Performance</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="text-center p-2 rounded-md bg-green-50 border border-green-100">
                  <div className="text-3xl font-bold text-green-600 mb-1">{correctAnswers}</div>
                  <div className="text-xs text-green-800">Correct</div>
                </div>
                <div className="text-center p-2 rounded-md bg-red-50 border border-red-100">
                  <div className="text-3xl font-bold text-red-600 mb-1">{incorrectAnswers}</div>
                  <div className="text-xs text-red-800">Incorrect</div>
                </div>
                <div className="text-center p-2 rounded-md bg-yellow-50 border border-yellow-100">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">{skippedAnswers}</div>
                  <div className="text-xs text-yellow-800">Skipped</div>
                </div>
              </div>
              <div className="flex mt-3">
                <div className="h-2 rounded-full bg-green-200 transition-all duration-1000" 
                  style={{ width: `${Math.round((correctAnswers / totalPossibleScore) * 100)}%` }}></div>
                <div className="h-2 rounded-full bg-red-200 transition-all duration-1000" 
                  style={{ width: `${Math.round((incorrectAnswers / totalPossibleScore) * 100)}%` }}></div>
                <div className="h-2 rounded-full bg-yellow-200 transition-all duration-1000" 
                  style={{ width: `${Math.round((skippedAnswers / totalPossibleScore) * 100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Detailed Feedback Section - With Improved Styling and Better Scrolling */}
          {resultsFeedback && resultsFeedback.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-indigo-800 flex items-center">
                  <FileText className="w-6 h-6 text-indigo-600 mr-3" />
                  Detailed Question Analysis
                </h3>
              </div>
              {/* Increased height by 10% from 400px to 440px */}
              <div className="h-[440px] overflow-auto custom-scrollbar pr-1">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="bg-indigo-50 border-b-2 border-indigo-200">
                      <th className="px-4 py-3 text-left text-lg font-extrabold text-indigo-800 w-16">Q#</th>
                      <th className="px-4 py-3 text-left text-lg font-extrabold text-indigo-800">Your Answer</th>
                      <th className="px-4 py-3 text-left text-lg font-extrabold text-indigo-800">Correct Answer</th>
                      <th className="px-4 py-3 text-left text-lg font-extrabold text-indigo-800 w-28">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {resultsFeedback.map((result, index) => (
                      <tr 
                        key={index} 
                        className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="px-4 py-3 text-lg font-bold text-indigo-600">{result.questionNumber}</td>
                        <td className="px-4 py-3 text-lg text-gray-800 font-medium">
                          {result.userAnswer || <span className="text-gray-400 italic">No answer</span>}
                        </td>
                        <td className="px-4 py-3 text-lg text-gray-800 font-medium">{result.correctAnswer}</td>
                        <td className="px-4 py-3 text-lg">
                          {result.isCorrect ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-lg font-bold bg-green-100 text-green-800 border border-green-300 shadow-sm hover:bg-green-200 transition-colors">
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Correct
                            </span>
                          ) : !result.isAnswered ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-lg font-bold bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm hover:bg-yellow-200 transition-colors">
                              <AlertCircle className="w-5 h-5 mr-2" />
                              Skipped
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-lg font-bold bg-red-100 text-red-800 border border-red-300 shadow-sm hover:bg-red-200 transition-colors">
                              <XCircle className="w-5 h-5 mr-2" />
                              {result.limitExceeded ? "Limit" : "Incorrect"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Action Buttons - Fixed at Bottom */}
          <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t border-gray-200 py-4 px-8">
            <div className="flex justify-center space-x-6 max-w-5xl mx-auto">
              <button
                onClick={onReset}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Try Again
              </button>
              <button
                onClick={onExit}
                className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                <Home className="w-4 h-4 mr-2" /> Exit to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingResults;