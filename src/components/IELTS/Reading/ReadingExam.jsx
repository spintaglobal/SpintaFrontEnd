import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import IeltsReadingTest from './IeltsReadingTest.tsx';
import { logger } from '../../../utils/globalLogger.js';

const ReadingExam = ({ testData, type, onBack }) => {
  const navigate = useNavigate();

  logger.log('ReadingExam: Using test data:', testData);

  const handleTestSubmit = (answers) => {
    // The IeltsReadingTest component now handles navigation to feedback page
    logger.log('Test submitted with answers:', answers);
  };

  const handleBackToHome = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/ielts/reading');
    }
  };

  // Show loading state if no test data is available
  if (!testData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test data...</p>
        </div>
      </div>
    );
  }

  // Check if testData has the expected structure
  if (!testData.sections || !Array.isArray(testData.sections) || testData.sections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="material-icons text-red-600 text-2xl">error</span>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Invalid Test Data</h2>
          <p className="text-red-600 mb-6">The test data structure is invalid or missing sections.</p>
          <button 
            onClick={handleBackToHome}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <IeltsReadingTest 
        testData={testData}
        onSubmit={handleTestSubmit}
        onExit={handleBackToHome}
      />
    </div>
  );
};

export default ReadingExam; 