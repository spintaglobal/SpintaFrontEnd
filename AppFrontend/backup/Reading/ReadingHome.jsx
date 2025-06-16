import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../../lib/TimerContext';
import ReadingInstructions from './ReadingInstructions';

const ReadingHome = () => {
  const navigate = useNavigate();
  const { resetTimer } = useTimer();
  
  const handleBackClick = () => {
    resetTimer();
    navigate('/skills');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <button 
          onClick={handleBackClick}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <span className="material-icons mr-1">arrow_back</span>
          Home
        </button>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">IELTS Reading Practice</h1>
        
        <ReadingInstructions />
      </div>
    </div>
  );
};

export default ReadingHome;
