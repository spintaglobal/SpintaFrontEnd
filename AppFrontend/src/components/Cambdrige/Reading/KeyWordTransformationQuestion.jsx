import React, { useState, useEffect, useRef, useCallback } from 'react';

const KeyWordTransformationQuestion = ({
  questions = [], // Array of KEY_WORD_TRANSFORMATION questions: { questionNumber, questionType, questionText }
  answers = {}, // Object mapping questionNumbers to answers
  onAnswerChange,
  questionNumber,
  level = 'B2' // B2, C1, or C2 - determines default word limits
}) => {
  // Early validation to prevent errors
  if (typeof onAnswerChange !== 'function') {
    console.error('KeyWordTransformationQuestion: onAnswerChange is not a function:', onAnswerChange);
    return (
      <div className="mb-8 p-6 bg-red-500/10 border border-red-400/20 rounded-xl">
        <p className="text-red-400">Error: Invalid onAnswerChange callback</p>
      </div>
    );
  }

  if (!Array.isArray(questions)) {
    console.error('KeyWordTransformationQuestion: questions is not an array:', questions);
    return (
      <div className="mb-8 p-6 bg-red-500/10 border border-red-400/20 rounded-xl">
        <p className="text-red-400">Error: Invalid questions data</p>
        <div className="text-xs mt-2 text-red-300">
          <p>Expected array, received: {typeof questions}</p>
        </div>
      </div>
    );
  }

  console.log('KeyWordTransformationQuestion received:', {
    questions: questions.length,
    answers: Object.keys(answers).length,
    level,
    questionNumber
  });

  // Parse questionText to extract components
  const parseQuestionText = (questionText) => {
    if (!questionText) return { originalSentence: '', keyWord: '', gappedSentence: '' };
    
    const lines = questionText.split('\n').map(line => line.trim()).filter(line => line);
    let originalSentence = '';
    let keyWord = '';
    let gappedSentence = '';
    
    lines.forEach(line => {
      if (line.toLowerCase().startsWith('original:')) {
        originalSentence = line.substring(9).trim();
      } else if (line.toLowerCase().startsWith('key word:')) {
        keyWord = line.substring(9).trim();
      } else if (line.toLowerCase().startsWith('gapped:')) {
        gappedSentence = line.substring(7).trim();
      }
    });
    
    return { originalSentence, keyWord, gappedSentence };
  };

  // Process questions to add parsed components
  const processedQuestions = questions.map(q => ({
    ...q,
    ...parseQuestionText(q.questionText || '')
  }));

  const [wordCounts, setWordCounts] = useState({});
  const inputRefs = useRef({});

  // Default word limits by level
  const defaultWordLimits = {
    B2: { min: 2, max: 5 },
    C1: { min: 3, max: 6 },
    C2: { min: 3, max: 8 }
  };

  // Count words in input
  const countWords = (text) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  // Handle input change
  const handleInputChange = (questionNumber, value) => {
    const wordCount = countWords(value);
    
    // Update answer
    onAnswerChange(questionNumber, value);
    
    // Update word count
    setWordCounts(prev => ({ ...prev, [questionNumber]: wordCount }));
  };

  // Auto-resize textarea
  const autoResize = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // Get word count color
  const getWordCountColor = (questionNumber) => {
    const limit = defaultWordLimits[level];
    const count = wordCounts[questionNumber] || 0;
    
    if (count === limit.max) return 'text-amber-400';
    if (count >= limit.min) return 'text-green-400';
    return 'text-white/60';
  };

  // Get input border color
  const getInputBorderColor = (questionNumber) => {
    const limit = defaultWordLimits[level];
    const count = wordCounts[questionNumber] || 0;
    
    if (count === limit.max) return 'border-amber-400/60 focus:border-amber-400';
    if (count >= limit.min) return 'border-green-400/60 focus:border-green-400';
    return 'border-white/20 focus:border-blue-400';
  };

  // Get validation message
  const getValidationMessage = (questionNumber) => {
    const limit = defaultWordLimits[level];
    const count = wordCounts[questionNumber] || 0;
    
    if (count === limit.max) return `⚠ Too many words (max ${limit.max})`;
    if (count < limit.min) return `⚠ Too few words (min ${limit.min})`;
    return '✓ Valid transformation';
  };

  // Render question as three rows
  const renderQuestion = (question) => {
    const currentAnswer = answers[question.questionNumber] || '';
    const limit = defaultWordLimits[level];
    const currentWordCount = wordCounts[question.questionNumber] || 0;
    const validationMessage = getValidationMessage(question.questionNumber);

    return (
      <div key={question.questionNumber} className="mb-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-white mb-2">
            Question {question.questionNumber}
          </h4>
        </div>

        {/* Row 1: Original sentence */}
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
          <div className="text-sm font-medium text-blue-300 mb-2">Original sentence:</div>
          <div className="text-white/90 text-lg leading-relaxed">
            {question.originalSentence}
          </div>
        </div>

        {/* Row 2: Key word (prominently styled) */}
        <div className="mb-4 p-4 bg-purple-500/20 border border-purple-400/50 rounded-lg text-center">
          <div className="text-sm font-medium text-purple-300 mb-2">Key word:</div>
          <div className="text-3xl font-bold text-purple-200 tracking-wider">
            {question.keyWord}
          </div>
          <div className="text-xs text-purple-300/70 mt-1">
            (Must be included in your answer)
          </div>
        </div>

        {/* Row 3: Gapped sentence with input */}
        <div className="mb-4 p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
          <div className="text-sm font-medium text-green-300 mb-2">Complete this sentence:</div>
          <div className="text-white/90 text-lg leading-relaxed mb-4">
            {/* Parse gapped sentence and replace gaps with input field */}
            {question.gappedSentence.split(/(\.\.\.|_{3,}|\[gap\]|\(gap\))/gi).map((part, index) => {
              const isGap = /(\.\.\.|_{3,}|\[gap\]|\(gap\))/gi.test(part);
              
              if (isGap) {
                return (
                  <span key={index} className="inline-block mx-1">
                    <textarea
                      ref={el => inputRefs.current[question.questionNumber] = el}
                      value={currentAnswer}
                      onChange={(e) => {
                        handleInputChange(question.questionNumber, e.target.value);
                        autoResize(e.target);
                      }}
                      className={`
                        min-w-[250px] max-w-[400px] min-h-[2.5rem] px-3 py-2 rounded-lg border-2 
                        text-white font-medium transition-all duration-200 ease-in-out resize-none
                        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent
                        placeholder:text-white/40 bg-white/5 backdrop-blur-sm
                        ${getInputBorderColor(question.questionNumber)}
                      `}
                      placeholder={`Include "${question.keyWord}" in your answer...`}
                      rows={1}
                      style={{ height: 'auto' }}
                      aria-label={`Question ${question.questionNumber}, use the key word "${question.keyWord}"`}
                    />
                  </span>
                );
              }
              
              return <span key={index}>{part}</span>;
            })}
          </div>

          {/* Word count and validation */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className={getWordCountColor(question.questionNumber)}>
                Words: {currentWordCount}/{limit.max}
              </span>
              <span className="text-white/60">
                Range: {limit.min}-{limit.max} words
              </span>
            </div>
            {validationMessage && (
              <div className={`
                text-sm px-2 py-1 rounded 
                ${validationMessage === '✓ Valid transformation' ? 'text-green-300' : 'text-yellow-300'}
              `}>
                {validationMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-white">
            Question {questionNumber} - Key Word Transformation
          </h3>
          <div className="text-sm text-white/70">
            {Object.keys(wordCounts).length}/{processedQuestions.length} completed
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(Object.keys(wordCounts).length / processedQuestions.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Instructions */}
        <p className="mt-3 text-sm text-white/80">
          Transform each sentence using the given key word. The meaning must stay the same.
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {processedQuestions.map(question => renderQuestion(question))}
      </div>
    </div>
  );
};

export default KeyWordTransformationQuestion; 