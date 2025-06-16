import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ListeningExam from './ListeningExam';
import ExamContainer from '../../ui/ExamContainer';
import './ListeningHome.css';

const ListeningHome = () => {
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
      
      // Use the correct working API endpoint with random test number like in ListeningExam
      const randomTestNumber = Math.floor(Math.random() * 20) + 3; // 3-22
      const endpoint = `https://r55vpkomzf.execute-api.us-east-1.amazonaws.com/prod/tests/${randomTestNumber}`;
      
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
      setTestData(data);
      setIsDataReady(true);
      
    } catch (err) {
      console.error('Error fetching listening test data:', err);
      setError(err.message);
      setIsDataReady(false);
    }
  };

  const handleStartExam = () => {
    if (isDataReady && testData) {
      setShowInstructions(false);
    }
  };

  const handleRetry = () => {
    fetchTestData();
  };

  const handleLogout = async () => {
    // Implement logout logic if needed
    navigate('/');
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
          <h2 className="text-2xl font-bold text-red-800 mb-2">Unable to Load Listening Test</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className="text-lg font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-green-600 to-emerald-600 text-white"
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
      <div className="p-8 max-w-4xl mx-auto" style={{ maxHeight: '100vh', overflow: 'hidden' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-8 shadow-xl">
            <span className="material-icons text-white text-3xl">headphones</span>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            IELTS {getTestTypeName()} Listening
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Enhance your listening comprehension skills with authentic IELTS audio materials and tasks.
          </p>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-left max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Test Instructions</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-white text-lg">schedule</span>
                </div>
                <div>
                  <h3 className="font-bold text-blue-800">Duration</h3>
                  <p className="text-blue-700 text-sm">30 minutes + 10 transfer time</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-xl">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-white text-lg">hearing</span>
                </div>
                <div>
                  <h3 className="font-bold text-indigo-800">Format</h3>
                  <p className="text-indigo-700 text-sm">4 sections, 40 questions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-white text-lg">psychology</span>
                </div>
                <div>
                  <h3 className="font-bold text-green-800">Skills Tested</h3>
                  <p className="text-green-700 text-sm">Audio comprehension</p>
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
              <h3 className="font-bold text-gray-800 mb-2">🎧 What to Expect:</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• <strong>Section 1:</strong> Social conversation (2 speakers)</li>
                <li>• <strong>Section 2:</strong> Monologue on general topic</li>
                <li>• <strong>Section 3:</strong> Academic discussion (up to 4 speakers)</li>
                <li>• <strong>Section 4:</strong> Academic lecture or talk</li>
                <li>• Multiple choice, completion, and matching questions</li>
                <li>• Audio plays only once - listen carefully!</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-200">
              <h3 className="font-bold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Ensure your audio is working properly</li>
                <li>• You cannot pause or replay the audio</li>
                <li>• Use headphones for the best experience</li>
                <li>• Take notes while listening</li>
              </ul>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {isDataReady 
                  ? "Your listening test is ready! Click 'Start Test' to begin."
                  : "Please wait while we prepare your audio materials..."
                }
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartExam}
                disabled={!isDataReady}
                className={`text-xl font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isDataReady 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isDataReady ? (
                  <span className="flex items-center gap-3">
                    <span className="material-icons">headphones</span>
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

  return showInstructions ? renderInstructions() : <ListeningExam testData={testData} type={type} onBack={handleBack} />;
};

export default ListeningHome;