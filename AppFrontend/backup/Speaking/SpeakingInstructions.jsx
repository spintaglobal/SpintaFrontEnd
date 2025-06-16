import React from 'react';
import { useSpeakingContext } from './SpeakingContext';
import { Button } from '../ui/button';
import './speaking.css';

const SpeakingInstructions = () => {
  const { startTest, fetchTestData, loading, loadingMessage, setLoading, setError, error, resetError } = useSpeakingContext();
  
  const handleStartTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch test data
      console.log("Attempting to fetch test data");
      await fetchTestData();
      
      // Start the test
      console.log("Starting test with fetched data");
      startTest();
    } catch (error) {
      console.error("Error in handleStartTest:", error);
      setError(`Error starting test: ${error.message}. Using fallback questions.`);
      
      // Still start the test even if there was an error, since we have fallback data
      startTest();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 py-12">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          IELTS Speaking Test
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          This practice test simulates the IELTS Speaking section of the exam.
        </p>
        
        {loadingMessage && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg animate-fade-in">
            {loadingMessage}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg animate-fade-in">
            {error}
            <button 
              onClick={resetError} 
              className="ml-2 text-sm text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow-xl rounded-xl p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Test Format</h2>
        <p className="mb-4 text-gray-700">
          The IELTS Speaking test is a face-to-face interview divided into three parts:
        </p>
        <ul className="list-disc list-inside space-y-4 mb-6 text-gray-700">
          <li>
            <span className="font-medium">Part 1 (Introduction and Interview):</span> 
            <span className="block ml-6 mt-1">
              Answer questions about yourself and familiar topics (4-5 minutes)
            </span>
          </li>
          <li>
            <span className="font-medium">Part 2 (Individual Long Turn):</span>
            <span className="block ml-6 mt-1">
              Speak about a particular topic using a task card (3-4 minutes including 1 minute preparation)
            </span>
          </li>
          <li>
            <span className="font-medium">Part 3 (Two-way Discussion):</span>
            <span className="block ml-6 mt-1">
              Answer questions connected to the topic in Part 2 (4-5 minutes)
            </span>
          </li>
        </ul>
      </div>
      
      <div className="bg-white shadow-xl rounded-xl p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Instructions</h2>
        <ul className="list-disc list-inside space-y-4 mb-6 text-gray-700">
          <li className="flex items-start">
            <span className="flex-shrink-0 h-5 w-5 text-indigo-600 mr-2 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </span>
            <span>Click the microphone button to start and stop recording your answers</span>
          </li>
          <li>Speak clearly and naturally</li>
          <li>Try to give detailed responses, but stay on topic</li>
          <li>Your responses will be transcribed automatically</li>
          <li>At the end, you'll receive AI-generated feedback on your performance</li>
        </ul>
        
        <div className="mt-6 bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
          <strong>Note:</strong> This is a practice test environment. Your responses will be evaluated by an AI assistant to provide instant feedback.
        </div>
      </div>
      
      <div className="text-center mt-12">
        <Button 
          onClick={handleStartTest} 
          disabled={loading} 
          className="start-test-button px-10 py-5 text-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Loading Test...
            </>
          ) : (
            'Start Speaking Test'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SpeakingInstructions;