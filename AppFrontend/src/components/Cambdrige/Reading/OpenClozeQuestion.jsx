// Cache Buster: 2024-06-09-16:20:00 - Removed auto-tab behavior and improved question grouping
import React, { useState, useEffect, useRef, useCallback } from 'react';

const OpenClozeQuestion = ({
  passage,
  questions = [], // Array of FILL_IN_THE_BLANK questions: { questionNumber, questionType, questionText, maxWords }
  answers = {}, // Object mapping questionNumbers to answers
  onAnswerChange,
  partType = 'part2', // 'part2' for single words only
  autoFocus = true,
  questionNumber,
  showCharacterCount = false
}) => {
  // Early validation to prevent errors
  if (typeof onAnswerChange !== 'function') {
    console.error('OpenClozeQuestion: onAnswerChange is not a function:', onAnswerChange);
    return (
      <div className="mb-8 p-6 bg-red-500/10 border border-red-400/20 rounded-xl">
        <p className="text-red-400">Error: Invalid onAnswerChange callback</p>
      </div>
    );
  }

  if (!Array.isArray(questions)) {
    console.error('OpenClozeQuestion: questions is not an array:', questions);
    return (
      <div className="mb-8 p-6 bg-red-500/10 border border-red-400/20 rounded-xl">
        <p className="text-red-400">Error: Invalid questions data</p>
        <div className="text-xs mt-2 text-red-300">
          <p>Expected array, received: {typeof questions}</p>
        </div>
      </div>
    );
  }

  console.log('OpenClozeQuestion received:', {
    passage: typeof passage === 'object' ? { ...passage, passageText: passage?.passageText ? 'present' : 'missing' } : passage,
    questions: questions.length,
    answers: Object.keys(answers).length
  });

  const [currentFocus, setCurrentFocus] = useState(null);
  const [inputStates, setInputStates] = useState({}); // Track empty/filled/validated states
  const [warnings, setWarnings] = useState({}); // Track validation warnings
  const inputRefs = useRef({});

  // Initialize input states
  useEffect(() => {
    const states = {};
    questions.forEach(question => {
      const answer = answers[question.questionNumber] || '';
      states[question.questionNumber] = answer.trim() ? 'filled' : 'empty';
    });
    setInputStates(states);
  }, [questions, answers]);

  // Auto-focus logic
  const focusNextInput = useCallback((currentQuestionNumber) => {
    if (!autoFocus) return;
    
    const currentIndex = questions.findIndex(q => q.questionNumber === currentQuestionNumber);
    const nextQuestion = questions[currentIndex + 1];
    
    if (nextQuestion && inputRefs.current[nextQuestion.questionNumber]) {
      setTimeout(() => {
        inputRefs.current[nextQuestion.questionNumber].focus();
        setCurrentFocus(nextQuestion.questionNumber);
      }, 100);
    }
  }, [questions, autoFocus]);

  // Handle input change
  const handleInputChange = (questionNumber, value) => {
    try {
      // Trim whitespace for validation but keep original value
      const trimmedValue = value.trim();
      
      // Get the question data for validation
      const question = questions.find(q => q.questionNumber === questionNumber);
      
      // Validation for maxWords (usually 1 for open cloze)
      if (question?.maxWords === 1 && trimmedValue.includes(' ')) {
        setWarnings(prev => ({
          ...prev,
          [questionNumber]: 'Only one word is allowed for this gap'
        }));
      } else {
        setWarnings(prev => {
          const newWarnings = { ...prev };
          delete newWarnings[questionNumber];
          return newWarnings;
        });
      }

      // Prevent numeric input for grammar-focused gaps
      if (/^\d+$/.test(trimmedValue)) {
        return; // Don't update if it's just numbers
      }

      // Update answer using questionNumber as key
      onAnswerChange(questionNumber, value);

      // Update input state
      setInputStates(prev => ({
        ...prev,
        [questionNumber]: trimmedValue ? 'filled' : 'empty'
      }));

      // REMOVED: Auto-focus behavior - let users manually navigate
      // Users should use Tab, Enter, or arrow keys to move between fields
    } catch (error) {
      console.error('Error in handleInputChange:', error);
      // Still try to update the answer even if other logic fails
      try {
        onAnswerChange(questionNumber, value);
      } catch (callbackError) {
        console.error('Error in onAnswerChange callback:', callbackError);
      }
    }
  };

  // Handle key navigation
  const handleKeyDown = (e, questionNumber) => {
    if (e.key === 'Tab') {
      // Let default tab behavior handle navigation
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      focusNextInput(questionNumber);
    }
    
    if (e.key === 'ArrowRight' && e.ctrlKey) {
      e.preventDefault();
      focusNextInput(questionNumber);
    }
    
    if (e.key === 'ArrowLeft' && e.ctrlKey) {
      e.preventDefault();
      const currentIndex = questions.findIndex(q => q.questionNumber === questionNumber);
      const prevQuestion = questions[currentIndex - 1];
      if (prevQuestion && inputRefs.current[prevQuestion.questionNumber]) {
        inputRefs.current[prevQuestion.questionNumber].focus();
        setCurrentFocus(prevQuestion.questionNumber);
      }
    }
  };

  // Get dynamic input width based on maxWords
  const getInputWidth = (question) => {
    if (question.maxWords) {
      const width = Math.max(80, Math.min(200, question.maxWords * 60 + 40));
      return `${width}px`;
    }
    return '120px'; // Default width
  };

  // Get input state classes
  const getInputClasses = (questionNumber) => {
    const state = inputStates[questionNumber] || 'empty';
    const isFocused = currentFocus === questionNumber;
    const hasWarning = warnings[questionNumber];

    let classes = `
      inline-block min-h-[2.5rem] px-3 py-2 mx-1 rounded-lg border-2 
      text-white font-medium transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent
      placeholder:text-white/40 bg-white/5 backdrop-blur-sm
    `;

    // State-based styling
    if (hasWarning) {
      classes += ' border-red-400/60 focus:border-red-400 focus:ring-red-400/50';
    } else if (state === 'filled') {
      classes += ' border-green-400/60 focus:border-green-400 focus:ring-green-400/50';
    } else if (isFocused) {
      classes += ' border-blue-400 focus:border-blue-400 focus:ring-blue-400/50 shadow-lg shadow-blue-500/20';
    } else {
      classes += ' border-white/20 focus:border-blue-400 focus:ring-blue-400/50 hover:border-white/40';
    }

    // Mobile optimizations
    classes += ' md:min-h-[2.5rem] min-h-[44px]';

    return classes;
  };

  // Render passage with inline input fields - UPDATED FOR (9), (10) PATTERN
  const renderPassageWithGaps = () => {
    if (!passage) return null;

    // Extract passage text safely
    let passageText = '';
    if (typeof passage === 'string') {
      passageText = passage;
    } else if (passage && typeof passage === 'object') {
      passageText = passage.passageText || passage.text || '';
    }

    if (!passageText || typeof passageText !== 'string') {
      return (
        <div className="text-red-400 p-4 border border-red-400/50 rounded">
          <p>Error: Unable to load passage text</p>
          <div className="text-xs mt-2 text-red-300">
            <p>Debug: passage type = {typeof passage}</p>
            <p>Debug: passage = {JSON.stringify(passage)}</p>
          </div>
        </div>
      );
    }

    // NEW PATTERN: Split passage by gaps marked as (9), (10), etc.
    const parts = passageText.split(/(\(\d+\))/g);

    return (
      <div className="text-white/90 leading-relaxed text-lg">
        {parts.map((part, index) => {
          // Check if this part is a gap marker like (9), (10), etc.
          const gapMatch = part.match(/\((\d+)\)/);
          
          if (gapMatch) {
            const questionNumber = parseInt(gapMatch[1]);
            const question = questions.find(q => q.questionNumber === questionNumber);
            
            if (!question) {
              // If no question found for this gap number, show the original marker
              return <span key={index} className="text-yellow-400">{part}</span>;
            }

            const currentAnswer = answers[questionNumber] || '';
            const hasWarning = warnings[questionNumber];

            return (
              <span key={index} className="relative inline-block">
                {/* Gap number label */}
                <span className="absolute -top-6 left-1 text-xs text-blue-300 font-semibold">
                  {questionNumber}
                </span>
                
                {/* Input field */}
                <input
                  ref={el => inputRefs.current[questionNumber] = el}
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => handleInputChange(questionNumber, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, questionNumber)}
                  onFocus={() => setCurrentFocus(questionNumber)}
                  onBlur={() => setCurrentFocus(null)}
                  className={getInputClasses(questionNumber)}
                  style={{ width: getInputWidth(question) }}
                  placeholder={`Gap ${questionNumber}`}
                  autoComplete="off"
                  spellCheck="true"
                  maxLength={question.maxWords === 1 ? 20 : 50} // Reasonable character limit
                  aria-label={`Gap ${questionNumber}: ${question.questionText || 'Fill in the blank'}`}
                  aria-describedby={hasWarning ? `warning-${questionNumber}` : undefined}
                  // Mobile keyboard optimizations
                  inputMode="text"
                  autoCapitalize="off"
                  autoCorrect="on"
                />

                {/* Warning message */}
                {hasWarning && (
                  <div
                    id={`warning-${questionNumber}`}
                    className="absolute top-full left-0 mt-1 p-2 bg-red-500/20 border border-red-400/50 rounded text-red-300 text-xs whitespace-nowrap z-10"
                  >
                    {warnings[questionNumber]}
                  </div>
                )}
              </span>
            );
          }

          // Regular text part
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  // Count completed gaps for progress
  const completedGaps = Object.values(inputStates).filter(state => state === 'filled').length;
  const totalGaps = questions.length;

  return (
    <div className="mb-8">
      {/* Header with progress */}
      <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-white">
            Open Cloze - Questions {questions.length > 0 ? `${questions[0].questionNumber}${questions.length > 1 ? ` - ${questions[questions.length - 1].questionNumber}` : ''}` : ''}
          </h3>
          <div className="text-sm text-white/70">
            {completedGaps}/{totalGaps} completed
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalGaps > 0 ? (completedGaps / totalGaps) * 100 : 0}%` }}
          ></div>
        </div>
        
        {/* Instructions */}
        <p className="mt-3 text-sm text-white/80">
          Fill each gap with ONE word only. Look for gaps marked as (9), (10), etc. in the passage.
        </p>
        
        {/* Completion status */}
        {completedGaps === totalGaps && totalGaps > 0 && (
          <div className="mt-3 px-3 py-2 bg-green-500/20 border border-green-400/30 rounded-lg">
            <p className="text-green-300 text-sm font-medium">✅ All gaps completed</p>
          </div>
        )}
      </div>

      {/* Passage with gaps */}
      <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">
          Complete the passage by filling in the gaps
        </h4>
        <div className="relative">
          {renderPassageWithGaps()}
        </div>
      </div>

      {/* Mobile navigation helper */}
      <div className="md:hidden mt-4 flex justify-center space-x-2">
        <button
          onClick={() => {
            const currentIndex = questions.findIndex(q => q.questionNumber === currentFocus);
            const prevQuestion = questions[currentIndex - 1];
            if (prevQuestion && inputRefs.current[prevQuestion.questionNumber]) {
              inputRefs.current[prevQuestion.questionNumber].focus();
              setCurrentFocus(prevQuestion.questionNumber);
            }
          }}
          disabled={!currentFocus || questions.findIndex(q => q.questionNumber === currentFocus) === 0}
          className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={() => {
            if (currentFocus) {
              focusNextInput(currentFocus);
            }
          }}
          disabled={!currentFocus || questions.findIndex(q => q.questionNumber === currentFocus) === questions.length - 1}
          className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Voice input support message */}
      <div className="mt-4 text-center">
        <p className="text-xs text-white/50">
          💡 Tip: You can use voice input on supported devices
        </p>
      </div>
    </div>
  );
};

export default OpenClozeQuestion; 