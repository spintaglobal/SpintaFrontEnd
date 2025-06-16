import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import WritingPage from './writingPage';
import { useTimer } from '../../../lib/TimerContext';
import ExamContainer from '../../ui/ExamContainer';
import { motion } from 'framer-motion';

const WritingHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { type } = useParams(); // Get IELTS type from URL (academic or general-training)
  const { resetTimer, setTimerStarted } = useTimer();
  const [showInstructions, setShowInstructions] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [testData, setTestData] = useState(null);
  const [error, setError] = useState(null);
  
  // Trigger API call when component mounts (like Action game topic selection)
  useEffect(() => {
    // Check if this is a refresh request from the writing test page
    const isRefreshRequest = location.state?.refreshTest;
    const customTestNumber = location.state?.testNumber;
    
    if (isRefreshRequest) {
      // If it's a refresh request, automatically start the new test
      setShowInstructions(false);
      // Clear the state to prevent loops
      window.history.replaceState({}, document.title);
    }
    
    fetchExamData(customTestNumber);
  }, [type, location.state]);

  const fetchExamData = async (customTestNumber = null) => {
    try {
      setError(null);
      setIsDataReady(false);
      
      // Use custom test number if provided (from refresh), otherwise generate random
      const randomTestNumber = customTestNumber || Math.floor(Math.random() * 20) + 1;
      
      // Use the correct IELTS endpoint pattern based on test type
      const testId = type === 'academic' 
        ? `ILTS.WRTNG.ACAD.T${randomTestNumber}`
        : `ILTS.WRTNG.GT.T${randomTestNumber}`;
      
      const endpoint = `https://yeo707lcq4.execute-api.us-east-1.amazonaws.com/writingtest/${testId}`;
      
      console.log(`Fetching writing test: ${testId} from ${endpoint}`);
      
      const response = await fetch(endpoint, { 
        method: 'GET', 
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        let errorPayload = null; 
        try { errorPayload = await response.json(); } catch (e) {}
        const errorMsg = errorPayload?.message || errorPayload?.error || `Request failed with status: ${response.status}`;
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      console.log(`Successfully fetched writing test: ${testId}`);
      
      setTestData(data);
      setIsDataReady(true);
      
    } catch (err) {
      console.error('Error fetching exam data:', err);
      setError(err.message);
      setIsDataReady(false);
    }
  };

  const handleBackToStart = () => {
    resetTimer();
    // Navigate back to the appropriate skills page based on type
    if (type) {
      navigate(`/ielts/${type}/skills`);
    } else {
      navigate('/skills'); // Fallback for legacy routes
    }
  };

  const handleStartNow = () => {
    if (isDataReady && testData) {
      // Only start the timer when user clicks "Start Exam" (no loading delay)
      setTimerStarted(true);
      setShowInstructions(false);
    }
  };

  const handleRetry = () => {
    fetchExamData();
  };

  // Determine test type display name
  const getTestTypeName = () => {
    if (type === 'academic') return 'Academic';
    if (type === 'general-training') return 'General Training';
    return 'IELTS'; // Fallback for legacy routes
  };

  // Get test type specific instructions
  const getTestTypeInstructions = () => {
    if (type === 'academic') {
      return {
        task1: 'Task 1: Describe visual data (graph, chart, diagram) - 150+ words',
        task2: 'Task 2: Academic essay with argument/discussion - 250+ words',
        description: 'Academic IELTS Writing focuses on formal, academic language and analytical skills.'
      };
    } else if (type === 'general-training') {
      return {
        task1: 'Task 1: Write a letter (formal, semi-formal, or informal) - 150+ words',
        task2: 'Task 2: Essay on general interest topics - 250+ words',
        description: 'General Training IELTS Writing focuses on practical, everyday communication skills.'
      };
    } else {
      return {
        task1: 'Task 1: Describe visuals or write letters - 150+ words',
        task2: 'Task 2: Essay writing - 250+ words',
        description: 'Master the art of academic writing with authentic IELTS tasks.'
      };
    }
  };

  const testTypeInstructions = getTestTypeInstructions();

  const renderError = () => (
    <ExamContainer>
      <div className="instructions-container">
        <div className="writing-header">
          <h1 className="writing-title">IELTS {getTestTypeName()} Writing Practice</h1>
          <p className="writing-subtitle text-red-600">
            Failed to load exam data
          </p>
        </div>
        
        <div className="instructions-card-compact">
          <div className="text-center p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="material-icons text-red-600 text-2xl">error</span>
            </div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Unable to Load Exam</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRetry}
                className="text-lg font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                <span className="flex items-center gap-2">
                  <span className="material-icons">refresh</span>
                  Try Again
                </span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToStart}
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
      </div>
    </ExamContainer>
  );

  const renderInstructions = () => (
    <ExamContainer>
      <div className="instructions-container">
        <div className="writing-header">
          <h1 className="writing-title">IELTS {getTestTypeName()} Writing Practice</h1>
          <p className="writing-subtitle">
            {testTypeInstructions.description}
          </p>
        </div>
        
        <div className="instructions-card-compact">
          <h2 className="instructions-title">IELTS {getTestTypeName()} Writing Test Instructions</h2>
          
          <div className="instructions-content-grid">
            <div className="instruction-block-compact">
              <div className="instruction-icon-small">
                <span className="material-icons">edit_note</span>
              </div>
              <div className="instruction-details-compact">
                <h3>Test Structure</h3>
                <p><strong>2 Tasks</strong> - Task 1 (150+ words) & Task 2 (250+ words)</p>
              </div>
            </div>

            <div className="instruction-block-compact">
              <div className="instruction-icon-small">
                <span className="material-icons">schedule</span>
              </div>
              <div className="instruction-details-compact">
                <h3>Time Management</h3>
                <p><strong>60 minutes</strong> total - Plan: 20 min + 40 min</p>
              </div>
            </div>

            <div className="instruction-block-compact">
              <div className="instruction-icon-small">
                <span className="material-icons">task_alt</span>
              </div>
              <div className="instruction-details-compact">
                <h3>Task Types</h3>
                <div>
                  <p><strong>Task 1:</strong> {testTypeInstructions.task1.split(' - ')[0]}</p>
                  <p><strong>Task 2:</strong> {testTypeInstructions.task2.split(' - ')[0]}</p>
                </div>
              </div>
            </div>

            <div className="instruction-block-compact">
              <div className="instruction-icon-small">
                <span className="material-icons">analytics</span>
              </div>
              <div className="instruction-details-compact">
                <h3>Assessment</h3>
                <p><strong>4 Criteria</strong> - Task Response, Coherence, Lexical, Grammar</p>
              </div>
            </div>

            <div className="instruction-block-compact">
              <div className="instruction-icon-small">
                <span className="material-icons">priority_high</span>
              </div>
              <div className="instruction-details-compact">
                <h3>Key Points</h3>
                <p>Task 2 counts <strong>twice</strong> as much as Task 1</p>
              </div>
            </div>

            <div className="instruction-block-compact">
              <div className="instruction-icon-small">
                <span className="material-icons">feedback</span>
              </div>
              <div className="instruction-details-compact">
                <h3>AI Feedback</h3>
                <p>Get <strong>detailed analysis</strong> and improvement tips</p>
              </div>
            </div>
          </div>

          <div className="start-instruction-compact">
            <p className="text-center font-medium text-gray-800">
              {isDataReady 
                ? "Your exam is ready! Click 'Start Exam' to begin."
                : "Please wait while we prepare your exam questions..."
              }
            </p>
          </div>
          
          <div className="text-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartNow}
              disabled={!isDataReady}
              className={`text-xl font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                isDataReady 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isDataReady ? (
                <span className="flex items-center gap-3">
                  <span className="material-icons">edit</span>
                  Start Exam
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  Preparing Exam...
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </ExamContainer>
  );

  // Show error state if there's an error
  if (error) {
    return renderError();
  }

  return showInstructions ? renderInstructions() : <WritingPage onBackToStart={handleBackToStart} testType={type} testData={testData} />;
};

export default WritingHome;