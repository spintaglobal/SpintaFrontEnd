import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MultipleChoiceQuestion from './MultipleChoiceQuestion.jsx';
import OpenClozeQuestion from './OpenClozeQuestion.jsx';
import WordFormationQuestion from './WordFormationQuestion.jsx';
import KeyWordTransformationQuestion from './KeyWordTransformationQuestion.jsx';
import GappedTextQuestion from './GappedTextQuestion.jsx';
import MultipleMatchingQuestion from './MultipleMatchingQuestion.jsx';

const ReadingTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testData, level, testId } = location.state || {};

  // Redirect if no test data
  useEffect(() => {
    if (!testData) {
      navigate('/cambridge/reading');
    }
  }, [testData, navigate]);

  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewFlags, setReviewFlags] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(testData?.estimatedTimeMinutes * 60 || 5400);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [lastSaved, setLastSaved] = useState(new Date());

  const autoSaveTimeoutRef = useRef(null);

  // Auto-submit when time runs out
  const handleAutoSubmit = useCallback(() => {
    setShowSubmissionModal(true);
  }, []);

  // Auto-save functionality
  const debouncedAutoSave = useCallback((data) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setAutoSaveStatus('saving');
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(`cambridge_test_${testId}`, JSON.stringify({
        answers: data,
        reviewFlags: Array.from(reviewFlags),
        currentSection,
        currentQuestion,
        timeRemaining,
        lastSaved: new Date().toISOString()
      }));
      
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
    }, 1000);
  }, [testId, reviewFlags, currentSection, currentQuestion, timeRemaining]);

  // Handle answer changes
  const handleAnswerChange = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    debouncedAutoSave(newAnswers);
  };

  // Handle review flag toggle
  const toggleReviewFlag = (questionId) => {
    setReviewFlags(prev => {
      const newFlags = new Set(prev);
      if (newFlags.has(questionId)) {
        newFlags.delete(questionId);
      } else {
        newFlags.add(questionId);
      }
      return newFlags;
    });
  };

  // Format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Navigation helpers
  const getCurrentQuestionData = () => {
    const section = testData?.sections?.[currentSection];
    if (!section) return null;

    let questionCounter = 0;
    for (const passage of section.passages || []) {
      for (const question of passage.questions || []) {
        if (questionCounter === currentQuestion) {
          return {
            ...question,
            passage: passage
          };
        }
        questionCounter++;
      }
    }
    return null;
  };

  const getTotalQuestions = () => {
    return testData?.sections?.reduce((total, section) => {
      return total + (section.passages?.reduce((passageTotal, passage) => 
        passageTotal + (passage.questions?.length || 0), 0) || 0);
    }, 0) || 0;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const navigateToQuestion = (sectionIndex, questionIndex) => {
    setCurrentSection(sectionIndex);
    setCurrentQuestion(questionIndex);
    setShowNavigation(false);
  };

  // Get current passage index for grouped questions
  const getCurrentPassageIndex = () => {
    if (!testData?.sections?.[currentSection]?.passages) return 0;
    
    const section = testData.sections[currentSection];
    let questionCount = 0;
    
    for (let passageIndex = 0; passageIndex < section.passages.length; passageIndex++) {
      const passage = section.passages[passageIndex];
      const questionsInPassage = passage.questions?.length || 0;
      
      if (currentQuestion >= questionCount && currentQuestion < questionCount + questionsInPassage) {
        return passageIndex;
      }
      questionCount += questionsInPassage;
    }
    return 0;
  };

  // Check if current question type should be grouped
  const shouldGroupQuestions = (questionType) => {
    return ['FILL_IN_THE_BLANK', 'WORD_FORMATION', 'KEY_WORD_TRANSFORMATION', 'GAPPED_TEXT', 'MULTIPLE_MATCHING'].includes(questionType);
  };

  // Get next navigation target
  const getNextNavigationTarget = () => {
    const section = testData.sections[currentSection];
    const currentPassageIndex = getCurrentPassageIndex();
    const currentQuestionType = getCurrentQuestionData()?.questionType;
    
    if (shouldGroupQuestions(currentQuestionType)) {
      if (currentPassageIndex < section.passages.length - 1) {
        let questionCount = 0;
        for (let i = 0; i <= currentPassageIndex; i++) {
          questionCount += section.passages[i].questions?.length || 0;
        }
        return { section: currentSection, question: questionCount };
      } else if (currentSection < testData.sections.length - 1) {
        return { section: currentSection + 1, question: 0 };
      }
    } else {
      const totalQuestionsInSection = section?.passages?.reduce((total, passage) => 
        total + (passage.questions?.length || 0), 0) || 0;
      
      if (currentQuestion < totalQuestionsInSection - 1) {
        return { section: currentSection, question: currentQuestion + 1 };
      } else if (currentSection < testData.sections.length - 1) {
        return { section: currentSection + 1, question: 0 };
      }
    }
    return null;
  };

  // Get previous navigation target
  const getPreviousNavigationTarget = () => {
    const section = testData.sections[currentSection];
    const currentPassageIndex = getCurrentPassageIndex();
    const currentQuestionType = getCurrentQuestionData()?.questionType;
    
    if (shouldGroupQuestions(currentQuestionType)) {
      if (currentPassageIndex > 0) {
        let questionCount = 0;
        for (let i = 0; i < currentPassageIndex - 1; i++) {
          questionCount += section.passages[i].questions?.length || 0;
        }
        return { section: currentSection, question: questionCount };
      } else if (currentSection > 0) {
        const prevSection = testData.sections[currentSection - 1];
        let questionCount = 0;
        for (let i = 0; i < prevSection.passages.length - 1; i++) {
          questionCount += prevSection.passages[i].questions?.length || 0;
        }
        return { section: currentSection - 1, question: questionCount };
      }
    } else {
      if (currentQuestion > 0) {
        return { section: currentSection, question: currentQuestion - 1 };
      } else if (currentSection > 0) {
        const prevSection = testData.sections[currentSection - 1];
        const prevSectionQuestions = prevSection?.passages?.reduce((total, passage) => 
          total + (passage.questions?.length || 0), 0) || 0;
        return { section: currentSection - 1, question: prevSectionQuestions - 1 };
      }
    }
    return null;
  };

  const handleNext = () => {
    const next = getNextNavigationTarget();
    if (next) {
      setCurrentSection(next.section);
      setCurrentQuestion(next.question);
    }
  };

  const handlePrevious = () => {
    const previous = getPreviousNavigationTarget();
    if (previous) {
      setCurrentSection(previous.section);
      setCurrentQuestion(previous.question);
    }
  };

  // Check if we're on the last question
  const isLastQuestion = () => {
    return currentSection === testData.sections.length - 1 && 
           currentQuestion >= (testData.sections[currentSection]?.passages?.reduce((total, passage) => 
             total + (passage.questions?.length || 0), 0) || 0) - 1;
  };

  // Calculate score and show results
  const calculateResults = () => {
    let correct = 0;
    let total = 0;
    const results = {};

    testData.sections.forEach((section, sectionIndex) => {
      section.passages?.forEach((passage, passageIndex) => {
        passage.questions?.forEach((question, questionIndex) => {
          total++;
          const questionId = `section_${sectionIndex}_question_${questionIndex}`;
          const userAnswer = answers[questionId];
          const isCorrect = userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
          
          if (isCorrect) {
            correct++;
          }

          results[questionId] = {
            questionNumber: question.questionNumber,
            userAnswer: userAnswer || 'No answer',
            correctAnswer: question.correctAnswer,
            isCorrect
          };
        });
      });
    });

    return { correct, total, percentage: Math.round((correct / total) * 100), results };
  };

  // Timer functionality
  useEffect(() => {
    let interval;
    if (timerEnabled && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerEnabled(false);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerEnabled, timeRemaining, handleAutoSubmit]);

  // Render question based on type
  const renderQuestion = () => {
    const questionWithPassage = getCurrentQuestionData();
    
    if (!questionWithPassage) {
      return (
        <div className="text-center text-white/80 py-12">
          <span className="material-icons text-4xl mb-4">quiz</span>
          <p>Question not found</p>
        </div>
      );
    }

    const { passage, ...questionData } = questionWithPassage;
    const sectionData = testData.sections[currentSection];
    const questionId = `section_${currentSection}_question_${currentQuestion}`;
    const currentAnswer = answers[questionId];

    const commonProps = {
      question: questionData,
      selectedAnswer: currentAnswer,
      onAnswerChange: (answer) => handleAnswerChange(questionId, answer),
      questionNumber: questionData.questionNumber,
      sectionData,
      passage: passage,
      questionId,
      level
    };

    switch (questionData.questionType) {
      case 'MULTIPLE_CHOICE':
        return <MultipleChoiceQuestion {...commonProps} />;
      case 'FILL_IN_THE_BLANK':
        const currentPassageData = sectionData.passages[getCurrentPassageIndex()];
        const fillInTheBlankQuestions = currentPassageData?.questions?.filter(q => q.questionType === 'FILL_IN_THE_BLANK') || [];
        
        const fillInTheBlankAnswers = {};
        fillInTheBlankQuestions.forEach(q => {
          const questionIndex = currentPassageData?.questions?.findIndex(quest => quest.questionNumber === q.questionNumber);
          if (questionIndex !== -1) {
            const qId = `section_${currentSection}_question_${questionIndex}`;
            fillInTheBlankAnswers[q.questionNumber] = answers[qId] || '';
          }
        });
        
        return (
          <OpenClozeQuestion
            passage={passage}
            questions={fillInTheBlankQuestions}
            answers={fillInTheBlankAnswers}
            onAnswerChange={(questionNumber, answer) => {
              const questionIndex = currentPassageData?.questions?.findIndex(q => q.questionNumber === questionNumber);
              if (questionIndex !== -1) {
                const qId = `section_${currentSection}_question_${questionIndex}`;
                handleAnswerChange(qId, answer);
              }
            }}
            questionNumber={questionData.questionNumber}
          />
        );
      case 'WORD_FORMATION':
        const currentPassageData2 = sectionData.passages[getCurrentPassageIndex()];
        const wordFormationQuestions = currentPassageData2?.questions?.filter(q => q.questionType === 'WORD_FORMATION') || [];
        
        const wordFormationAnswers = {};
        wordFormationQuestions.forEach(q => {
          const questionIndex = currentPassageData2?.questions?.findIndex(quest => quest.questionNumber === q.questionNumber);
          if (questionIndex !== -1) {
            const qId = `section_${currentSection}_question_${questionIndex}`;
            wordFormationAnswers[q.questionNumber] = answers[qId] || '';
          }
        });
        
        return (
          <WordFormationQuestion
            passage={passage}
            questions={wordFormationQuestions}
            answers={wordFormationAnswers}
            onAnswerChange={(questionNumber, answer) => {
              const questionIndex = currentPassageData2?.questions?.findIndex(q => q.questionNumber === questionNumber);
              if (questionIndex !== -1) {
                const qId = `section_${currentSection}_question_${questionIndex}`;
                handleAnswerChange(qId, answer);
              }
            }}
            questionNumber={questionData.questionNumber}
          />
        );
      case 'KEY_WORD_TRANSFORMATION':
        const currentPassageData3 = sectionData.passages[getCurrentPassageIndex()];
        const keyWordTransformationQuestions = currentPassageData3?.questions?.filter(q => q.questionType === 'KEY_WORD_TRANSFORMATION') || [];
        
        const keyWordTransformationAnswers = {};
        keyWordTransformationQuestions.forEach(q => {
          const questionIndex = currentPassageData3?.questions?.findIndex(quest => quest.questionNumber === q.questionNumber);
          if (questionIndex !== -1) {
            const qId = `section_${currentSection}_question_${questionIndex}`;
            keyWordTransformationAnswers[q.questionNumber] = answers[qId] || '';
          }
        });
        
        return (
          <KeyWordTransformationQuestion
            questions={keyWordTransformationQuestions}
            answers={keyWordTransformationAnswers}
            onAnswerChange={(questionNumber, answer) => {
              const questionIndex = currentPassageData3?.questions?.findIndex(q => q.questionNumber === questionNumber);
              if (questionIndex !== -1) {
                const qId = `section_${currentSection}_question_${questionIndex}`;
                handleAnswerChange(qId, answer);
              }
            }}
            questionNumber={questionData.questionNumber}
            level={level}
          />
        );
      case 'GAPPED_TEXT':
        const currentPassageData4 = sectionData.passages[getCurrentPassageIndex()];
        const gappedTextQuestions = currentPassageData4?.questions?.filter(q => q.questionType === 'GAPPED_TEXT') || [];
        
        const gappedTextAnswers = {};
        gappedTextQuestions.forEach(q => {
          const questionIndex = currentPassageData4?.questions?.findIndex(quest => quest.questionNumber === q.questionNumber);
          if (questionIndex !== -1) {
            const qId = `section_${currentSection}_question_${questionIndex}`;
            gappedTextAnswers[q.questionNumber] = answers[qId] || '';
          }
        });
        
        return (
          <GappedTextQuestion
            passage={passage}
            questions={gappedTextQuestions}
            answers={gappedTextAnswers}
            onAnswerChange={(questionNumber, answer) => {
              const questionIndex = currentPassageData4?.questions?.findIndex(q => q.questionNumber === questionNumber);
              if (questionIndex !== -1) {
                const qId = `section_${currentSection}_question_${questionIndex}`;
                handleAnswerChange(qId, answer);
              }
            }}
            questionNumber={questionData.questionNumber}
            level={level}
          />
        );
      case 'MULTIPLE_MATCHING':
        const currentPassageData5 = sectionData.passages[getCurrentPassageIndex()];
        const multipleMatchingQuestions = currentPassageData5?.questions?.filter(q => q.questionType === 'MULTIPLE_MATCHING') || [];
        
        const multipleMatchingAnswers = {};
        multipleMatchingQuestions.forEach(q => {
          const questionIndex = currentPassageData5?.questions?.findIndex(quest => quest.questionNumber === q.questionNumber);
          if (questionIndex !== -1) {
            const qId = `section_${currentSection}_question_${questionIndex}`;
            multipleMatchingAnswers[q.questionNumber] = answers[qId] || '';
          }
        });
        
        return (
          <MultipleMatchingQuestion
            passage={passage}
            questions={multipleMatchingQuestions}
            answers={multipleMatchingAnswers}
            onAnswerChange={(questionNumber, answer) => {
              const questionIndex = currentPassageData5?.questions?.findIndex(q => q.questionNumber === questionNumber);
              if (questionIndex !== -1) {
                const qId = `section_${currentSection}_question_${questionIndex}`;
                handleAnswerChange(qId, answer);
              }
            }}
            questionNumber={questionData.questionNumber}
            sectionData={sectionData}
            level={level}
          />
        );
      default:
        return (
          <div className="text-center text-white/80 py-12">
            <span className="material-icons text-4xl mb-4">help</span>
            <p>Unknown question type: {questionData.questionType}</p>
          </div>
        );
    }
  };

  // Render navigation modal
  const renderNavigationModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-white/20 w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Question Navigation</h2>
            <button
              onClick={() => setShowNavigation(false)}
              className="text-white/60 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {testData.sections.map((section, sectionIndex) => {
            const allQuestions = [];
            section.passages?.forEach(passage => {
              passage.questions?.forEach(question => {
                allQuestions.push(question);
              });
            });
            
            return (
              <div key={sectionIndex} className="border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Part {section.sectionNumber}: {section.sectionTitle}
                </h3>
                
                <div className="grid grid-cols-10 gap-2">
                  {allQuestions.map((question, questionIndex) => {
                    const questionId = `section_${sectionIndex}_question_${questionIndex}`;
                    const isAnswered = answers.hasOwnProperty(questionId);
                    const isReviewed = reviewFlags.has(questionId);
                    const isCurrent = currentSection === sectionIndex && currentQuestion === questionIndex;
                    
                    return (
                      <button
                        key={questionIndex}
                        onClick={() => navigateToQuestion(sectionIndex, questionIndex)}
                        className={`
                          relative w-10 h-10 rounded-lg border-2 text-sm font-semibold transition-all
                          ${isCurrent 
                            ? 'bg-blue-500 border-blue-400 text-white' 
                            : isAnswered 
                              ? 'bg-green-500/20 border-green-400 text-green-300'
                              : isReviewed
                                ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                                : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                          }
                        `}
                      >
                        {question.questionNumber}
                        {isReviewed && (
                          <span className="absolute -top-1 -right-1 text-yellow-400 text-xs">🏷</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render submission modal with results
  const renderSubmissionModal = () => {
    const results = calculateResults();
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Test Results</h2>
            
            {/* Score summary */}
            <div className="mb-6 p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {results.correct}/{results.total}
                </div>
                <div className="text-xl text-white mb-2">
                  Score: {results.percentage}%
                </div>
                <div className="text-white/70">
                  {results.percentage >= 70 ? '🎉 Well done!' : results.percentage >= 50 ? '👍 Good effort!' : '💪 Keep practicing!'}
                </div>
              </div>
            </div>

            {/* Detailed results */}
            <div className="mb-6 max-h-64 overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Question Details</h3>
              <div className="space-y-2">
                {Object.entries(results.results).map(([questionId, result]) => (
                  <div key={questionId} className={`p-3 rounded-lg border ${
                    result.isCorrect 
                      ? 'bg-green-500/10 border-green-400/30' 
                      : 'bg-red-500/10 border-red-400/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Q{result.questionNumber}</span>
                      <span className={result.isCorrect ? 'text-green-400' : 'text-red-400'}>
                        {result.isCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="text-sm text-white/70 mt-1">
                      Your answer: {result.userAnswer}
                    </div>
                    {!result.isCorrect && (
                      <div className="text-sm text-green-300 mt-1">
                        Correct: {result.correctAnswer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={() => {
                  navigate('/cambridge/reading', { 
                    state: { 
                      testCompleted: true,
                      results: results
                    } 
                  });
                }}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
              >
                Finish & Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!testData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-gray-800/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNavigation(true)}
                className="px-3 py-1.5 bg-purple-500/20 border border-purple-400/50 rounded text-purple-300 hover:bg-purple-500/30 transition-colors text-sm"
              >
                🔢 Questions
              </button>
              
              <div className="text-white/80 text-sm">
                Part {testData.sections[currentSection]?.sectionNumber} - Q{getCurrentQuestionData()?.questionNumber}
              </div>
            </div>

            {/* Center - Timer */}
            {timerEnabled && (
              <div className={`px-4 py-2 rounded-lg border-2 ${
                timeRemaining < 300 
                  ? 'bg-red-500/20 border-red-400 text-red-300' 
                  : timeRemaining < 900
                    ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                    : 'bg-green-500/20 border-green-400 text-green-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <span>⏱</span>
                  <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                </div>
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`px-3 py-1.5 border rounded text-sm transition-colors ${
                  timerEnabled 
                    ? 'bg-green-500/20 border-green-400/50 text-green-300'
                    : 'bg-gray-500/20 border-gray-400/50 text-gray-300'
                }`}
              >
                {timerEnabled ? 'Timer On' : 'Timer Off'}
              </button>

              <button
                onClick={() => setShowSubmissionModal(true)}
                className="px-4 py-1.5 bg-red-500/20 border border-red-400/50 rounded text-red-300 hover:bg-red-500/30 transition-colors text-sm"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-gray-800/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm text-white/70 mb-1">
            <span>Progress</span>
            <span>{getAnsweredCount()}/{getTotalQuestions()}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(getAnsweredCount() / getTotalQuestions()) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Section info */}
        <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {testData.sections[currentSection]?.sectionTitle}
              </h2>
              <p className="text-white/70 text-sm mt-1">
                {testData.sections[currentSection]?.sectionDescription}
              </p>
            </div>
            <div className="text-right">
              <div className="text-white/80 font-medium">
                Question {getCurrentQuestionData()?.questionNumber}
              </div>
              <div className="text-white/60 text-sm">
                Part {testData.sections[currentSection]?.sectionNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Question content */}
        <div className="mb-6">
          {renderQuestion()}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentSection === 0 && currentQuestion === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <span>←</span>
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggleReviewFlag(`section_${currentSection}_question_${currentQuestion}`)}
              className={`px-4 py-2 border rounded transition-colors ${
                reviewFlags.has(`section_${currentSection}_question_${currentQuestion}`)
                  ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                  : 'bg-gray-500/20 border-gray-400 text-gray-300 hover:bg-gray-500/30'
              }`}
            >
              🏷 {reviewFlags.has(`section_${currentSection}_question_${currentQuestion}`) ? 'Remove Flag' : 'Flag for Review'}
            </button>
          </div>

          {/* Conditional Next/Submit button */}
          {isLastQuestion() ? (
            <button
              onClick={() => setShowSubmissionModal(true)}
              className="flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-semibold"
            >
              <span>Submit Test</span>
              <span>✓</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <span>Next</span>
              <span>→</span>
            </button>
          )}
        </div>
      </main>

      {/* Modals */}
      {showNavigation && renderNavigationModal()}
      {showSubmissionModal && renderSubmissionModal()}
    </div>
  );
};

export default ReadingTest; 