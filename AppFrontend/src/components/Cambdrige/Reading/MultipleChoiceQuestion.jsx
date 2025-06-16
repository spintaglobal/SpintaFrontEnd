import React, { useState, useEffect, useRef } from 'react';

const MultipleChoiceQuestion = ({
  question,
  selectedAnswer,
  onAnswerChange,
  questionNumber,
  isRequired = false,
  partType = 'standard', // 'standard', 'cloze', 'comprehension'
  passage = null,
  onGapClick = null,
  showWarning = false
}) => {
  const [focusedOption, setFocusedOption] = useState(null);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const optionRefs = useRef([]);

  // Debug logging to identify data structure issues
  useEffect(() => {
    console.log('MultipleChoiceQuestion Debug:');
    console.log('Question object:', question);
    console.log('Question keys:', Object.keys(question || {}));
    console.log('Has options:', !!question?.options);
    console.log('Has choices:', !!question?.choices);
    console.log('Options array:', question?.options);
    console.log('Choices array:', question?.choices);
    console.log('Question text:', question?.text || question?.question_text || question?.question);
    console.log('Passage:', passage);
  }, [question, passage]);

  // Auto-save selection immediately upon change
  useEffect(() => {
    if (selectedAnswer && onAnswerChange) {
      // Auto-save logic can be implemented here
      console.log(`Auto-saving answer: ${selectedAnswer} for question ${questionNumber}`);
    }
  }, [selectedAnswer, questionNumber, onAnswerChange]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!['ArrowUp', 'ArrowDown', 'Space', 'Enter'].includes(e.key)) return;
      
      e.preventDefault();
      
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const currentIndex = focusedOption !== null ? focusedOption : -1;
        let newIndex;
        
        if (e.key === 'ArrowDown') {
          newIndex = currentIndex < 3 ? currentIndex + 1 : 0;
        } else {
          newIndex = currentIndex > 0 ? currentIndex - 1 : 3;
        }
        
        setFocusedOption(newIndex);
        optionRefs.current[newIndex]?.focus();
      } else if ((e.key === 'Space' || e.key === 'Enter') && focusedOption !== null) {
        const optionValue = String.fromCharCode(65 + focusedOption); // A, B, C, D
        handleOptionSelect(optionValue);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedOption]);

  const handleOptionSelect = (value) => {
    onAnswerChange(value);
    setShowSkipWarning(false);
  };

  const handleOptionClick = (value, index) => {
    setFocusedOption(index);
    handleOptionSelect(value);
  };

  const handleSkipAttempt = () => {
    if (isRequired && !selectedAnswer) {
      setShowSkipWarning(true);
      setTimeout(() => setShowSkipWarning(false), 3000);
      return false;
    }
    return true;
  };

  const renderClozePassage = () => {
    if (!passage) return null;
    
    // Split passage by gaps and render with clickable numbered gaps
    const parts = passage.split(/(\{\d+\})/g);
    
    return (
      <div className="mb-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Passage</h3>
        <div className="text-white/90 leading-relaxed text-base">
          {parts.map((part, index) => {
            const gapMatch = part.match(/\{(\d+)\}/);
            if (gapMatch) {
              const gapNumber = gapMatch[1];
              return (
                <button
                  key={index}
                  onClick={() => onGapClick && onGapClick(gapNumber)}
                  className="inline-flex items-center justify-center min-w-[2rem] h-8 mx-1 px-2 bg-blue-500/20 border border-blue-400/50 rounded text-blue-300 font-semibold hover:bg-blue-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={`Gap ${gapNumber}, click to go to question`}
                >
                  {gapNumber}
                </button>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </div>
      </div>
    );
  };

  const renderSplitScreenLayout = () => {
    if (partType !== 'comprehension' || !passage) return null;
    
    return (
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Passage Column */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Reading Passage</h3>
          <div className="text-white/90 leading-relaxed text-base max-h-96 overflow-y-auto">
            {passage}
          </div>
        </div>
        
        {/* Questions Column */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Questions</h3>
          {/* Question content will be rendered here */}
        </div>
      </div>
    );
  };

  const renderMobileTabLayout = () => {
    if (partType !== 'comprehension' || !passage) return null;
    
    const [activeTab, setActiveTab] = useState('passage');
    
    return (
      <div className="lg:hidden mb-8">
        {/* Tab Navigation */}
        <div className="flex bg-white/5 backdrop-blur-sm rounded-t-xl border border-white/10 border-b-0">
          <button
            onClick={() => setActiveTab('passage')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
              activeTab === 'passage'
                ? 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-400'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            Passage
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
              activeTab === 'questions'
                ? 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-400'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            Questions
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-b-xl border border-white/10 p-6">
          {activeTab === 'passage' ? (
            <div className="text-white/90 leading-relaxed text-base max-h-96 overflow-y-auto">
              {passage}
            </div>
          ) : (
            <div>
              {/* Question content will be rendered here */}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mb-8">
      {/* Skip Warning */}
      {showSkipWarning && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-400/50 rounded-lg">
          <p className="text-yellow-300 text-sm font-medium">
            Please select an answer before continuing.
          </p>
        </div>
      )}

      {/* Special Layouts */}
      {partType === 'cloze' && renderClozePassage()}
      {partType === 'comprehension' && (
        <>
          <div className="hidden lg:block">
            {renderSplitScreenLayout()}
          </div>
          {renderMobileTabLayout()}
        </>
      )}

      {/* Question */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-3">
            Question {questionNumber}
          </h3>
          <p className="text-white/90 text-lg leading-relaxed">
            {question.text || question.question_text || question.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3" role="radiogroup" aria-labelledby={`question-${questionNumber}`}>
          {/* Debug: Show raw question data if no options found */}
          {!question?.options && !question?.choices && (
            <div className="p-4 bg-red-500/20 border border-red-400/50 rounded-lg">
              <p className="text-red-300 text-sm font-medium mb-2">
                Debug: No options found for this question
              </p>
              <pre className="text-xs text-red-200 overflow-auto">
                {JSON.stringify(question, null, 2)}
              </pre>
            </div>
          )}
          
          {['A', 'B', 'C', 'D'].map((letter, index) => {
            const option = question.options?.[index] || 
                          question.choices?.[index] || 
                          question[`option${letter}`] || 
                          question[`choice${letter}`] ||
                          question[`option_${letter.toLowerCase()}`] ||
                          question[`choice_${letter.toLowerCase()}`] ||
                          question.answers?.[index] ||
                          question.alternatives?.[index];
            
            // Debug logging for each option
            console.log(`Option ${letter} Debug:`);
            console.log(`  Index: ${index}`);
            console.log(`  Option value:`, option);
            console.log(`  From options[${index}]:`, question.options?.[index]);
            console.log(`  From choices[${index}]:`, question.choices?.[index]);
            console.log(`  From option${letter}:`, question[`option${letter}`]);
            console.log(`  From choice${letter}:`, question[`choice${letter}`]);
            
            if (!option) {
              console.warn(`No option found for ${letter} at index ${index}`);
              return null;
            }
            
            const isSelected = selectedAnswer === letter;
            const isFocused = focusedOption === index;
            
            return (
              <label
                key={letter}
                ref={el => optionRefs.current[index] = el}
                tabIndex={0}
                className={`
                  flex items-start space-x-4 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ease-in-out
                  min-h-[44px] group focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent
                  ${isSelected 
                    ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-lg' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/80'
                  }
                  ${isFocused ? 'ring-2 ring-blue-400' : ''}
                `}
                onClick={() => handleOptionClick(letter, index)}
                onFocus={() => setFocusedOption(index)}
                onBlur={() => setFocusedOption(null)}
                role="radio"
                aria-checked={isSelected}
                aria-labelledby={`option-${questionNumber}-${letter}`}
              >
                {/* Hidden radio input for form submission */}
                <input
                  type="radio"
                  name={`question_${questionNumber}`}
                  value={letter}
                  checked={isSelected}
                  onChange={() => handleOptionSelect(letter)}
                  className="sr-only"
                  aria-hidden="true"
                />
                
                {/* Custom Radio Button */}
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5
                  transition-all duration-200 ease-in-out
                  ${isSelected 
                    ? 'border-blue-400 bg-blue-500 text-white shadow-md' 
                    : 'border-white/30 text-white/60 group-hover:border-white/50'
                  }
                `}>
                  {letter}
                </div>
                
                {/* Option Text */}
                <div className="flex-1 min-w-0">
                  <span 
                    id={`option-${questionNumber}-${letter}`}
                    className={`
                      text-base font-medium leading-relaxed block
                      ${isSelected ? 'text-blue-100' : 'text-white/90 group-hover:text-white'}
                    `}
                  >
                    {typeof option === 'string' ? option : option.text || option.value}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Required Field Indicator */}
        {isRequired && !selectedAnswer && (
          <p className="mt-3 text-sm text-yellow-400/80">
            * This question is required
          </p>
        )}
      </div>
    </div>
  );
};

export default MultipleChoiceQuestion; 