import React, { useState } from 'react';
import { useToeflReadingContext } from './ToeflReadingContext';
import { Button } from '../../ui/button';
import './ToeflReading.css';

const ToeflReadingTask = () => {
  const {
    passages,
    currentPassage,
    currentQuestion,
    userAnswers,
    timeRemaining,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    finishTest,
    formatTime,
    navigateToQuestion
  } = useToeflReadingContext();

  const [showReview, setShowReview] = useState(false);
  const [selectedStatements, setSelectedStatements] = useState({});

  if (!passages || passages.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-message">Loading reading passages...</p>
      </div>
    );
  }

  const passage = passages[currentPassage];
  const question = passage?.questions?.[currentQuestion];
  
  if (!passage || !question) {
    return (
      <div className="error-container">
        <p className="error-message">Error loading passage or question.</p>
        <Button onClick={finishTest}>Finish Test</Button>
      </div>
    );
  }

  const handleAnswerSelect = (optionIndex) => {
    if (question.type === 'PROSE_SUMMARY') {
      // Handle multiple selection for prose summary
      const currentAnswers = userAnswers[question.id] || [];
      let newAnswers;
      
      if (currentAnswers.includes(optionIndex)) {
        newAnswers = currentAnswers.filter(index => index !== optionIndex);
      } else if (currentAnswers.length < 3) {
        newAnswers = [...currentAnswers, optionIndex];
      } else {
        return; // Already have 3 selections
      }
      
      submitAnswer(question.id, newAnswers);
    } else {
      submitAnswer(question.id, optionIndex);
    }
  };

  const handleTableAnswer = (statementIndex, categoryIndex) => {
    const currentAnswers = userAnswers[question.id] || {};
    submitAnswer(question.id, {
      ...currentAnswers,
      [statementIndex]: categoryIndex
    });
  };

  const isLastQuestion = () => {
    return currentPassage === passages.length - 1 && 
           currentQuestion === passage.questions.length - 1;
  };

  const canGoNext = () => {
    return currentQuestion < passage.questions.length - 1 || 
           currentPassage < passages.length - 1;
  };

  const canGoPrevious = () => {
    return currentQuestion > 0 || currentPassage > 0;
  };

  const getTimerClass = () => {
    if (timeRemaining <= 300) return 'critical'; // 5 minutes
    if (timeRemaining <= 600) return 'warning';  // 10 minutes
    return '';
  };

  const getTotalQuestionNumber = () => {
    let total = 0;
    for (let i = 0; i < currentPassage; i++) {
      total += passages[i].questions.length;
    }
    return total + currentQuestion + 1;
  };

  const getTotalQuestions = () => {
    return passages.reduce((total, p) => total + p.questions.length, 0);
  };

  const renderPassageText = () => {
    let text = passage.text;
    
    // Remove the highlighted sentence markers from display
    text = text.replace(/\*\*HIGHLIGHTED_SENTENCE_START\*\*/g, '');
    text = text.replace(/\*\*HIGHLIGHTED_SENTENCE_END\*\*/g, '');
    
    // Handle sentence highlighting for SENTENCE_SIMPLIFICATION questions
    if (question.type === 'SENTENCE_SIMPLIFICATION' && question.sentenceToHighlight) {
      const highlightedSentence = question.sentenceToHighlight;
      text = text.replace(
        highlightedSentence,
        `<mark class="highlighted-sentence">${highlightedSentence}</mark>`
      );
    }
    
    // Handle insertion points for INSERT_TEXT questions - show numbered positions
    if (question.type === 'INSERT_TEXT') {
      // Replace [1], [2], [3], [4] with numbered insertion points
      text = text.replace(/\[1\]/g, '<span class="insertion-point" data-point="1">■1</span>');
      text = text.replace(/\[2\]/g, '<span class="insertion-point" data-point="2">■2</span>');
      text = text.replace(/\[3\]/g, '<span class="insertion-point" data-point="3">■3</span>');
      text = text.replace(/\[4\]/g, '<span class="insertion-point" data-point="4">■4</span>');
    } else {
      // For other question types, just remove the insertion markers
      text = text.replace(/\[\d+\]/g, '');
    }
    
    return text.split('\n').map((paragraph, index) => (
      <p key={index} className="passage-text" dangerouslySetInnerHTML={{ __html: paragraph }} />
    ));
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'SENTENCE_SIMPLIFICATION':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-2xl p-6 border border-cyan-400/40 backdrop-blur-sm">
              <div className="text-cyan-200 text-base font-semibold mb-4">
                The highlighted sentence below appears in the passage:
              </div>
              <div className="bg-gradient-to-r from-cyan-400/20 to-blue-400/20 border border-cyan-300/50 rounded-xl p-5 mb-5">
                <p className="text-white text-lg leading-relaxed font-medium">{question.sentenceToHighlight}</p>
              </div>
              <div className="text-white text-lg font-bold">
                Which of the following best expresses the essential information of the highlighted sentence?
              </div>
            </div>
            {renderStandardOptions()}
          </div>
        );

      case 'INSERT_TEXT':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-2xl p-6 border border-purple-400/40 backdrop-blur-sm">
              <div className="text-purple-200 text-base font-semibold mb-4">
                Look at the four squares [■] in the passage that indicate where the following sentence could be added:
              </div>
              <div className="bg-gradient-to-r from-purple-400/20 to-pink-400/20 border border-purple-300/50 rounded-xl p-5 mb-5">
                <p className="text-white text-lg leading-relaxed font-medium">{question.sentenceToInsert}</p>
              </div>
              <div className="text-white text-lg font-bold">
                Where would the sentence best fit?
              </div>
            </div>
            {renderInsertTextOptions()}
          </div>
        );

      case 'FILL_IN_A_TABLE':
        return (
          <div className="space-y-6">
            <div className="text-white text-lg font-bold leading-relaxed mb-6">{question.question}</div>
            {renderTableQuestion()}
          </div>
        );

      case 'PROSE_SUMMARY':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-500/15 to-green-500/15 rounded-2xl p-6 border border-emerald-400/40 backdrop-blur-sm">
              <div className="text-white text-lg font-bold leading-relaxed mb-4">{question.question}</div>
              <div className="text-emerald-200 text-base font-semibold">
                Select THREE answer choices that express the most important ideas in the passage.
              </div>
            </div>
            {renderProseSummaryOptions()}
          </div>
        );

      case 'VOCABULARY':
        return (
          <div className="space-y-6">
            <div className="text-white text-lg font-bold leading-relaxed">{question.question}</div>
            {renderStandardOptions()}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="text-white text-lg font-bold leading-relaxed">{question.question}</div>
            {renderStandardOptions()}
          </div>
        );
    }
  };

  const renderStandardOptions = () => (
    <div className="space-y-4">
      {question.options.map((option, index) => {
        const isSelected = userAnswers[question.id] === index;
        return (
          <label
            key={index}
            className={`block p-5 rounded-xl border cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
              isSelected
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-cyan-300/60 text-white shadow-lg'
                : 'bg-gradient-to-r from-white/8 to-white/12 border-white/30 text-white/90 hover:bg-gradient-to-r hover:from-white/15 hover:to-white/20 hover:border-white/40'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={isSelected}
              onChange={() => handleAnswerSelect(index)}
              className="sr-only"
            />
            <div className="flex items-start space-x-4">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                isSelected
                  ? 'border-cyan-300 bg-gradient-to-r from-cyan-400 to-blue-400'
                  : 'border-white/50'
              }`}>
                {isSelected && (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <span className="font-bold text-lg mr-3 text-yellow-300">{String.fromCharCode(65 + index)}.</span>
                <span className="text-lg leading-relaxed font-medium">{processTextWithBold(option) || 'Option text missing'}</span>
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );

  const renderInsertTextOptions = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((position) => {
        const isSelected = userAnswers[question.id] === position;
        return (
          <label
            key={position}
            className={`block p-5 rounded-xl border cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
              isSelected
                ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-300/60 text-white shadow-lg'
                : 'bg-gradient-to-r from-white/8 to-white/12 border-white/30 text-white/90 hover:bg-gradient-to-r hover:from-white/15 hover:to-white/20 hover:border-white/40'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={isSelected}
              onChange={() => handleAnswerSelect(position)}
              className="sr-only"
            />
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center ${
                isSelected
                  ? 'border-purple-300 bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                  : 'border-white/50 text-white/70'
              }`}>
                <span className="font-bold text-base">■{position}</span>
              </div>
              <span className="text-base font-semibold">Position {position}</span>
            </div>
          </label>
        );
      })}
    </div>
  );

  // Helper function to process text with **bold** markers
  const processTextWithBold = (text) => {
    if (!text) return text;
    
    // Split text by **markers and process each part
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** markers and wrap in a styled span
        const boldText = part.slice(2, -2);
        return (
          <span key={index} className="prose-summary-bold-text">
            {boldText}
          </span>
        );
      }
      return part;
    });
  };

  const renderProseSummaryOptions = () => {
    const currentAnswers = userAnswers[question.id] || [];
    
    return (
      <div className="space-y-4">
        {question.options.map((option, index) => {
          const isSelected = currentAnswers.includes(index);
          const isDisabled = currentAnswers.length >= 3 && !isSelected;
          
          return (
            <label
              key={index}
              className={`block p-5 rounded-xl border cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/30 border-emerald-300/60 text-white shadow-lg'
                  : isDisabled
                    ? 'bg-gradient-to-r from-gray-500/15 to-gray-600/15 border-gray-500/40 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-white/8 to-white/12 border-white/30 text-white/90 hover:bg-gradient-to-r hover:from-white/15 hover:to-white/20 hover:border-white/40'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleAnswerSelect(index)}
                disabled={isDisabled}
                className="sr-only"
              />
              <div className="flex items-start space-x-4">
                <div className={`w-8 h-8 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                  isSelected
                    ? 'border-emerald-300 bg-gradient-to-r from-emerald-400 to-green-400'
                    : isDisabled
                      ? 'border-gray-500'
                      : 'border-white/50'
                }`}>
                  {isSelected && (
                    <span className="material-icons text-white text-base">check</span>
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-bold text-lg mr-3 text-yellow-300">{String.fromCharCode(65 + index)}.</span>
                  <span className="text-lg leading-relaxed font-medium">{processTextWithBold(option) || 'Option text missing'}</span>
                </div>
              </div>
            </label>
          );
        })}
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/40 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between text-base">
            <span className="text-emerald-200 font-bold">Selected:</span>
            <span className="text-white font-bold text-lg">{currentAnswers.length} / 3</span>
          </div>
        </div>
      </div>
    );
  };

  const renderTableQuestion = () => {
    const currentAnswers = userAnswers[question.id] || {};
    
    if (!question.tableCategories || question.tableCategories.length === 0) {
      return (
        <div className="bg-gradient-to-r from-red-500/25 to-pink-500/25 border border-red-400/40 rounded-xl p-5 backdrop-blur-sm">
          <span className="text-red-200 text-base font-semibold">No table categories available.</span>
        </div>
      );
    }
    
    if (!question.statementsToCategorize || question.statementsToCategorize.length === 0) {
      return (
        <div className="bg-gradient-to-r from-red-500/25 to-pink-500/25 border border-red-400/40 rounded-xl p-5 backdrop-blur-sm">
          <span className="text-red-200 text-base font-semibold">No statements to categorize available.</span>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        {/* Categories Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {question.tableCategories.map((category, index) => (
            <div key={index} className="bg-gradient-to-br from-white/10 to-white/15 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <h4 className="text-white font-bold mb-4 text-lg">{category || `Category ${index + 1}`}</h4>
              <div className="space-y-3 min-h-[120px]">
                {question.statementsToCategorize
                  .map((statement, stmtIndex) => 
                    currentAnswers[stmtIndex] === index ? (statement.statement || 'Statement text missing') : null
                  )
                  .filter(item => item !== null)
                  .map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-gradient-to-r from-blue-500/25 to-cyan-500/25 border border-blue-400/40 rounded-lg p-3 backdrop-blur-sm">
                      <span className="text-blue-100 text-sm font-medium">{item}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
        
        {/* Statements to Categorize */}
        <div className="space-y-6">
          <h4 className="text-white font-bold text-lg flex items-center space-x-3">
            <span>Assign statements to appropriate categories:</span>
            <span className="text-white/70 text-base font-medium">(Click on the category)</span>
          </h4>
          {question.statementsToCategorize.map((statement, index) => (
            <div key={index} className="bg-gradient-to-br from-white/10 to-white/15 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <div className="text-white text-base mb-4 leading-relaxed font-medium">
                {statement.statement || `Statement ${index + 1} text missing`}
              </div>
              <div className="flex flex-wrap gap-3">
                {question.tableCategories.map((category, catIndex) => (
                  <button
                    key={catIndex}
                    onClick={() => handleTableAnswer(index, catIndex)}
                    className={`px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                      currentAnswers[index] === catIndex
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg border border-cyan-300/50'
                        : 'bg-gradient-to-r from-white/15 to-white/20 text-white/80 border border-white/30 hover:bg-gradient-to-r hover:from-white/25 hover:to-white/30'
                    }`}
                  >
                    {category || `Category ${catIndex + 1}`}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Questions Panel - Left Side */}
        <div className="w-1/2 p-6 overflow-y-auto scrollbar-hide">
          <div className="bg-gradient-to-br from-white/12 to-white/8 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30 h-full flex flex-col">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/30">
              <div className="flex items-center space-x-5">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl px-5 py-3 shadow-lg">
                  <span className="text-white font-bold text-base">
                    Question {getTotalQuestionNumber()}
                  </span>
                </div>
                <div className="text-white/80 text-base font-medium">
                  {getTotalQuestionNumber()} of {getTotalQuestions()}
                </div>
                <div className="bg-gradient-to-r from-white/15 to-white/20 rounded-lg px-4 py-2 border border-white/30 backdrop-blur-sm">
                  <span className="text-white text-sm font-bold">
                    {question.type.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <div className={`px-5 py-3 rounded-xl font-mono font-bold text-xl shadow-lg ${
                timeRemaining <= 300 
                  ? 'bg-gradient-to-r from-red-500/30 to-pink-500/30 text-red-200 border border-red-400/40' 
                  : timeRemaining <= 600 
                    ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-200 border border-amber-400/40'
                    : 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-200 border border-green-400/40'
              }`}>
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide question-text">
              {renderQuestionContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/30">
              <button
                onClick={previousQuestion}
                disabled={!canGoPrevious()}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  canGoPrevious()
                    ? 'bg-gradient-to-r from-white/15 to-white/20 hover:from-white/25 hover:to-white/30 text-white border border-white/30 shadow-lg'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                }`}
              >
                <span className="material-icons text-base">arrow_back</span>
                <span className="text-base font-semibold">Previous</span>
              </button>

              <button
                onClick={() => setShowReview(!showReview)}
                className="flex items-center space-x-3 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/25 to-pink-500/25 hover:from-purple-500/35 hover:to-pink-500/35 text-purple-100 border border-purple-400/40 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="material-icons text-base">rate_review</span>
                <span className="text-base font-semibold">Review</span>
              </button>

              {isLastQuestion() ? (
                <button
                  onClick={finishTest}
                  className="flex items-center space-x-3 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  <span className="material-icons text-base">check_circle</span>
                  <span className="text-base font-bold">Finish Test</span>
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  disabled={!canGoNext()}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    canGoNext()
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-xl'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                  }`}
                >
                  <span className="text-base font-semibold">Next</span>
                  <span className="material-icons text-base">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Passage Panel - Right Side */}
        <div className="w-1/2 p-6 overflow-y-auto scrollbar-hide">
          <div className="bg-gradient-to-br from-white/12 to-white/8 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30 h-full">
            <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-white/30">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="material-icons text-white text-xl">article</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{passage.title}</h2>
            </div>
            <div className="text-white/95 leading-relaxed space-y-6 passage-text text-2xl font-bold">
              {renderPassageText()}
            </div>
          </div>
        </div>

        {/* Review Panel */}
        <div className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-lg border-l border-white/30 transform transition-transform duration-300 z-50 ${
          showReview ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/30">
              <h3 className="text-xl font-bold text-white">Review</h3>
              <button
                onClick={() => setShowReview(false)}
                className="w-10 h-10 bg-gradient-to-r from-white/15 to-white/20 hover:from-white/25 hover:to-white/30 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
              >
                <span className="material-icons text-white text-lg">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-5 gap-3 mb-8">
                {passages.map((passage, passageIndex) => 
                  passage.questions.map((q, questionIndex) => {
                    const globalQuestionNumber = passages
                      .slice(0, passageIndex)
                      .reduce((total, p) => total + p.questions.length, 0) + questionIndex + 1;
                    
                    const isCurrent = passageIndex === currentPassage && questionIndex === currentQuestion;
                    const isAnswered = userAnswers[q.id] !== undefined;
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => navigateToQuestion(passageIndex, questionIndex)}
                        className={`w-12 h-12 rounded-lg text-base font-bold transition-all duration-300 transform hover:scale-110 shadow-lg ${
                          isCurrent 
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl border border-cyan-300/50' 
                            : isAnswered 
                              ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-200 border border-green-400/40 hover:from-green-500/40 hover:to-emerald-500/40' 
                              : 'bg-gradient-to-r from-white/15 to-white/20 text-white/80 border border-white/30 hover:from-white/25 hover:to-white/30'
                        }`}
                      >
                        {globalQuestionNumber}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/30 space-y-4">
              <div className="flex items-center justify-between text-base">
                <span className="text-white/80 font-semibold">Answered:</span>
                <span className="text-white font-bold text-lg">{Object.keys(userAnswers).length} / {getTotalQuestions()}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="text-white/80 font-semibold">Time Remaining:</span>
                <span className="text-white font-bold font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToeflReadingTask; 