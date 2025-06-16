// Cache Buster: 2024-06-09-15:45:00 - Fixed passage.split error with safe text extraction
import React, { useState, useEffect, useRef, useCallback } from 'react';

const WordFormationQuestion = ({
  passage,
  questions = [], // Array of WORD_FORMATION questions: { questionNumber, questionType, questionText }
  answers = {}, // Object mapping questionNumbers to answers
  onAnswerChange,
  questionNumber,
  showHints = true,
  showReference = true,
  autoFocus = true
}) => {
  // Early validation to prevent errors
  if (typeof onAnswerChange !== 'function') {
    console.error('WordFormationQuestion: onAnswerChange is not a function:', onAnswerChange);
    return (
      <div className="mb-8 p-6 bg-red-500/10 border border-red-400/20 rounded-xl">
        <p className="text-red-400">Error: Invalid onAnswerChange callback</p>
      </div>
    );
  }

  if (!Array.isArray(questions)) {
    console.error('WordFormationQuestion: questions is not an array:', questions);
    return (
      <div className="mb-8 p-6 bg-red-500/10 border border-red-400/20 rounded-xl">
        <p className="text-red-400">Error: Invalid questions data</p>
        <div className="text-xs mt-2 text-red-300">
          <p>Expected array, received: {typeof questions}</p>
        </div>
      </div>
    );
  }

  console.log('WordFormationQuestion received:', {
    passage: typeof passage === 'object' ? { ...passage, passageText: passage?.passageText ? 'present' : 'missing' } : passage,
    questions: questions.length,
    answers: Object.keys(answers).length
  });

  const [currentFocus, setCurrentFocus] = useState(null);
  const [inputStates, setInputStates] = useState({}); // Track empty/filled states
  const [showReferencePanel, setShowReferencePanel] = useState(false);
  const inputRefs = useRef({});

  // Extract stem word from questionText using regex
  const extractStemWord = (questionText) => {
    // Pattern: "Fill gap (17) using 'OBSOLETE'."
    const match = questionText.match(/using\s+['"]([^'"]+)['"]/i);
    return match ? match[1] : 'TRANSFORM';
  };

  // Process questions to add stemWord
  const processedQuestions = questions.map(q => ({
    ...q,
    stemWord: extractStemWord(q.questionText || '')
  }));

  // Common prefixes and suffixes reference
  const morphologyReference = {
    prefixes: [
      { affix: 'un-', meaning: 'not, opposite', example: 'unhappy' },
      { affix: 'dis-', meaning: 'not, opposite', example: 'disagree' },
      { affix: 're-', meaning: 'again', example: 'rewrite' },
      { affix: 'pre-', meaning: 'before', example: 'preview' },
      { affix: 'mis-', meaning: 'wrong', example: 'mistake' },
      { affix: 'over-', meaning: 'too much', example: 'overeat' },
      { affix: 'under-', meaning: 'too little', example: 'underestimate' }
    ],
    suffixes: [
      { affix: '-tion/-sion', meaning: 'noun (action)', example: 'creation' },
      { affix: '-ness', meaning: 'noun (quality)', example: 'happiness' },
      { affix: '-ment', meaning: 'noun (result)', example: 'development' },
      { affix: '-able/-ible', meaning: 'adjective (can be)', example: 'readable' },
      { affix: '-ful', meaning: 'adjective (full of)', example: 'helpful' },
      { affix: '-less', meaning: 'adjective (without)', example: 'hopeless' },
      { affix: '-ly', meaning: 'adverb', example: 'quickly' },
      { affix: '-er/-or', meaning: 'noun (person)', example: 'teacher' },
      { affix: '-ize/-ise', meaning: 'verb (make)', example: 'modernize' }
    ]
  };

  // Initialize input states
  useEffect(() => {
    const states = {};
    processedQuestions.forEach(question => {
      const answer = answers[question.questionNumber] || '';
      states[question.questionNumber] = answer.trim() ? 'filled' : 'empty';
    });
    setInputStates(states);
  }, [processedQuestions, answers]);

  // Auto-focus logic
  const focusNextInput = useCallback((currentQuestionNumber) => {
    if (!autoFocus) return;
    
    const currentIndex = processedQuestions.findIndex(q => q.questionNumber === currentQuestionNumber);
    const nextQuestion = processedQuestions[currentIndex + 1];
    
    if (nextQuestion && inputRefs.current[nextQuestion.questionNumber]) {
      setTimeout(() => {
        inputRefs.current[nextQuestion.questionNumber].focus();
        setCurrentFocus(nextQuestion.questionNumber);
      }, 100);
    }
  }, [processedQuestions, autoFocus]);

  // Handle input change
  const handleInputChange = (questionNumber, value) => {
    // Update answer directly without validation warnings
    onAnswerChange(questionNumber, value);
    
    // Update input state
    setInputStates(prev => ({
      ...prev,
      [questionNumber]: value.trim() ? 'filled' : 'empty'
    }));
  };

  // Handle key navigation
  const handleKeyDown = (e, questionNumber) => {
    if (e.key === 'Tab') return;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      focusNextInput(questionNumber);
    }
  };

  // Focus input when stem word is clicked
  const handleStemWordClick = (questionNumber) => {
    if (inputRefs.current[questionNumber]) {
      inputRefs.current[questionNumber].focus();
      setCurrentFocus(questionNumber);
    }
  };

  // Get input width based on expected length
  const getInputWidth = (question) => {
    const stemLength = question.stemWord.length;
    const width = Math.max(100, Math.min(250, stemLength * 12 + 80));
    return `${width}px`;
  };

  // Get input classes based on state
  const getInputClasses = (questionNumber) => {
    const state = inputStates[questionNumber] || 'empty';
    const isFocused = currentFocus === questionNumber;

    let classes = `
      inline-block min-h-[2.75rem] px-3 py-2 mx-1 rounded-lg border-2 
      text-white font-medium transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent
      placeholder:text-white/40 bg-white/5 backdrop-blur-sm
      md:min-h-[2.75rem] min-h-[44px]
    `;

    // State-based styling
    if (state === 'filled') {
      classes += ' border-green-400/60 focus:border-green-400 focus:ring-green-400/50';
    } else if (isFocused) {
      classes += ' border-blue-400 focus:border-blue-400 focus:ring-blue-400/50 shadow-lg shadow-blue-500/20';
    } else {
      classes += ' border-white/20 focus:border-blue-400 focus:ring-blue-400/50 hover:border-white/40';
    }

    return classes;
  };

  // Render passage with gaps and stem words - UPDATED FOR (17), (18) PATTERN
  const renderPassageWithGaps = () => {
    // Early return if no passage
    if (!passage) {
      return (
        <div className="text-yellow-400 p-4 border border-yellow-400/50 rounded">
          <p>No passage provided</p>
        </div>
      );
    }

    // SAFE text extraction with multiple fallbacks
    let passageText = '';
    
    try {
      if (typeof passage === 'string') {
        passageText = passage;
      } else if (passage && typeof passage === 'object') {
        // Try multiple possible property names
        passageText = passage.passageText || passage.text || passage.content || '';
        
        // If still empty, try to stringify and extract
        if (!passageText) {
          const passageStr = JSON.stringify(passage);
          console.warn('WordFormationQuestion: Could not find text in passage object:', passageStr.substring(0, 100));
        }
      } else {
        console.error('WordFormationQuestion: Passage is neither string nor object:', typeof passage, passage);
      }
    } catch (error) {
      console.error('WordFormationQuestion: Error extracting passage text:', error);
    }

    // Final validation
    if (!passageText || typeof passageText !== 'string') {
      return (
        <div className="text-red-400 p-4 border border-red-400/50 rounded">
          <p>Error: Unable to load passage text</p>
          <div className="text-xs mt-2 text-red-300">
            <p>Debug: passage type = {typeof passage}</p>
            <p>Debug: passageText = '{passageText}'</p>
            <p>Debug: passage = {JSON.stringify(passage).substring(0, 200)}...</p>
          </div>
        </div>
      );
    }

    // NEW PATTERN: Split passage by gaps marked as (17), (18), etc.
    let parts = [];
    try {
      parts = passageText.split(/(\(\d+\))/g);
    } catch (error) {
      console.error('WordFormationQuestion: Error splitting passage text:', error);
      return (
        <div className="text-red-400 p-4 border border-red-400/50 rounded">
          <p>Error: Unable to process passage text</p>
          <div className="text-xs mt-2 text-red-300">
            <p>Split error: {error.message}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-white/90 leading-relaxed text-lg">
        {parts.map((part, index) => {
          // Check if this part is a gap marker like (17), (18), etc.
          const gapMatch = part.match(/\((\d+)\)/);
          
          if (gapMatch) {
            const questionNumber = parseInt(gapMatch[1]);
            const question = processedQuestions.find(q => q.questionNumber === questionNumber);
            
            if (!question) {
              // If no question found for this gap number, show the original marker
              return <span key={index} className="text-yellow-400">{part}</span>;
            }

            const currentAnswer = answers[questionNumber] || '';

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
                  aria-label={`Gap ${questionNumber}, use the word "${question.stemWord}"`}
                />

                {/* Show stem word next to input */}
                <span className="ml-2 text-purple-300 text-sm font-medium">
                  ({question.stemWord.toUpperCase()})
                </span>
              </span>
            );
          }

          // Regular text part
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  // Count completed transformations
  const completedGaps = Object.values(inputStates).filter(state => 
    state === 'filled'
  ).length;

  return (
    <div className="mb-8">
      {/* Header with reference toggle */}
      <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-white">
            Question {questionNumber} - Word Formation
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-white/70">
              {completedGaps}/{processedQuestions.length} completed
            </div>
            {showReference && (
              <button
                onClick={() => setShowReferencePanel(!showReferencePanel)}
                className="px-3 py-1 bg-purple-500/20 border border-purple-400/50 rounded text-purple-300 text-sm hover:bg-purple-500/30 transition-colors"
              >
                {showReferencePanel ? 'Hide' : 'Show'} Reference
              </button>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedGaps / processedQuestions.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Instructions */}
        <p className="mt-3 text-sm text-white/80">
          Transform the stem words to complete the passage. Look for gaps marked as (17), (18), etc.
        </p>
      </div>

      {/* Reference panel */}
      {showReference && showReferencePanel && (
        <div className="mb-6 p-4 bg-purple-500/10 backdrop-blur-sm rounded-xl border border-purple-400/30">
          <h4 className="text-lg font-semibold text-purple-200 mb-3">
            Morphology Reference
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Prefixes */}
            <div>
              <h5 className="font-semibold text-purple-300 mb-2">Common Prefixes</h5>
              <div className="space-y-1 text-sm">
                {morphologyReference.prefixes.map((item, index) => (
                  <div key={index} className="flex justify-between text-white/80">
                    <span className="font-mono text-purple-300">{item.affix}</span>
                    <span className="text-white/60">{item.meaning}</span>
                    <span className="italic text-white/50">{item.example}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Suffixes */}
            <div>
              <h5 className="font-semibold text-purple-300 mb-2">Common Suffixes</h5>
              <div className="space-y-1 text-sm">
                {morphologyReference.suffixes.map((item, index) => (
                  <div key={index} className="flex justify-between text-white/80">
                    <span className="font-mono text-purple-300">{item.affix}</span>
                    <span className="text-white/60">{item.meaning}</span>
                    <span className="italic text-white/50">{item.example}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Passage with gaps */}
      <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">
          Complete the passage using the correct form of the given words
        </h4>
        <div className="relative">
          {renderPassageWithGaps()}
        </div>
      </div>

      {/* Mobile transformations summary */}
      <div className="md:hidden mt-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <h5 className="font-semibold text-white mb-2">Your Transformations</h5>
        <div className="space-y-2">
          {processedQuestions.map(question => {
            const answer = answers[question.questionNumber] || '';
            if (!answer.trim()) return null;
            
            return (
              <div key={question.questionNumber} className="flex items-center justify-between text-sm">
                <span className="text-white/70">Gap {question.questionNumber}:</span>
                <span className="font-mono text-blue-300">
                  {question.stemWord} → {answer}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WordFormationQuestion; 