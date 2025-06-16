import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ExamContainer from '../../ui/ExamContainer';
import { Part1, Part2, Part3 } from './SpeakingParts';
import SpeakingFeedback from './SpeakingFeedback';
import { SpeakingProvider, useSpeakingContext } from './SpeakingContext';
import fallbackData from './fallback.js';
import './speaking.css';

// Global request cache to prevent duplicate requests
const requestCache = new Map();

const SpeakingHomeContent = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // Get IELTS type from URL (academic or general-training)
  
  // Use context for state management
  const {
    testData,
    error,
    showInstructions,
    currentPart,
    showFeedback,
    transcriptions,
    isRecording,
    setTestDataDirectly,
    resetTest,
    startTest,
    nextPart,
    updateTranscription,
    toggleRecording
  } = useSpeakingContext();
  
  const [isDataReady, setIsDataReady] = useState(false);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  const hasRequestedRef = useRef(false);

  // Trigger API call when component mounts (same as Reading)
  useEffect(() => {
    isMountedRef.current = true;
    
    // Only make request if we haven't already requested for this component instance
    if (!hasRequestedRef.current) {
      hasRequestedRef.current = true;
      fetchTestData();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [type]);

  // Removed auto-start behavior - user needs to click Start Test button like in Writing

  const fetchTestData = async () => {
    try {
      // Both Academic and General Training use the same speaking tests
      const cacheKey = `speaking-unified`;
      
      // Check if we have cached data first
      if (requestCache.has(cacheKey)) {
        const cachedResult = requestCache.get(cacheKey);
        if (isMountedRef.current) {
          console.log('Using cached speaking test data');
          setTestDataDirectly(cachedResult.data);
          setIsDataReady(true);
          if (cachedResult.error) {
            console.warn('Cached data has error:', cachedResult.error);
          }
          return;
        }
      }

      // Generate random test number from T1 to T20
      const testNumber = `T${Math.floor(Math.random() * 20) + 1}`;
      // Both Academic and General Training use the same GT test format
      const testCode = `ILTS.SPKNG.GT.${testNumber}`;
      
      console.log(`Fetching speaking test: ${testCode}`);
      
      // Use the correct AWS API endpoint for speaking tests
      const response = await fetch(`https://8l1em9gvy7.execute-api.us-east-1.amazonaws.com/speakingtest/${testCode}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched speaking test: ${testCode}`);
      
      // Cache the successful result
      requestCache.set(cacheKey, { data, error: null });
      
      if (isMountedRef.current) {
        setTestDataDirectly(data);
        setIsDataReady(true);
      }
    } catch (err) {
      console.error('Error fetching speaking test data:', err);
      const errorMessage = err.message || 'Failed to load test data. Using practice questions.';
      
      // Cache the fallback data with error info
      const cacheKey = `speaking-unified`;
      requestCache.set(cacheKey, { data: fallbackData, error: errorMessage });
      
      if (isMountedRef.current) {
        // Use fallback data when API fails
        setTestDataDirectly(fallbackData);
        setIsDataReady(true);
      }
    }
  };

  const handleRetry = () => {
    fetchTestData();
  };

  const handleStartTest = () => {
    if (isDataReady && testData) {
      startTest();
    }
  };

  const handleBack = () => {
    navigate('/ielts-skills');
  };

  const showFeedbackPage = () => {
    // This function is no longer needed as Part3 will directly call getFeedback from context
    console.warn('showFeedbackPage called - this should not happen with the new context approach');
  };

  // Determine test type display name
  const getTestTypeName = () => {
    if (type === 'academic') return 'Academic';
    if (type === 'general-training') return 'General Training';
    return 'IELTS';
  };

  const renderError = () => (
    <ExamContainer>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="material-icons text-red-600 text-2xl">error</span>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Unable to Load Speaking Test</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className="text-lg font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <span className="flex items-center gap-2">
                <span className="material-icons">refresh</span>
                Try Again
              </span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="text-lg font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-gray-500 hover:bg-gray-600 text-white"
            >
              <span className="flex items-center gap-2">
                <span className="material-icons">arrow_back</span>
                Go Back
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </ExamContainer>
  );

  const renderInstructions = () => (
    <ExamContainer>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-8 shadow-xl">
            <span className="material-icons text-white text-3xl">record_voice_over</span>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            IELTS {getTestTypeName()} Speaking
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Practice your spoken English with our AI-powered speaking assessment system
          </p>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-left max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Test Instructions</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-white text-lg">schedule</span>
                </div>
                <div>
                  <h3 className="font-bold text-purple-800">Duration</h3>
                  <p className="text-purple-700 text-sm">11-14 minutes total</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-xl">
                <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-white text-lg">record_voice_over</span>
                </div>
                <div>
                  <h3 className="font-bold text-pink-800">Format</h3>
                  <p className="text-pink-700 text-sm">3 parts, face-to-face style</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-xl">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-white text-lg">mic</span>
                </div>
                <div>
                  <h3 className="font-bold text-indigo-800">Recording</h3>
                  <p className="text-indigo-700 text-sm">Voice recorded for analysis</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-white text-lg">analytics</span>
                </div>
                <div>
                  <h3 className="font-bold text-emerald-800">AI Feedback</h3>
                  <p className="text-emerald-700 text-sm">Detailed performance analysis</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-2">🎙️ What to Expect:</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• <strong>Part 1:</strong> Personal questions about yourself and familiar topics (4-5 minutes)</li>
                <li>• <strong>Part 2:</strong> Speak about a topic for 1-2 minutes with preparation time</li>
                <li>• <strong>Part 3:</strong> Discussion of abstract ideas related to Part 2 topic (4-5 minutes)</li>
                <li>• AI will analyze your fluency, vocabulary, grammar, and pronunciation</li>
                <li>• Same format for both Academic and General Training</li>
              </ul>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
              <h3 className="font-bold text-amber-800 mb-2">⚠️ Important Notes:</h3>
              <ul className="text-amber-700 text-sm space-y-1">
                <li>• Ensure your microphone is working properly</li>
                <li>• Find a quiet environment for recording</li>
                <li>• Speak clearly and at a normal pace</li>
                <li>• Don't worry about perfect pronunciation - focus on communication</li>
              </ul>
            </div>

            {/* Show warning if using fallback data */}
            {error && isDataReady && (
              <div className="bg-orange-50 rounded-xl p-4 mb-6 border border-orange-200">
                <h3 className="font-bold text-orange-800 mb-2">⚠️ Using Practice Data:</h3>
                <p className="text-orange-700 text-sm">
                  We're using practice questions as the live test data couldn't be loaded. 
                  You can still complete the full speaking practice with AI feedback.
                </p>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {isDataReady 
                  ? "Your speaking test is ready! Click 'Start Test' to begin."
                  : "Please wait while we prepare your speaking prompts..."
                }
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartTest}
                disabled={!isDataReady}
                className={`text-xl font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isDataReady 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isDataReady ? (
                  <span className="flex items-center gap-3">
                    <span className="material-icons">mic</span>
                    Start Test
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    Preparing Test...
                  </span>
                )}
              </motion.button>
            </div>
          </div>
          
          <button 
            onClick={handleBack}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <span className="material-icons">arrow_back</span>
            Choose Different Skill
          </button>
        </div>
      </div>
    </ExamContainer>
  );

  // Show error state if there's an error and no data
  if (error && !isDataReady) {
    return renderError();
  }

  // Show feedback page
  if (showFeedback) {
    return (
      <SpeakingFeedback 
        testData={testData}
        transcriptions={transcriptions}
        onBack={resetTest}
      />
    );
  }

  // Show instructions or test
  if (showInstructions) {
    return renderInstructions();
  }

  // Show the actual test parts
  const testProps = {
    testData,
    transcriptions,
    isRecording,
    updateTranscription,
    toggleRecording,
    nextPart,
    onBack: resetTest
  };

  return (
    <div className="speaking-container min-h-screen">
      <div className="p-4 md:p-8">
        {currentPart === 1 && <Part1 {...testProps} />}
        {currentPart === 2 && <Part2 {...testProps} />}
        {currentPart === 3 && <Part3 {...testProps} />}
      </div>
    </div>
  );
};

const SpeakingHome = () => (
  <SpeakingProvider>
    <SpeakingHomeContent />
  </SpeakingProvider>
);

export default SpeakingHome;