import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../../../lib/TimerContext';
import WritingInstructions from './WritingInstructions';
import ToeflWritingPage from './ToeflWritingPage';

const WritingHome = () => {
  const navigate = useNavigate();
  const { resetTimer } = useTimer();
  const [showInstructions, setShowInstructions] = useState(true);
  
  const handleBackToStart = () => {
    resetTimer();
    setShowInstructions(true);
  };
  
  const handleStartNow = () => {
    setShowInstructions(false);
  };
  
  const handleBackClick = () => {
    resetTimer();
    navigate('/toefl-skills');
  };
  
  const renderInstructions = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <button 
          onClick={handleBackClick}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <span className="material-icons mr-1">arrow_back</span>
          Back
        </button>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">TOEFL Writing Practice</h1>
        <WritingInstructions onStartExam={handleStartNow} />
      </div>
    </div>
  );

  return showInstructions ? renderInstructions() : <ToeflWritingPage onBackToStart={handleBackToStart} />;
};

export default WritingHome; 