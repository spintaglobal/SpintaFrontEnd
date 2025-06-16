import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReadingExam from './ReadingExam';
import ExamContainer from '../../ui/ExamContainer';
import { motion } from 'framer-motion';
import './ReadingHome.css';
import { useAuth } from '../../Auth/AuthContext';
import { logger } from '../../../utils/globalLogger.js';

const ReadingHome = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // Get IELTS type from URL (academic or general-training)
  const [showInstructions, setShowInstructions] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [testData, setTestData] = useState(null);
  const [error, setError] = useState(null);

  // Trigger API call when component mounts (like Action game topic selection)
  useEffect(() => {
    fetchTestData();
  }, [type]);

  const fetchTestData = async () => {
    try {
      setError(null);
      setIsDataReady(false);
      
      // Generate random test number between 1-20
      const randomTestNumber = Math.floor(Math.random() * 20) + 1;
      
      // Use the correct IELTS endpoint pattern based on test type
      const testId = type === 'academic' 
        ? `ILTS.READ.ACAD.T${randomTestNumber}`
        : `ILTS.READ.GT.T${randomTestNumber}`;
      
      const endpoint = `https://xguxnr9iu0.execute-api.us-east-1.amazonaws.com/live/tests/${testId}`;
      
      logger.info(`Fetching reading test: ${testId} from ${endpoint}`);
      
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
      
      // Handle the API response format like in the backup
      let finalTestData = null;
      if (data?.testData && typeof data.testData === 'string') {
        try { 
          finalTestData = JSON.parse(data.testData); 
        } catch (parseError) { 
          throw new Error("Failed to parse the test data received from the API.");
        }
      } else if (data?.sections && Array.isArray(data.sections)) { 
        finalTestData = data; 
      } else { 
        throw new Error("Received unexpected data format from the API."); 
      }
      
      if (!finalTestData?.sections || !Array.isArray(finalTestData.sections) || finalTestData.sections.length === 0) { 
        throw new Error("Invalid data format: 'sections' array is missing or empty."); 
      }
      
      logger.info(`Successfully fetched reading test: ${testId}`);
      
      setTestData(finalTestData);
      setIsDataReady(true);
      
    } catch (err) {
      logger.error('Error fetching reading test data:', err);
      setError(err.message);
      setIsDataReady(false);
    }
  };

  const handleStartTest = () => {
    if (isDataReady && testData) {
      setShowInstructions(false);
    }
  };

  const handleRetry = () => {
    fetchTestData();
  };

  const handleBack = () => {
    if (type) {
      navigate(`/ielts/${type}/skills`);
    } else {
      navigate('/skills');
    }
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
          <h2 className="text-2xl font-bold text-red-800 mb-2">Unable to Load Reading Test</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className="text-lg font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full mb-8 shadow-xl">
            <span className="material-icons text-white text-3xl">menu_book</span>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6">
            IELTS {getTestTypeName()} Reading
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {type === 'academic' 
              ? 'Test your academic reading skills with complex texts and analytical questions.'
              : 'Practice with practical, everyday reading materials and workplace scenarios.'
            }
          </p>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-left max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Test Instructions</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start gap-4 p-4 bg-cyan-50 rounded-xl">
                <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-white text-lg">schedule</span>
                </div>
                <div>
                  <h3 className="font-bold text-cyan-800">Duration</h3>
                  <p className="text-cyan-700 text-sm">60 minutes total</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-white text-lg">description</span>
                </div>
                <div>
                  <h3 className="font-bold text-blue-800">Format</h3>
                  <p className="text-blue-700 text-sm">3 passages, 40 questions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-white text-lg">psychology</span>
                </div>
                <div>
                  <h3 className="font-bold text-green-800">Skills Tested</h3>
                  <p className="text-green-700 text-sm">Comprehension & analysis</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-white text-lg">analytics</span>
                </div>
                <div>
                  <h3 className="font-bold text-purple-800">AI Feedback</h3>
                  <p className="text-purple-700 text-sm">Detailed performance analysis</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-2">📚 What to Expect:</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                {type === 'academic' ? (
                  <>
                    <li>• Academic texts from journals, magazines, and newspapers</li>
                    <li>• Complex vocabulary and formal writing styles</li>
                    <li>• Charts, diagrams, and technical content</li>
                  </>
                ) : (
                  <>
                    <li>• Practical texts from everyday contexts</li>
                    <li>• Workplace documents and social situations</li>
                    <li>• Instructions, notices, and advertisements</li>
                  </>
                )}
                <li>• Multiple choice, matching, and completion questions</li>
                <li>• True/False/Not Given and Yes/No/Not Given questions</li>
              </ul>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {isDataReady 
                  ? "Your reading test is ready! Click 'Start Test' to begin."
                  : "Please wait while we prepare your test passages..."
                }
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartTest}
                disabled={!isDataReady}
                className={`text-xl font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isDataReady 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isDataReady ? (
                  <span className="flex items-center gap-3">
                    <span className="material-icons">play_arrow</span>
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

  // Show error state if there's an error
  if (error) {
    return renderError();
  }

  return showInstructions ? renderInstructions() : <ReadingExam testData={testData} type={type} onBack={handleBack} />;
};

export default ReadingHome; 