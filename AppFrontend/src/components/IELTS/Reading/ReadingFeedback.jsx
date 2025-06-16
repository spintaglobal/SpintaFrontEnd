import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ReadingFeedback.css';

const ReadingFeedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Get test results from navigation state
  const { testResults, testData, userAnswers } = location.state || {};

  if (!testResults || !testData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-message">Loading your results...</p>
      </div>
    );
  }

  // Animate score on load
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = testResults.score / 50;
      const scoreAnimation = setInterval(() => {
        current += increment;
        if (current >= testResults.score) {
          current = testResults.score;
          clearInterval(scoreAnimation);
          if (testResults.bandScore >= 8.0) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
          }
        }
        setAnimatedScore(Math.round(current));
      }, 20);
    }, 500);

    return () => clearTimeout(timer);
  }, [testResults.score, testResults.bandScore]);

  const getScoreBand = (bandScore) => {
    if (bandScore >= 8.5) return { 
      band: 'Expert User', 
      color: '#8b5cf6', 
      bgColor: 'bg-purple-50',
      icon: 'emoji_events',
      stars: 5,
      message: 'Outstanding! You have fully operational command of English.'
    };
    if (bandScore >= 7.5) return { 
      band: 'Very Good User', 
      color: '#059669', 
      bgColor: 'bg-green-50',
      icon: 'star',
      stars: 4,
      message: 'Excellent! You handle complex language very well.'
    };
    if (bandScore >= 6.5) return { 
      band: 'Competent User', 
      color: '#3b82f6', 
      bgColor: 'bg-blue-50',
      icon: 'thumb_up',
      stars: 3,
      message: 'Good! You have generally effective command of English.'
    };
    if (bandScore >= 5.5) return { 
      band: 'Modest User', 
      color: '#f59e0b', 
      bgColor: 'bg-yellow-50',
      icon: 'trending_up',
      stars: 2,
      message: 'Fair! You can handle basic communication in familiar situations.'
    };
    return { 
      band: 'Limited User', 
      color: '#ef4444', 
      bgColor: 'bg-red-50',
      icon: 'school',
      stars: 1,
      message: 'Keep practicing! Focus on building your reading skills systematically.'
    };
  };

  const scoreBand = getScoreBand(testResults.bandScore);

  // Helper function to get all questions from test data
  const getAllQuestions = () => {
    return testData.sections.flatMap(section =>
      section.passages.flatMap(passage => passage.questions)
    );
  };

  // Helper function to check if a question is a sub-question
  const isSubQuestion = (questionNumber) => {
    const userAnswer = userAnswers?.get(questionNumber);
    return userAnswer?.isSubQuestion === true;
  };

  // Helper function to get main question for a sub-question
  const getMainQuestion = (questionNumber) => {
    const userAnswer = userAnswers?.get(questionNumber);
    if (userAnswer?.isSubQuestion && userAnswer?.parentQuestionNumber) {
      return getAllQuestions().find(q => q.questionNumber === userAnswer.parentQuestionNumber);
    }
    return null;
  };

  // Helper function to get sub-questions for a main question
  const getSubQuestions = (mainQuestion) => {
    if (!mainQuestion.items) return [];
    
    return mainQuestion.items.map((item, index) => {
      const subQuestionNumber = mainQuestion.questionNumber + index;
      if (subQuestionNumber === mainQuestion.questionNumber) return null; // Skip main question itself
      
      const userAnswer = userAnswers?.get(subQuestionNumber);
      return {
        questionNumber: subQuestionNumber,
        itemText: item.itemText,
        correctAnswer: item.correctHeading,
        userAnswer: userAnswer?.answer || 'No answer'
      };
    }).filter(Boolean);
  };

  // Format user answer for display
  const formatUserAnswer = (question, userAnswer) => {
    if (!userAnswer) return 'No answer selected';
    
    const answer = userAnswer.answer;
    
    switch (question.questionType) {
      case 'MULTIPLE_CHOICE':
        return Array.isArray(answer) ? answer[0] : answer;
        
      case 'TRUE_FALSE_NOT_GIVEN':
      case 'IDENTIFYING_INFORMATION':
      case 'IDENTIFYING_WRITERS_VIEWS':
        return Array.isArray(answer) ? answer[0] : answer;
        
      case 'SENTENCE_COMPLETION':
      case 'SHORT_ANSWER':
        return Array.isArray(answer) ? answer[0] : answer;
        
      case 'MATCHING_HEADINGS':
      case 'MATCH_SENTENCE_ENDINGS':
      case 'MATCHING_FEATURES':
        if (typeof answer === 'object' && !Array.isArray(answer)) {
          return Object.entries(answer)
            .map(([item, selection]) => `${item} → ${selection}`)
            .join('; ');
        }
        return 'No answer selected';
        
      case 'PARAGRAPH_MATCHING':
        return Array.isArray(answer) ? answer[0] : answer;
        
      default:
        // Handle any unknown question types safely
        if (typeof answer === 'object' && !Array.isArray(answer)) {
          return JSON.stringify(answer);
        }
        return Array.isArray(answer) ? answer[0] : String(answer);
    }
  };

  // Format grouped question display
  const formatGroupedAnswer = (question, userAnswer) => {
    if (!userAnswer || !question.items) return [];
    
    const answer = userAnswer.answer;
    if (typeof answer !== 'object' || Array.isArray(answer)) return [];
    
    return question.items.map(item => ({
      itemText: item.itemText,
      userAnswer: answer[item.itemText] || 'No answer',
      correctAnswer: item.correctHeading || item.correctAnswer || 'N/A',
      isCorrect: answer[item.itemText] === (item.correctHeading || item.correctAnswer)
    }));
  };

  // Check if answer is correct
  const isAnswerCorrect = (question, userAnswer) => {
    if (!userAnswer || !question.correctAnswer) return false;
    
    const answer = userAnswer.answer;
    const correctAnswer = question.correctAnswer.toLowerCase().trim();
    
    // Handle multi-item question types
    if (['MATCHING_HEADINGS', 'MATCH_SENTENCE_ENDINGS', 'MATCHING_FEATURES'].includes(question.questionType)) {
      if (typeof answer === 'object' && !Array.isArray(answer)) {
        return question.items?.every(item => 
          answer[item.itemText] === (item.correctHeading || item.correctAnswer)
        ) || false;
      }
      return false;
    }
    
    // Handle single-answer question types
    const userAnswerText = Array.isArray(answer) 
      ? answer[0]?.toLowerCase().trim() 
      : String(answer).toLowerCase().trim();
    
    return userAnswerText === correctAnswer;
  };

  // Get question type statistics
  function getQuestionTypeStats() {
    const typeStats = {};
    const allQuestions = getAllQuestions();
    
    allQuestions.forEach(question => {
      const type = question.questionType;
      const multiItemTypes = ['MATCHING_HEADINGS', 'MATCH_SENTENCE_ENDINGS', 'MATCHING_FEATURES'];
      
      if (!typeStats[type]) {
        typeStats[type] = { correct: 0, total: 0 };
      }
      
      // For multi-item question types, count each item as a separate question
      if (multiItemTypes.includes(question.questionType) && question.items?.length > 0) {
        // Add the number of items to the total
        typeStats[type].total += question.items.length;
        
        // Check each item's answer for correctness
        question.items.forEach((item, itemIndex) => {
          const subQuestionNumber = question.questionNumber + itemIndex;
          const userAnswer = userAnswers?.get(subQuestionNumber);
          
          if (userAnswer && userAnswer.answer) {
            const answer = userAnswer.answer;
            if (typeof answer === 'object' && !Array.isArray(answer)) {
              // Check if this specific item was answered correctly
              const userAnswerForItem = answer[item.itemText];
              const correctAnswer = item.correctHeading || item.correctAnswer;
              if (userAnswerForItem === correctAnswer) {
                typeStats[type].correct++;
              }
            }
          }
        });
      } else {
        // For single questions, count normally
        typeStats[type].total++;
        
        const userAnswer = userAnswers?.get(question.questionNumber);
        if (isAnswerCorrect(question, userAnswer)) {
          typeStats[type].correct++;
        }
      }
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
    navigate('/ielts/reading');
  };

  const handleRetakeTest = () => {
    navigate('/ielts/reading');
  };

  const allQuestions = getAllQuestions();

  return (
    <div className="modern-feedback-fullscreen">
      {/* Back to Home Button */}
      <div className="back-to-home">
        <button
          onClick={handleBackToHome}
          className="back-button"
        >
          <span className="material-icons">arrow_back</span>
          Back to Reading Home
        </button>
      </div>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="confetti">🎉</div>
          <div className="celebration-text">Outstanding Performance!</div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="feedback-main-container">
        {/* Left Section - Score and Skills */}
        <div className="feedback-left-section">
          {/* Hero Section */}
          <div className="feedback-hero-compact">
            <div className="hero-content-compact">
              <div className="achievement-icon-compact">
                <span className="material-icons" style={{ color: scoreBand.color }}>
                  {scoreBand.icon}
                </span>
              </div>
              <h1 className="hero-title-compact">Test Complete!</h1>
              <p className="hero-subtitle-compact">{scoreBand.message}</p>
              
              {/* Star Rating */}
              <div className="star-rating-compact">
                {[...Array(5)].map((_, index) => (
                  <span 
                    key={index} 
                    className={`star ${index < scoreBand.stars ? 'filled' : 'empty'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Score Dashboard */}
          <div className="score-dashboard-compact">
            <div className="score-card-compact">
              <div className="score-visual-compact">
                <div className="score-circle-compact">
                  <svg className="score-circle-bg" viewBox="0 0 36 36">
                    <path
                      className="circle-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="circle"
                      strokeDasharray={`${animatedScore}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      style={{ stroke: scoreBand.color }}
                    />
                  </svg>
                  <div className="score-text">
                    <span className="score-number-compact">{testResults.bandScore}</span>
                    <span className="score-label-compact">IELTS Band</span>
                  </div>
                </div>
              </div>
              
              <div className="score-breakdown-compact">
                <div className="breakdown-item-compact">
                  <div className="breakdown-icon-compact">
                    <span className="material-icons">check_circle</span>
                  </div>
                  <div className="breakdown-content-compact">
                    <span className="breakdown-number-compact">{testResults.correctAnswers}</span>
                    <span className="breakdown-label-compact">Correct</span>
                  </div>
                </div>
                
                <div className="breakdown-item-compact">
                  <div className="breakdown-icon-compact">
                    <span className="material-icons">quiz</span>
                  </div>
                  <div className="breakdown-content-compact">
                    <span className="breakdown-number-compact">{testResults.totalQuestions}</span>
                    <span className="breakdown-label-compact">Total</span>
                  </div>
                </div>
                
                <div className="breakdown-item-compact">
                  <div className="breakdown-icon-compact">
                    <span className="material-icons">grade</span>
                  </div>
                  <div className="breakdown-content-compact">
                    <span className="breakdown-number-compact">{testResults.score}%</span>
                    <span className="breakdown-label-compact">Percentage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="skills-analysis-compact">
            <h2 className="section-title-compact">
              <span className="material-icons">analytics</span>
              Skills Analysis
            </h2>
            
            <div className="skills-grid-compact">
              {getQuestionTypeStats().map((stat, index) => (
                <div key={stat.type} className="skill-card-compact">
                  <div className="skill-header-compact">
                    <div className="skill-icon-compact">
                      <span className="material-icons">
                        {stat.type.includes('MULTIPLE_CHOICE') ? 'quiz' :
                         stat.type.includes('TRUE_FALSE') ? 'fact_check' :
                         stat.type.includes('SENTENCE_COMPLETION') ? 'edit' :
                         stat.type.includes('MATCHING_HEADINGS') ? 'list' :
                         stat.type.includes('PARAGRAPH_MATCHING') ? 'article' :
                         'help_outline'}
                      </span>
                    </div>
                    <h3 className="skill-name-compact">{stat.type.replace(/_/g, ' ')}</h3>
                  </div>
                  
                  <div className="skill-score-compact">
                    <div className="skill-percentage-compact" style={{ color: stat.percentage >= 70 ? '#059669' : '#ef4444' }}>
                      {stat.percentage}%
                    </div>
                    <div className="skill-fraction-compact">{stat.correct}/{stat.total}</div>
                  </div>
                  
                  <div className="skill-progress-compact">
                    <div 
                      className="skill-progress-fill-compact"
                      style={{ 
                        width: `${stat.percentage}%`,
                        backgroundColor: stat.percentage >= 70 ? '#059669' : '#ef4444'
                      }}
                    ></div>
                  </div>
                  
                  <div className="skill-status-compact">
                    {stat.percentage >= 90 ? (
                      <span className="status-excellent">
                        <span className="material-icons">star</span>
                        Excellent
                      </span>
                    ) : stat.percentage >= 70 ? (
                      <span className="status-good">
                        <span className="material-icons">thumb_up</span>
                        Good
                      </span>
                    ) : (
                      <span className="status-needs-work">
                        <span className="material-icons">trending_up</span>
                        Needs Practice
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Tips */}
          <div className="improvement-section-compact">
            <h2 className="section-title-compact">
              <span className="material-icons">lightbulb</span>
              Personalized Tips
            </h2>
            
            <div className="tips-grid-compact">
              {testResults.bandScore < 7.0 && (
                <div className="tip-card-compact">
                  <div className="tip-icon-compact">
                    <span className="material-icons">library_books</span>
                  </div>
                  <h3>Daily Reading Practice</h3>
                  <p>Read academic passages daily to improve comprehension speed and accuracy.</p>
                </div>
              )}
              
              {testResults.bandScore < 8.0 && (
                <div className="tip-card-compact">
                  <div className="tip-icon-compact">
                    <span className="material-icons">timer</span>
                  </div>
                  <h3>Time Management</h3>
                  <p>Practice timing yourself - aim for 20 minutes per passage including all questions.</p>
                </div>
              )}
              
              <div className="tip-card-compact">
                <div className="tip-icon-compact">
                  <span className="material-icons">psychology</span>
                </div>
                <h3>Question Strategy</h3>
                <p>Learn specific strategies for each IELTS question type. Practice skimming and scanning.</p>
              </div>
              
              {getWorstPerformingTypes().map(type => (
                <div key={type} className="tip-card-compact">
                  <div className="tip-icon-compact">
                    <span className="material-icons">target</span>
                  </div>
                  <h3>Focus: {type.replace(/_/g, ' ')}</h3>
                  <p>This question type needs extra attention. Practice identifying key information and keywords.</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-section-compact">
            <button
              onClick={handleRetakeTest}
              className="action-button-compact primary"
            >
              <span className="material-icons">refresh</span>
              Take Another Test
            </button>
          </div>
        </div>

        {/* Right Section - Detailed Review */}
        <div className="feedback-right-section">
          <div className="question-review-fixed">
            <h2 className="section-title-fixed">
              <span className="material-icons">rate_review</span>
              Detailed Review
            </h2>
            
            <div className="questions-scroll-container">
              {testData.sections.map((section, sectionIndex) => (
                <div key={section.sectionNumber} className="section-review-fixed">
                  <div className="section-header-fixed">
                    <span className="material-icons">folder</span>
                    <h3>Section {section.sectionNumber}: {section.sectionTitle}</h3>
                  </div>
                  
                  {section.passages.map((passage, passageIndex) => (
                    <div key={passage.passageNumber} className="passage-review-fixed">
                      <div className="passage-header-fixed">
                        <span className="material-icons">article</span>
                        <h4>Passage {passage.passageNumber}: {passage.passageTitle}</h4>
                      </div>
                      
                      <div className="questions-grid-fixed">
                        {passage.questions.map((question, questionIndex) => {
                          // Skip sub-questions as they are handled within their main question
                          if (isSubQuestion(question.questionNumber)) {
                            return null;
                          }

                          const userAnswer = userAnswers?.get(question.questionNumber);
                          const isCorrect = isAnswerCorrect(question, userAnswer);

                          // Handle grouped questions (multi-item question types) - treat each item as individual question
                          if (['MATCHING_HEADINGS', 'MATCH_SENTENCE_ENDINGS', 'MATCHING_FEATURES'].includes(question.questionType) && question.items) {
                            const groupedAnswers = formatGroupedAnswer(question, userAnswer);
                            
                            // Render each item as an individual question card
                            return groupedAnswers.map((item, itemIndex) => {
                              const questionNumber = question.questionNumber + itemIndex;
                              
                              return (
                                <div key={`${question.questionNumber}-${itemIndex}`} className={`question-card-fixed ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                                  <div className="question-header-fixed">
                                    <div className="question-number-badge-fixed">
                                      Q{questionNumber}
                                    </div>
                                    <div className="question-type-badge-fixed">
                                      {question.questionType.replace(/_/g, ' ')}
                                    </div>
                                    <div className={`result-badge-fixed ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                                      <span className="material-icons">
                                        {item.isCorrect ? 'check_circle' : 'cancel'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="question-content-fixed">
                                    <p className="question-text-fixed">{item.itemText}</p>
                                    
                                    <div className="answers-comparison-fixed">
                                      <div className="answer-block-fixed">
                                        <span className="answer-label-fixed">Your Answer:</span>
                                        <span className={`answer-text-fixed ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                                          {item.userAnswer}
                                        </span>
                                      </div>
                                      
                                      {!item.isCorrect && (
                                        <div className="answer-block-fixed">
                                          <span className="answer-label-fixed">Correct Answer:</span>
                                          <span className="answer-text-fixed correct">
                                            {item.correctAnswer}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          }

                          // Regular single questions
                          return (
                            <div key={question.questionNumber} className={`question-card-fixed ${isCorrect ? 'correct' : 'incorrect'}`}>
                              <div className="question-header-fixed">
                                <div className="question-number-badge-fixed">
                                  Q{question.questionNumber}
                                </div>
                                <div className="question-type-badge-fixed">
                                  {question.questionType.replace(/_/g, ' ')}
                                </div>
                                <div className={`result-badge-fixed ${isCorrect ? 'correct' : 'incorrect'}`}>
                                  <span className="material-icons">
                                    {isCorrect ? 'check_circle' : 'cancel'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="question-content-fixed">
                                <p className="question-text-fixed">{question.questionText}</p>
                                
                                <div className="answers-comparison-fixed">
                                  <div className="answer-block-fixed">
                                    <span className="answer-label-fixed">Your Answer:</span>
                                    <span className={`answer-text-fixed ${isCorrect ? 'correct' : 'incorrect'}`}>
                                      {formatUserAnswer(question, userAnswer)}
                                    </span>
                                  </div>
                                  
                                  {!isCorrect && (
                                    <div className="answer-block-fixed">
                                      <span className="answer-label-fixed">Correct Answer:</span>
                                      <span className="answer-text-fixed correct">
                                        {question.correctAnswer}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }).flat().filter(Boolean)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingFeedback; 