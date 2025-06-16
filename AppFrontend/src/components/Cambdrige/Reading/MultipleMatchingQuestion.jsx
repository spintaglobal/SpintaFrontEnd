import React from 'react';

const MultipleMatchingQuestion = ({
  passage, // Passage object containing texts/sections
  questions = [], // Array of MULTIPLE_MATCHING questions: { questionNumber, questionType, questionText }
  answers = {}, // Object mapping questionNumbers to selected option letters (A-G)
  onAnswerChange,
  questionNumber,
  sectionData, // Section data to determine layout type (Part 6 vs Part 8)
  level = 'B2' // B1, B2, C1, C2
}) => {
  // Early validation to prevent errors
  if (typeof onAnswerChange !== 'function') {
    console.error('MultipleMatchingQuestion: onAnswerChange is not a function:', onAnswerChange);
    return (
      <div className="mb-8 p-6 bg-red-500/10 border border-red-400/20 rounded-xl">
        <p className="text-red-400">Error: Invalid onAnswerChange callback</p>
      </div>
    );
  }

  if (!Array.isArray(questions)) {
    console.error('MultipleMatchingQuestion: questions is not an array:', questions);
    return (
      <div className="mb-8 p-6 bg-red-500/10 border border-red-400/20 rounded-xl">
        <p className="text-red-400">Error: Invalid questions data</p>
        <div className="text-xs mt-2 text-red-300">
          <p>Expected array, received: {typeof questions}</p>
        </div>
      </div>
    );
  }

  // Determine layout type based on section number (Part 6 vs Part 8)
  const isPartSix = sectionData?.sectionNumber === 6; // Cross-text comparison
  const isPartEight = sectionData?.sectionNumber === 8; // Single/multiple texts

  // Extract available options based on layout type
  const getAvailableOptions = () => {
    if (isPartSix) {
      // Part 6: Cross-text comparison (A, B, C, D representing different texts)
      return ['A', 'B', 'C', 'D'];
    } else if (isPartEight) {
      // Part 8: Single/multiple texts (A, B, C, D, E, F, G representing sections)
      return ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    } else {
      // Default fallback
      return ['A', 'B', 'C', 'D'];
    }
  };

  const availableOptions = getAvailableOptions();

  // Handle answer selection
  const handleAnswerSelect = (questionNumber, selectedOption) => {
    onAnswerChange(questionNumber, selectedOption);
  };

  // Render question with dropdown
  const renderQuestion = (question, index) => {
    const currentAnswer = answers[question.questionNumber];

    return (
      <div
        key={question.questionNumber}
        className="p-5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
      >
        {/* Question number and text */}
        <div className="mb-4">
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 font-bold text-lg">
              {question.questionNumber}
            </div>
            <div className="flex-1">
              <p className="text-white/90 leading-relaxed text-lg">
                {question.questionText}
              </p>
            </div>
          </div>
        </div>

        {/* Answer dropdown */}
        <div className="flex items-center space-x-4 ml-14">
          <label className="text-base text-white/70 font-medium">Answer:</label>
          <select
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerSelect(question.questionNumber, e.target.value)}
            className="
              px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-lg
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
              hover:bg-white/15 transition-colors min-w-[120px]
            "
          >
            <option value="" className="bg-gray-800 text-white">--</option>
            {availableOptions.map(option => (
              <option 
                key={option} 
                value={option} 
                className="bg-gray-800 text-white"
              >
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  // Render text sections/paragraphs with better formatting
  const renderTextSections = () => {
    if (!passage) return null;

    let passageText = '';
    if (typeof passage === 'string') {
      passageText = passage;
    } else if (passage && typeof passage === 'object') {
      passageText = passage.passageText || passage.text || '';
    }

    if (!passageText) {
      return (
        <div className="text-red-400 p-4 border border-red-400/50 rounded">
          <p>Error: Unable to load passage text</p>
        </div>
      );
    }

    // Split text into paragraphs or sections
    const sections = passageText.split(/\n\n+/).filter(section => section.trim());
    
    return (
      <div className="space-y-6">
        <h4 className="text-xl font-semibold text-white mb-4">
          {isPartSix ? 'Compare information across these texts:' : 'Find information in these sections:'}
        </h4>
        <div className="space-y-6">
          {availableOptions.map((option, index) => {
            const sectionText = sections[index] || `Section ${option} content would appear here...`;
            
            return (
              <div
                key={option}
                className="p-6 rounded-xl border border-white/20 bg-white/5"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl bg-blue-500/20 text-blue-300 border-2 border-blue-400/50">
                    {option}
                  </div>
                  <h5 className="text-xl font-semibold text-white">
                    {isPartSix ? `Text ${option}` : `Section ${option}`}
                  </h5>
                </div>
                <div className="text-white/90 leading-relaxed text-lg pl-4 border-l-2 border-blue-400/30">
                  {sectionText.trim()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Count completed questions
  const completedQuestions = Object.keys(answers).filter(key => answers[key] && answers[key].trim()).length;

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xl font-semibold text-white">
            {isPartSix ? 'Part 6: Cross-text Reading' : isPartEight ? 'Part 8: Multiple Matching' : 'Multiple Matching'}
          </h3>
          <div className="text-lg text-white/70">
            {completedQuestions}/{questions.length} completed
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(completedQuestions / questions.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Instructions */}
        <p className="text-lg text-white/80">
          {isPartSix 
            ? 'Compare information across different texts and select the correct text for each question.'
            : isPartEight 
              ? 'Find specific information in the sections and select the correct section for each question.'
              : 'Match each question to the correct section or text.'
          }
        </p>
      </div>

      {/* Main content - Split view with more space */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Questions panel - 2 columns */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <h4 className="text-xl font-semibold text-white mb-6">
              Questions ({questions.length})
            </h4>
            
            <div className="space-y-5 max-h-[700px] overflow-y-auto">
              {questions.map((question, index) => renderQuestion(question, index))}
            </div>
          </div>
        </div>

        {/* Text sections panel - 3 columns for more space */}
        <div className="lg:col-span-3">
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="max-h-[700px] overflow-y-auto">
              {renderTextSections()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleMatchingQuestion;