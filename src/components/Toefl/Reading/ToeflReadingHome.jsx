import React from 'react';
import { ToeflReadingProvider, useToeflReadingContext } from './ToeflReadingContext';
import ToeflReadingInstructions from './ToeflReadingInstructions';
import ToeflReadingTask from './ToeflReadingTask';
import ToeflReadingFeedback from './ToeflReadingFeedback';
import './ToeflReading.css';

const ToeflReadingContent = () => {
  const { 
    showInstructions, 
    showFeedback, 
    error, 
    loadingExam 
  } = useToeflReadingContext();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-6">
            <span className="material-icons text-red-400 text-2xl">error</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Unable to Load Test</h3>
          <p className="text-white/70 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (loadingExam) {
    return <ToeflReadingInstructions />;
  }

  if (showInstructions) {
    return <ToeflReadingInstructions />;
  }

  if (showFeedback) {
    return <ToeflReadingFeedback />;
  }

  return (
    <div className="toefl-reading-container">
      <ToeflReadingTask />
    </div>
  );
};

const ToeflReadingHome = () => {
  return (
    <ToeflReadingProvider>
      <ToeflReadingContent />
    </ToeflReadingProvider>
  );
};

export default ToeflReadingHome; 