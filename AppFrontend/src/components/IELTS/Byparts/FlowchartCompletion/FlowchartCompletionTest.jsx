import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../Auth/AuthContext';
import TestFeedback from '../TestFeedback';

const FlowchartCompletionTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const audioRef = useRef(null);
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isLoadingNewTest, setIsLoadingNewTest] = useState(false);

  // Get test data from navigation state
  const testData = location.state?.testData;

  useEffect(() => {
    if (!testData) {
      navigate('/ielts/practice-by-types');
      return;
    }

    // Initialize user answers for all question steps
    const initialAnswers = {};
    if (testData.testData.steps) {
      testData.testData.steps.forEach(step => {
        if (step.questionNumber) {
          initialAnswers[step.questionNumber] = '';
        }
      });
    }
    setUserAnswers(initialAnswers);

    // Set the first question step as active
    const firstQuestionStep = testData.testData.steps?.find(step => step.questionNumber);
    if (firstQuestionStep) {
      setActiveStep(firstQuestionStep.stepNumber);
    }
  }, [testData, navigate]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !testData?.audioUrl) return;

    const sanitizedAudioUrl = testData.audioUrl.replace(/\.nett/g, '.net');
    if (audio.src !== sanitizedAudioUrl) {
      audio.src = sanitizedAudioUrl;
    }

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      console.error('Audio loading error for URL:', sanitizedAudioUrl);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [testData]);

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

  const handleAnswerChange = (questionNumber, value) => {
    // Limit to three words and/or numbers
    const words = value.trim().split(/\s+/);
    if (words.length > 3) {
      return; // Don't update if more than 3 words
    }
    
    setUserAnswers(prev => ({
      ...prev,
      [questionNumber]: value
    }));

    // Mark step as completed if it has an answer
    if (value.trim()) {
      const step = testData.testData.steps?.find(s => s.questionNumber === questionNumber);
      if (step) {
        setCompletedSteps(prev => new Set([...prev, step.stepNumber]));
      }
    } else {
      const step = testData.testData.steps?.find(s => s.questionNumber === questionNumber);
      if (step) {
        setCompletedSteps(prev => {
          const newSet = new Set(prev);
          newSet.delete(step.stepNumber);
          return newSet;
        });
      }
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const clickX = e.nativeEvent.offsetX;
    const width = e.currentTarget.offsetWidth;
    const newTime = (clickX / width) * duration;
    audio.currentTime = newTime;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    let total = 0;
    
    if (testData.testData.steps) {
      testData.testData.steps.forEach(step => {
        if (step.questionNumber) {
          total++;
          const userAnswer = userAnswers[step.questionNumber]?.trim().toLowerCase();
          const correctAnswer = step.correctAnswer?.trim().toLowerCase();
          if (userAnswer === correctAnswer) {
            correct++;
          }
        }
      });
    }
    
    return {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0
    };
  };

  const handleRetakeTest = () => {
    navigate('/ielts/flowchart-completion/instructions');
  };

  const handleNewTest = async () => {
    setIsLoadingNewTest(true);
    try {
      const randomTestNumber = Math.floor(Math.random() * 10) + 1;
      const newTestCode = `J-T${randomTestNumber}`;
      
      setIsLoadingNewTest(true);
      const response = await fetch(`https://q96vyw8ux1.execute-api.us-east-1.amazonaws.com/prod/testbyparts/${newTestCode}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newTestData = await response.json();
      
      // Navigate to new test
      navigate('/ielts/flowchart-completion/test', { 
        state: { 
          testData: {
            testCode: newTestCode,
            testData: newTestData
          }
        } 
      });
    } catch (error) {
      console.error('Error fetching new test:', error);
      // Fallback to instructions page
      navigate('/ielts/flowchart-completion/instructions');
    } finally {
      setIsLoadingNewTest(false);
    }
  };

  const handleStepClick = (stepNumber) => {
    const step = testData.testData.steps?.find(s => s.stepNumber === stepNumber);
    if (step && step.questionNumber && completedSteps.has(stepNumber)) {
      setActiveStep(stepNumber);
    }
  };

  // Function to render step content with blanks
  const renderStepContent = (step) => {
    if (!step.text.includes('__BLANK__')) {
      return <span>{step.text}</span>;
    }

    const parts = step.text.split('__BLANK__');
    const isActive = activeStep === step.stepNumber;
    const isCompleted = completedSteps.has(step.stepNumber);
    const isCorrect = isSubmitted && 
      userAnswers[step.questionNumber]?.trim().toLowerCase() === step.correctAnswer?.trim().toLowerCase();
    const isIncorrect = isSubmitted && 
      userAnswers[step.questionNumber]?.trim().toLowerCase() !== step.correctAnswer?.trim().toLowerCase();

    return (
      <span>
        {parts[0]}
        <input
          type="text"
          value={userAnswers[step.questionNumber] || ''}
          onChange={(e) => handleAnswerChange(step.questionNumber, e.target.value)}
          onFocus={() => setActiveStep(step.stepNumber)}
          disabled={isSubmitted}
          className={`inline-block mx-2 px-2 py-1 border-2 rounded-md transition-all duration-300 ${
            isSubmitted 
              ? isCorrect
                ? 'border-green-500 bg-green-50 text-green-800'
                : 'border-red-500 bg-red-50 text-red-800'
              : isActive
                ? 'border-emerald-500 bg-white shadow-lg scale-105'
                : 'border-gray-300 bg-white'
          }`}
          placeholder={`Answer ${step.questionNumber}`}
          maxLength={50}
          style={{ minWidth: '120px', width: 'auto' }}
        />
        {parts[1]}
      </span>
    );
  };

  if (!testData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">No test data available</h1>
          <button 
            onClick={() => navigate('/ielts/practice-by-types')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const score = showResults ? calculateScore() : null;
  const progressPercentage = Object.keys(userAnswers).length > 0 
    ? (completedSteps.size / Object.keys(userAnswers).length) * 100 
    : 0;

  // Prepare answers data for TestFeedback component
  const prepareAnswersData = () => {
    const answers = [];
    if (testData.testData.steps) {
      testData.testData.steps.forEach(step => {
        if (step.questionNumber) {
          const userAnswer = userAnswers[step.questionNumber];
          const correctAnswer = step.correctAnswer;
          const isCorrect = userAnswer?.trim().toLowerCase() === correctAnswer?.trim().toLowerCase();
          
          answers.push({
            questionNumber: step.questionNumber,
            userAnswer: userAnswer || '',
            correctAnswer: correctAnswer,
            isCorrect: isCorrect
          });
        }
      });
    }
    return answers;
  };

  // Show feedback page if test is submitted
  if (isSubmitted && showResults) {
    return (
      <TestFeedback
        score={score}
        testType="Flow-chart Completion"
        testCode={testData.testCode}
        onRetakeTest={handleRetakeTest}
        onNewTest={handleNewTest}
        answers={prepareAnswersData()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-emerald-400/15 to-green-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
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
              <span className="text-white/80 font-medium">Flow-chart Completion Test</span>
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
      <main className="relative z-10 py-4">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Test Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl mb-4 shadow-xl">
              <span className="material-icons text-white text-2xl">account_tree</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                Flow-chart Completion Test
              </span>
            </h1>
            <p className="text-lg text-white/70">
              Test Code: {testData.testCode} | Questions: {Object.keys(userAnswers).length}
            </p>
          </div>

          {/* Audio Player */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <span className="material-icons text-white text-xl">headphones</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Audio Recording</h3>
                <p className="text-white/70 text-sm">Listen to the recording and complete the flowchart</p>
              </div>
            </div>

            <audio ref={audioRef} src={testData.audioUrl ? testData.audioUrl.replace(/\.nett/g, '.net') : ''} preload="metadata" />
            
            <div className="space-y-4">
              {/* Play/Pause Button */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlayPause}
                  className="flex items-center justify-center w-12 h-12 bg-emerald-600 hover:bg-emerald-700 rounded-full transition-colors duration-300"
                >
                  <span className="material-icons text-white text-xl">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                
                {/* Time Display */}
                <div className="text-white/80 text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Progress Bar */}
              <div 
                className="w-full h-2 bg-white/20 rounded-full cursor-pointer overflow-hidden"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-100"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Split Screen Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Panel - Interactive Flowchart Canvas (60% on large screens) */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <span className="material-icons mr-3 text-emerald-400">account_tree</span>
                    {testData.testData.flowchartTitle || 'Process Flow-chart'}
                  </h2>
                  <div className="text-sm text-white/70">
                    Progress: {Math.round(progressPercentage)}%
                  </div>
                </div>

                {/* Progress River */}
                <div className="w-full bg-white/20 rounded-full h-2 mb-8 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Interactive Flowchart Steps */}
                <div className="space-y-6">
                  {testData.testData.steps?.map((step, index) => {
                    const isActive = activeStep === step.stepNumber;
                    const isCompleted = completedSteps.has(step.stepNumber);
                    const isQuestion = !!step.questionNumber;
                    const isCorrect = isSubmitted && isQuestion && 
                      userAnswers[step.questionNumber]?.trim().toLowerCase() === step.correctAnswer?.trim().toLowerCase();
                    const isIncorrect = isSubmitted && isQuestion && 
                      userAnswers[step.questionNumber]?.trim().toLowerCase() !== step.correctAnswer?.trim().toLowerCase();

                    return (
                      <div key={step.stepNumber} className="relative">
                        {/* Step Node */}
                        <div 
                          className={`relative p-6 rounded-2xl border-2 transition-all duration-500 cursor-pointer transform ${
                            isActive 
                              ? 'bg-emerald-500/20 border-emerald-400 scale-105 shadow-xl'
                              : isCompleted
                                ? 'bg-green-500/20 border-green-400'
                                : isQuestion
                                  ? 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-emerald-400'
                                  : 'bg-blue-500/20 border-blue-400'
                          }`}
                          onClick={() => isQuestion && handleStepClick(step.stepNumber)}
                        >
                          {/* Step Number Badge */}
                          <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isCompleted 
                              ? 'bg-green-500 text-white'
                              : isActive
                                ? 'bg-emerald-500 text-white animate-pulse'
                                : isQuestion
                                  ? 'bg-white/20 text-white'
                                  : 'bg-blue-500 text-white'
                          }`}>
                            {isCompleted && isQuestion ? (
                              <span className="material-icons text-sm">check</span>
                            ) : (
                              step.stepNumber
                            )}
                          </div>

                          {/* Question/Information Icon */}
                          <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            isQuestion ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
                          }`}>
                            <span className="material-icons text-sm">
                              {isQuestion ? 'help' : 'info'}
                            </span>
                          </div>

                          {/* Step Content */}
                          <div className="text-white text-lg leading-relaxed">
                            {renderStepContent(step)}
                          </div>

                          {/* Validation Feedback */}
                          {isSubmitted && isQuestion && (
                            <div className="absolute -bottom-2 -right-2">
                              {isCorrect ? (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="material-icons text-white text-sm">check</span>
                                </div>
                              ) : (
                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="material-icons text-white text-sm">close</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Active Step Glow Effect */}
                          {isActive && (
                            <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl animate-pulse pointer-events-none"></div>
                          )}
                        </div>

                        {/* Connector Arrow */}
                        {index < testData.testData.steps.length - 1 && (
                          <div className="flex justify-center my-4">
                            <div className={`text-2xl transition-all duration-500 ${
                              completedSteps.has(step.stepNumber) ? 'text-green-400' : 'text-white/50'
                            }`}>
                              {step.arrowText || '↓'}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel - Smart Question Interface (40% on large screens) */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 h-full">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="material-icons mr-3 text-emerald-400">quiz</span>
                  Question Interface
                </h2>

                {/* Mini Progress Map */}
                <div className="mb-6">
                  <div className="text-sm text-white/70 mb-2">Overall Progress</div>
                  <div className="grid grid-cols-5 gap-2">
                    {testData.testData.steps?.filter(step => step.questionNumber).map((step) => (
                      <div 
                        key={step.questionNumber}
                        className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          completedSteps.has(step.stepNumber)
                            ? 'bg-green-500 text-white'
                            : activeStep === step.stepNumber
                              ? 'bg-emerald-500 text-white animate-pulse'
                              : 'bg-white/20 text-white/50'
                        }`}
                      >
                        {step.questionNumber}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                {testData.testData.instructions && (
                  <div className="mb-6">
                    <div className="text-sm text-white/70 mb-2">Instructions</div>
                    <div className="bg-white/5 rounded-lg p-4 text-white/90 text-sm">
                      {testData.testData.instructions}
                    </div>
                  </div>
                )}

                {/* Current Question Details */}
                {activeStep && (
                  <div className="mb-6">
                    <div className="text-sm text-white/70 mb-2">Current Question</div>
                    <div className="bg-emerald-500/20 border border-emerald-400 rounded-lg p-4">
                      {(() => {
                        const currentStep = testData.testData.steps?.find(s => s.stepNumber === activeStep);
                        return currentStep ? (
                          <div>
                            <div className="text-emerald-400 font-bold mb-2">
                              Question {currentStep.questionNumber}
                            </div>
                            <div className="text-white text-sm">
                              Step {currentStep.stepNumber}: {currentStep.text.replace('__BLANK__', '[Answer Here]')}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}

                {/* Answer Statistics */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Completed:</span>
                    <span className="text-green-400 font-bold">{completedSteps.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Remaining:</span>
                    <span className="text-yellow-400 font-bold">{Object.keys(userAnswers).length - completedSteps.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Total Questions:</span>
                    <span className="text-blue-400 font-bold">{Object.keys(userAnswers).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit/Results Section */}
          <div className="text-center">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                className="group bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  <span className="material-icons text-2xl group-hover:translate-x-1 transition-transform duration-300">check_circle</span>
                  <span className="text-lg">Submit Answers</span>
                </div>
              </button>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FlowchartCompletionTest; 