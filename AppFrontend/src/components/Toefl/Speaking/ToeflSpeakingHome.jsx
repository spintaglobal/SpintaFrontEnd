import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ToeflSpeakingProvider, useToeflSpeakingContext } from './ToeflSpeakingContext';
import ToeflSpeakingInstructions from './ToeflSpeakingInstructions';
import ToeflSpeakingTask from './ToeflSpeakingTask';
import ToeflSpeakingFeedback from './ToeflSpeakingFeedback';
import './ToeflSpeaking.css';

const ToeflSpeakingContent = () => {
  const { 
    error, 
    showInstructions, 
    showFeedback, 
    resetTest
  } = useToeflSpeakingContext();
  
  // Display error message
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">
          <span className="material-icons">error_outline</span>
        </div>
        <h2 className="error-title">Error Loading Test</h2>
        <p className="error-message">{error}</p>
        <button 
          onClick={resetTest} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // Display appropriate component based on state
  if (showInstructions) {
    return <ToeflSpeakingInstructions />;
  } else if (showFeedback) {
    return <ToeflSpeakingFeedback />;
  } else {
    return <ToeflSpeakingTask />;
  }
};

const ToeflSpeakingHome = () => {
  const navigate = useNavigate();
  
  // Handle back button click
  const handleBackToStart = () => {
    navigate('/toefl-skills');
  };
  
  return (
    <ToeflSpeakingProvider>
      <div className="toefl-speaking-container">
        <ToeflSpeakingContent />
      </div>
    </ToeflSpeakingProvider>
  );
};

export default ToeflSpeakingHome; 