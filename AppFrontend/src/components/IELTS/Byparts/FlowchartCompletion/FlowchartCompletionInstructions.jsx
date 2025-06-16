import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Auth/AuthContext';

const FlowchartCompletionInstructions = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPreparingTest, setIsPreparingTest] = useState(true);
  const [testData, setTestData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    try {
      setIsPreparingTest(true);
      setError(null);
      
      // Generate random test number from T1 to T10
      const testNumber = `T${Math.floor(Math.random() * 10) + 1}`;
      const testCode = `J-${testNumber}`;
      
      console.log('Fetching test data for:', testCode);
      
      const response = await fetch(
        `https://q96vyw8ux1.execute-api.us-east-1.amazonaws.com/prod/testbyparts/${testCode}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        }
      );
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error ${response.status}: ${response.statusText}. ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched test data:', data);
      setTestData(data);
      setIsPreparingTest(false);
    } catch (err) {
      console.error('Error fetching test data:', err);
      
      // Provide more specific error messages
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Network error: Please check your internet connection or try again later.');
      } else if (err.message.includes('CORS')) {
        setError('Security error: Unable to connect to test service. Please try refreshing the page.');
      } else if (err.message.includes('API Error')) {
        setError(`Server error: ${err.message}`);
      } else {
        setError(`Failed to prepare test: ${err.message}. Please try again.`);
      }
      
      setIsPreparingTest(false);
    }
  };

  const handleBack = () => {
    navigate('/ielts/practice-by-types');
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      sessionStorage.setItem('showLogoutSuccess', 'true');
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleStartTest = () => {
    if (testData && !isPreparingTest) {
      navigate('/ielts/flowchart-completion/test', { state: { testData } });
    }
  };

  const handleRetry = () => {
    fetchTestData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <button 
              onClick={() => navigate('/skills')}
              className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <span className="material-icons text-white text-lg">school</span>
              </div>
              <span className="text-2xl font-bold text-white drop-shadow-lg">SPINTA</span>
            </button>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={handleBack}
                className="text-white/80 hover:text-white transition duration-200 flex items-center space-x-1"
              >
                <span className="material-icons text-sm">arrow_back</span>
                <span>Back</span>
              </button>
              <div className="text-white/60">|</div>
              <span className="text-white/80 font-medium">Flow-chart Completion</span>
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="group flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white/80 px-4 py-2 rounded-lg hover:bg-white/20 hover:text-white transition-all duration-300 border border-white/20"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">Logging out...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons text-lg group-hover:translate-x-1 transition-transform duration-300">logout</span>
                    <span className="text-sm font-medium">Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl mb-6 shadow-xl">
              <span className="material-icons text-white text-3xl">account_tree</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                Flow-chart Completion
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Complete missing information in flowcharts and process diagrams based on the audio content.
            </p>
          </div>

          {/* Instructions Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="material-icons mr-3 text-emerald-400">info</span>
              Instructions
            </h2>
            
            <div className="space-y-4 text-white/90">
              <div className="flex items-start space-x-3">
                <span className="material-icons text-emerald-400 mt-1">play_circle</span>
                <p>Listen to the audio recording carefully and follow the process being described.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="material-icons text-emerald-400 mt-1">account_tree</span>
                <p>Complete the flowchart by filling in the missing information in the correct sequence.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="material-icons text-emerald-400 mt-1">timer</span>
                <p>Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="material-icons text-emerald-400 mt-1">trending_down</span>
                <p>Follow the flow of the diagram - information is usually presented in sequential order.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="material-icons text-emerald-400 mt-1">spellcheck</span>
                <p>Use the exact words you hear in the recording and check your spelling carefully.</p>
              </div>
            </div>
          </div>

          {/* Test Preparation */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="material-icons mr-3 text-emerald-400">quiz</span>
              Test Preparation
            </h2>
            
            {/* Test Preparation Status */}
            {isPreparingTest && (
              <div className="text-center py-8">
                <div className="inline-flex items-center space-x-3">
                  <svg className="animate-spin h-6 w-6 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-white/80">Preparing your test...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <span className="material-icons text-red-400">error</span>
                  <span className="text-red-200">{error}</span>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleRetry}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {testData && !isPreparingTest && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-3 mb-6">
                  <span className="material-icons text-red-400">check_circle</span>
                  <span className="text-white/80">Your test is ready!</span>
                </div>
              </div>
            )}

            {/* Start Test Button */}
            <div className="text-center">
              <button
                onClick={handleStartTest}
                disabled={!testData || isPreparingTest}
                className={`group px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  testData && !isPreparingTest
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="material-icons text-2xl group-hover:translate-x-1 transition-transform duration-300">
                    play_arrow
                  </span>
                  <span>Start Test</span>
                </div>
              </button>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="material-icons mr-3 text-emerald-400">lightbulb</span>
              Tips for Success
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="material-icons text-emerald-400 mt-1 text-lg">visibility</span>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Visualize the Process</h4>
                    <p className="text-white/70 text-sm">Try to understand the overall process before listening to identify the logical flow.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="material-icons text-emerald-400 mt-1 text-lg">timeline</span>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Follow the Sequence</h4>
                    <p className="text-white/70 text-sm">Information in flowcharts usually follows a chronological or logical order.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="material-icons text-emerald-400 mt-1 text-lg">search</span>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Look for Signposts</h4>
                    <p className="text-white/70 text-sm">Listen for words like "first", "then", "next", "finally" to track your position in the process.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="material-icons text-emerald-400 mt-1 text-lg">category</span>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Understand Relationships</h4>
                    <p className="text-white/70 text-sm">Pay attention to cause-and-effect relationships between different steps.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlowchartCompletionInstructions; 