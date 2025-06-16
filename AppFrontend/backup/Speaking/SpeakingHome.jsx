import React from 'react';
import { useSpeakingContext } from './SpeakingContext';
import SpeakingInstructions from './SpeakingInstructions';
import { Part1, Part2, Part3 } from './SpeakingParts';
import SpeakingFeedback from './SpeakingFeedback';
import { Button } from '../ui/button';
import './speaking.css';

const SpeakingHome = () => {
  const {
    testData,
    loading,
    loadingMessage,
    error,
    resetError,
    showInstructions,
    currentPart,
    showFeedback,
    resetTest
  } = useSpeakingContext();
  
  const handleReturnToInstructions = () => {
    resetError();
    resetTest();
  };
  
  // Display error message if there's an error
  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={handleReturnToInstructions}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Return to Instructions
          </Button>
        </div>
      </div>
    );
  }
  
  // Display loading state while fetching test data
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
        <p className="text-xl text-slate-600">{loadingMessage || 'Loading test data...'}</p>
      </div>
    );
  }
  
  // Display a toast-like notification for loading message when not in loading state
  const renderLoadingMessage = () => {
    if (loadingMessage && !loading) {
      return (
        <div className="fixed top-4 right-4 bg-blue-50 text-blue-700 p-3 rounded-lg shadow-md animate-fade-in z-50">
          {loadingMessage}
        </div>
      );
    }
    return null;
  };
  
  // Function to check if test data is valid when we need it
  const hasValidTestData = () => {
    return testData && 
           testData.testId && 
           Array.isArray(testData.Part1) && 
           testData.Part2 && 
           typeof testData.Part2 === 'object' &&
           testData.Part2.title &&
           Array.isArray(testData.Part2.cues) &&
           testData.Part2.final_question &&
           Array.isArray(testData.Part3);
  };
  
  return (
    <div className="speaking-container min-h-screen">
      {renderLoadingMessage()}
      
      {/* First step: Show instructions */}
      {showInstructions ? (
        <SpeakingInstructions />
      ) : showFeedback ? (
        /* Third step: Show feedback after test completion */
        <SpeakingFeedback />
      ) : (
        /* Second step: Show the actual test after clicking Start */
        <div className="p-4 md:p-8">
          {/* Check if we have valid test data when needed */}
          {!hasValidTestData() ? (
            <div className="max-w-5xl mx-auto">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
                <h2 className="text-xl font-semibold text-yellow-700 mb-2">Test Not Loaded</h2>
                <p className="text-yellow-600 mb-4">There was a problem loading the test data. Please return to the instructions page and try again.</p>
                <Button 
                  onClick={handleReturnToInstructions}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                >
                  Return to Instructions
                </Button>
              </div>
            </div>
          ) : (
            /* Show the appropriate test part */
            <>
              {currentPart === 1 && <Part1 />}
              {currentPart === 2 && <Part2 />}
              {currentPart === 3 && <Part3 />}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeakingHome;