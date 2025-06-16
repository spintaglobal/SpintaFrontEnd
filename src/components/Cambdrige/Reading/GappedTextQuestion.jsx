import React, { useState, useEffect, useRef, useCallback } from 'react';

const GappedTextQuestion = ({
  passage, // Passage object with passageText containing gaps marked as (41), (42), etc.
  questions = [], // Array of GAPPED_TEXT questions: { questionNumber, questionType, options }
  answers = {}, // Object mapping questionNumbers to selected option letters (A-G)
  onAnswerChange,
  questionNumber,
  level = 'B2', // B2, C1, C2 - affects number of extra paragraphs
  showCoherenceIndicators = true,
  enablePreviewMode = true,
  enableUndoRedo = true
}) => {
  // Early validation to prevent errors
  if (typeof onAnswerChange !== 'function') {
    console.error('GappedTextQuestion: onAnswerChange is not a function:', onAnswerChange);
    return (
      <div className="mb-8 p-6 bg-red-500/10 border border-red-400/20 rounded-xl">
        <p className="text-red-400">Error: Invalid onAnswerChange callback</p>
      </div>
    );
  }

  if (!Array.isArray(questions)) {
    console.error('GappedTextQuestion: questions is not an array:', questions);
    return (
      <div className="mb-8 p-6 bg-red-500/10 border border-red-400/20 rounded-xl">
        <p className="text-red-400">Error: Invalid questions data</p>
        <div className="text-xs mt-2 text-red-300">
          <p>Expected array, received: {typeof questions}</p>
        </div>
      </div>
    );
  }

  console.log('GappedTextQuestion received:', {
    passage: typeof passage === 'object' ? { ...passage, passageText: passage?.passageText ? 'present' : 'missing' } : passage,
    questions: questions.length,
    answers: Object.keys(answers).length
  });

  // Extract options from all questions (they should all have the same options for gapped text)
  const allOptions = questions.length > 0 ? questions[0].options || {} : {};
  const optionLetters = Object.keys(allOptions).sort(); // A, B, C, D, E, F, G

  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedGap, setSelectedGap] = useState(null);
  const [hoveredGap, setHoveredGap] = useState(null);
  const [previewMode, setPreviewMode] = useState(null);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [coherenceHighlights, setCoherenceHighlights] = useState({});
  
  const gapRefs = useRef({});
  const isMobile = window.innerWidth < 768;

  // Coherence words to highlight
  const coherenceWords = [
    'however', 'moreover', 'furthermore', 'nevertheless', 'therefore', 'consequently',
    'in addition', 'on the other hand', 'in contrast', 'similarly', 'meanwhile',
    'first', 'second', 'finally', 'in conclusion', 'for example', 'such as',
    'this', 'these', 'that', 'those', 'it', 'they'
  ];

  // Initialize undo stack
  useEffect(() => {
    if (enableUndoRedo && Object.keys(answers).length > 0) {
      setUndoStack(prev => [answers, ...prev.slice(0, 9)]); // Keep last 10 states
    }
  }, [answers, enableUndoRedo]);

  // Find coherence indicators in options
  useEffect(() => {
    if (!showCoherenceIndicators) return;
    
    const highlights = {};
    optionLetters.forEach(letter => {
      const text = allOptions[letter] || '';
      const words = text.toLowerCase().split(/\s+/);
      const foundWords = words.filter(word => 
        coherenceWords.some(coherence => 
          word.includes(coherence.toLowerCase().replace(/\s+/g, ''))
        )
      );
      if (foundWords.length > 0) {
        highlights[letter] = foundWords;
      }
    });
    setCoherenceHighlights(highlights);
  }, [allOptions, optionLetters, showCoherenceIndicators]);

  // Handle option selection
  const handleOptionSelect = (optionLetter) => {
    if (isOptionUsed(optionLetter)) return; // Can't select already used options
    
    if (isMobile) {
      setSelectedOption(optionLetter);
      setShowMobileModal(true);
    } else {
      setSelectedOption(optionLetter);
      // Desktop: wait for gap click
    }
  };

  // Handle gap selection
  const handleGapSelect = (questionNumber) => {
    if (!selectedOption) return;
    
    // Place the selected option in this gap
    placeOption(questionNumber, selectedOption);
    setSelectedOption(null);
    setSelectedGap(null);
  };

  // Place option in gap
  const placeOption = (questionNumber, optionLetter) => {
    // Remove option from other gaps if it exists
    const newAnswers = { ...answers };
    Object.keys(newAnswers).forEach(key => {
      if (newAnswers[key] === optionLetter) {
        delete newAnswers[key];
      }
    });
    
    // Place in new gap
    newAnswers[questionNumber] = optionLetter;
    
    onAnswerChange(questionNumber, optionLetter);
    
    // Add animation effect
    const gapElement = gapRefs.current[questionNumber];
    if (gapElement) {
      gapElement.classList.add('animate-pulse');
      setTimeout(() => {
        gapElement.classList.remove('animate-pulse');
      }, 300);
    }
  };

  // Remove option from gap
  const removeOption = (questionNumber) => {
    onAnswerChange(questionNumber, '');
  };

  // Check if option is already used
  const isOptionUsed = (optionLetter) => {
    return Object.values(answers).includes(optionLetter);
  };

  // Handle mobile selection
  const handleMobileSelection = () => {
    if (!selectedOption || !selectedGap) return;
    
    placeOption(selectedGap, selectedOption);
    setSelectedOption(null);
    setSelectedGap(null);
    setShowMobileModal(false);
  };

  // Undo action
  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    
    const currentState = undoStack[0];
    const previousState = undoStack[1];
    
    setRedoStack(prev => [currentState, ...prev.slice(0, 9)]);
    setUndoStack(prev => prev.slice(1));
    
    // Apply previous state
    Object.keys(previousState).forEach(questionNumber => {
      onAnswerChange(parseInt(questionNumber), previousState[questionNumber]);
    });
  };

  // Redo action
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[0];
    setUndoStack(prev => [nextState, ...prev]);
    setRedoStack(prev => prev.slice(1));
    
    // Apply next state
    Object.keys(nextState).forEach(questionNumber => {
      onAnswerChange(parseInt(questionNumber), nextState[questionNumber]);
    });
  };

  // Render gap with current option or empty state
  const renderGap = (questionNumber) => {
    const currentAnswer = answers[questionNumber];
    const isSelected = selectedGap === questionNumber;
    const isHovered = hoveredGap === questionNumber;
    const hasAnswer = currentAnswer && currentAnswer.trim();

    return (
      <span
        key={questionNumber}
        ref={el => gapRefs.current[questionNumber] = el}
        onClick={() => {
          if (selectedOption) {
            handleGapSelect(questionNumber);
          } else if (hasAnswer) {
            removeOption(questionNumber);
          } else {
            setSelectedGap(questionNumber);
            if (isMobile) setShowMobileModal(true);
          }
        }}
        onMouseEnter={() => setHoveredGap(questionNumber)}
        onMouseLeave={() => setHoveredGap(null)}
        className={`
          inline-flex items-center justify-center min-w-[80px] min-h-[2.5rem] mx-1 px-3 py-2 
          rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out
          ${hasAnswer 
            ? 'bg-green-500/20 border-green-400/60 text-green-300' 
            : selectedOption
              ? 'bg-blue-500/20 border-blue-400/60 text-blue-300 hover:bg-blue-500/30'
              : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
          }
          ${isSelected ? 'ring-2 ring-blue-400' : ''}
          ${isHovered && selectedOption ? 'shadow-lg shadow-blue-500/20' : ''}
        `}
        aria-label={`Gap ${questionNumber}, ${hasAnswer ? `filled with option ${currentAnswer}` : 'empty'}`}
      >
        {hasAnswer ? (
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg">{currentAnswer}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeOption(questionNumber);
              }}
              className="text-red-400 hover:text-red-300 text-xs"
              aria-label="Remove option"
            >
              ✕
            </button>
          </div>
        ) : (
          <span className="text-sm font-medium">
            {selectedOption ? `Place ${selectedOption}` : `Gap ${questionNumber}`}
          </span>
        )}
      </span>
    );
  };

  // Render option card
  const renderOptionCard = (optionLetter) => {
    const text = allOptions[optionLetter] || '';
    const isUsed = isOptionUsed(optionLetter);
    const isSelected = selectedOption === optionLetter;
    const coherenceWords = coherenceHighlights[optionLetter] || [];

    return (
      <div
        key={optionLetter}
        onClick={() => !isUsed && handleOptionSelect(optionLetter)}
        className={`
          p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-in-out
          ${isUsed 
            ? 'bg-gray-500/10 border-gray-400/30 text-gray-400 opacity-50 cursor-not-allowed' 
            : isSelected
              ? 'bg-blue-500/20 border-blue-400/60 text-blue-300 shadow-lg shadow-blue-500/20'
              : 'bg-white/5 border-white/20 text-white/90 hover:bg-white/10 hover:border-white/40'
          }
        `}
      >
        {/* Option letter */}
        <div className="flex items-start space-x-3">
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
            ${isUsed 
              ? 'bg-gray-500/20 text-gray-400' 
              : isSelected
                ? 'bg-blue-500/30 text-blue-200'
                : 'bg-purple-500/20 text-purple-300'
            }
          `}>
            {optionLetter}
          </div>
          
          {/* Option text */}
          <div className="flex-1">
            <p className="text-sm leading-relaxed">
              {showCoherenceIndicators ? (
                // Highlight coherence words
                text.split(/\b/).map((word, index) => {
                  const isCoherence = coherenceWords.some(cw => 
                    word.toLowerCase().includes(cw.toLowerCase())
                  );
                  return (
                    <span
                      key={index}
                      className={isCoherence ? 'bg-yellow-400/20 text-yellow-300 rounded px-1' : ''}
                    >
                      {word}
                    </span>
                  );
                })
              ) : (
                text
              )}
            </p>
            
            {/* Used indicator */}
            {isUsed && (
              <div className="mt-2 text-xs text-gray-400 flex items-center">
                <span>✓ Used in gap {Object.keys(answers).find(key => answers[key] === optionLetter)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render main text with gaps - UPDATED FOR (41), (42) PATTERN
  const renderMainText = () => {
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
        </div>
      );
    }

    // NEW PATTERN: Split passage by gaps marked as (41), (42), etc.
    const parts = passageText.split(/(\(\d+\))/g);

    return (
      <div className="text-white/90 leading-relaxed text-lg">
        {parts.map((part, index) => {
          // Check if this part is a gap marker like (41), (42), etc.
          const gapMatch = part.match(/\((\d+)\)/);
          
          if (gapMatch) {
            const questionNumber = parseInt(gapMatch[1]);
            const question = questions.find(q => q.questionNumber === questionNumber);
            
            if (!question) {
              // If no question found for this gap number, show the original marker
              return <span key={index} className="text-yellow-400">{part}</span>;
            }

            return renderGap(questionNumber);
          }

          // Regular text part
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  // Render mobile modal for gap selection
  const renderMobileModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-white/20 w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Place Option {selectedOption}
          </h3>
          
          <div className="space-y-3 mb-6">
            {questions.map(question => {
              const hasAnswer = answers[question.questionNumber];
              return (
                <button
                  key={question.questionNumber}
                  onClick={() => {
                    setSelectedGap(question.questionNumber);
                    handleMobileSelection();
                  }}
                  disabled={hasAnswer}
                  className={`
                    w-full p-3 rounded-lg border text-left transition-colors
                    ${hasAnswer 
                      ? 'bg-gray-500/10 border-gray-400/30 text-gray-400 cursor-not-allowed'
                      : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                    }
                  `}
                >
                  Gap {question.questionNumber} {hasAnswer && `(${hasAnswer})`}
                </button>
              );
            })}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowMobileModal(false);
                setSelectedOption(null);
                setSelectedGap(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Count completed gaps
  const completedGaps = Object.keys(answers).filter(key => answers[key] && answers[key].trim()).length;

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-white">
            Question {questionNumber} - Gapped Text
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-white/70">
              {completedGaps}/{questions.length} completed
            </div>
            {enableUndoRedo && (
              <div className="flex space-x-2">
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length <= 1}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded text-sm"
                >
                  ↶ Undo
                </button>
                <button
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded text-sm"
                >
                  ↷ Redo
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedGaps / questions.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Instructions */}
        <p className="mt-3 text-sm text-white/80">
          {selectedOption 
            ? `Click on a gap to place option ${selectedOption}` 
            : 'Select a paragraph option below, then click on a gap to place it'
          }
        </p>
      </div>

      {/* Main text with gaps */}
      <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">
          Complete the text by placing the paragraphs in the correct gaps
        </h4>
        <div className="relative">
          {renderMainText()}
        </div>
      </div>

      {/* Paragraph options */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">
          Paragraph Options {showCoherenceIndicators && <span className="text-yellow-300 text-sm">(coherence words highlighted)</span>}
        </h4>
        <div className="grid gap-4 md:grid-cols-1">
          {optionLetters.map(letter => renderOptionCard(letter))}
        </div>
      </div>

      {/* Mobile modal */}
      {showMobileModal && renderMobileModal()}
    </div>
  );
};

export default GappedTextQuestion; 