import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext.jsx';

const CambridgeWritingExam = ({ examData }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(examData?.overallWritingTimeMinutes * 60 || 1800); // Convert to seconds
  const [taskResponses, setTaskResponses] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [showSubmissionReview, setShowSubmissionReview] = useState(false);
  const [showConfirmSubmission, setShowConfirmSubmission] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [warningType, setWarningType] = useState('');
  const [hasUnsavedWork, setHasUnsavedWork] = useState(false);
  const [pointsChecked, setPointsChecked] = useState({});
  const [lastAutoSave, setLastAutoSave] = useState(Date.now());
  const [selectedOptions, setSelectedOptions] = useState({}); // For choice-based tasks
  const [collapsedOptions, setCollapsedOptions] = useState({}); // For managing collapsed state
  const textareaRef = useRef(null);
  const autoSaveIntervalRef = useRef(null);
  
  // Timer effect with warnings and auto-submission
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Show warnings at 10 and 5 minutes
        if (newTime === 600 && !showTimeWarning) { // 10 minutes
          setWarningType('10min');
          setShowTimeWarning(true);
        } else if (newTime === 300 && warningType !== '5min') { // 5 minutes
          setWarningType('5min');
          setShowTimeWarning(true);
        }
        
        // Auto-submit when time expires
        if (newTime <= 0) {
          clearInterval(timer);
          handleAutoSubmission();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showTimeWarning, warningType]);
  
  // Auto-save effect (every 30 seconds)
  useEffect(() => {
    autoSaveIntervalRef.current = setInterval(() => {
      if (hasUnsavedWork) {
        setAutoSaveStatus('saving...');
        setLastAutoSave(Date.now());
        // Simulate save operation
        setTimeout(() => {
          setAutoSaveStatus('saved');
          setHasUnsavedWork(false);
        }, 1000);
      }
    }, 30000);
    
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [hasUnsavedWork]);
  
  // Immediate save feedback effect
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      setAutoSaveStatus('saved');
    }, 2000);
    
    return () => clearTimeout(autoSaveTimer);
  }, [taskResponses]);
  
  // Prevent accidental page close with unsaved work
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedWork) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedWork]);
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleTaskResponse = (taskIndex, response) => {
    setTaskResponses(prev => ({
      ...prev,
      [taskIndex]: response
    }));
    setAutoSaveStatus('saving...');
    setHasUnsavedWork(true);
  };
  
  const getCurrentWordCount = () => {
    const response = taskResponses[currentTaskIndex] || '';
    return response.trim().split(/\s+/).filter(word => word.length > 0).length;
  };
  
  const getWordCountColor = () => {
    const currentTask = examData?.tasks[currentTaskIndex];
    const selectedOption = selectedOptions[currentTaskIndex];
    
    let wordCountRequirement = null;
    
    // For choice-based tasks, get word count from selected option
    if (selectedOption && currentTask?.options) {
      const option = currentTask.options.find(opt => 
        opt.optionNumber === selectedOption || opt.optionLetter === selectedOption
      );
      wordCountRequirement = option?.constraints?.wordCount;
    } else {
      wordCountRequirement = currentTask?.constraints?.wordCount;
    }
    
    if (!wordCountRequirement) return 'text-white';
    
    const wordCount = getCurrentWordCount();
    const [min, max] = wordCountRequirement.split('-').map(num => parseInt(num.trim()));
    
    if (wordCount === 0) return 'text-gray-300';
    if (wordCount < min || (max && wordCount > max)) return 'text-red-300';
    if (wordCount >= min && (!max || wordCount <= max)) return 'text-green-300';
    return 'text-yellow-300';
  };
  
  const getWordCountRequirement = () => {
    const currentTask = examData?.tasks[currentTaskIndex];
    const selectedOption = selectedOptions[currentTaskIndex];
    
    // For choice-based tasks, get word count from selected option
    if (selectedOption && currentTask?.options) {
      const option = currentTask.options.find(opt => 
        opt.optionNumber === selectedOption || opt.optionLetter === selectedOption
      );
      if (option?.constraints?.wordCount) {
        return option.constraints.wordCount;
      }
    }
    
    // For regular tasks
    if (currentTask?.constraints?.wordCount) {
      return currentTask.constraints.wordCount;
    }
    return 'No limit specified';
  };
  
  const getTaskCompletionStatus = (taskIndex) => {
    const response = taskResponses[taskIndex] || '';
    const wordCount = response.trim().split(/\s+/).filter(word => word.length > 0).length;
    const task = examData?.tasks[taskIndex];
    const selectedOption = selectedOptions[taskIndex];
    
    let wordCountRequirement = null;
    
    // For choice-based tasks, get word count from selected option
    if (selectedOption && task?.options) {
      const option = task.options.find(opt => 
        opt.optionNumber === selectedOption || opt.optionLetter === selectedOption
      );
      wordCountRequirement = option?.constraints?.wordCount;
    } else {
      wordCountRequirement = task?.constraints?.wordCount;
    }
    
    if (!wordCountRequirement) return 'in-progress';
    
    const [min, max] = wordCountRequirement.split('-').map(num => parseInt(num.trim()));
    
    if (wordCount === 0) return 'not-started';
    if (wordCount >= min && (!max || wordCount <= max)) return 'completed';
    return 'in-progress';
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
  
  const handleBack = () => {
    if (hasUnsavedWork) {
      if (window.confirm('You have unsaved work. Are you sure you want to leave?')) {
        navigate('/cambridge/writing');
      }
    } else {
      navigate('/cambridge/writing');
    }
  };
  
  const handleAutoSubmission = () => {
    setShowConfirmSubmission(true);
  };
  
  const handleSubmitExam = () => {
    // Check if all choice-based tasks have selections
    const incompleteChoices = examData.tasks.filter((task, index) => 
      task.options && !selectedOptions[index]
    );
    
    if (incompleteChoices.length > 0) {
      alert('Please select an option for all choice-based tasks before submitting.');
      return;
    }
    
    setShowSubmissionReview(true);
  };
  
  const handleFinalSubmission = () => {
    setShowConfirmSubmission(false);
    setShowSubmissionReview(false);
    
    // Prepare submission data for feedback
    const submissionData = {
      examData,
      taskResponses,
      selectedOptions,
      pointsChecked,
      submissionTime: new Date().toISOString(),
      timeSpent: examData.overallWritingTimeMinutes * 60 - timeRemaining
    };
    
    // Navigate to feedback page with submission data
    navigate('/cambridge/writing/feedback', { 
      state: { submissionData },
      replace: true 
    });
  };
  
  const handlePointCheck = (taskIndex, pointIndex, checked) => {
    setPointsChecked(prev => ({
      ...prev,
      [`${taskIndex}-${pointIndex}`]: checked
    }));
  };
  
  const handleOptionSelect = (taskIndex, optionValue) => {
    setSelectedOptions(prev => ({
      ...prev,
      [taskIndex]: optionValue
    }));
    
    // Auto-collapse other options when one is selected
    const task = examData?.tasks[taskIndex];
    if (task?.options) {
      const newCollapsed = {};
      task.options.forEach(option => {
        const optKey = option.optionNumber || option.optionLetter;
        if (optKey !== optionValue) {
          newCollapsed[`${taskIndex}-${optKey}`] = true;
        }
      });
      setCollapsedOptions(prev => ({
        ...prev,
        ...newCollapsed
      }));
    }
  };
  
  const toggleOptionCollapse = (taskIndex, optionValue) => {
    const key = `${taskIndex}-${optionValue}`;
    setCollapsedOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const getTaskTypeIcon = (taskType) => {
    switch (taskType) {
      case 'SHORT_MESSAGE_EMAIL':
        return 'email';
      case 'SHORT_STORY_FROM_PROMPTS':
        return 'auto_stories';
      case 'ESSAY':
        return 'article';
      case 'ARTICLE':
        return 'newspaper';
      case 'REPORT':
        return 'assessment';
      case 'LETTER':
        return 'mail';
      case 'PROPOSAL':
        return 'lightbulb';
      case 'REVIEW':
        return 'rate_review';
      default:
        return 'edit_note';
    }
  };
  
  const currentTask = examData?.tasks[currentTaskIndex];
  const isFirstTask = currentTaskIndex === 0;
  const isLastTask = currentTaskIndex === examData?.tasks.length - 1;
  
  // Get level-specific styling
  const getLevelStyling = () => {
    const level = examData?.examLevel;
    switch (level) {
      case 'A2_KEY':
        return {
          primary: 'from-green-500 to-green-700',
          accent: 'text-green-400',
          bg: 'bg-green-600'
        };
      case 'B1_PRELIMINARY':
        return {
          primary: 'from-blue-500 to-blue-700',
          accent: 'text-blue-400',
          bg: 'bg-blue-600'
        };
      case 'B2_FIRST':
        return {
          primary: 'from-purple-500 to-purple-700',
          accent: 'text-purple-400',
          bg: 'bg-purple-600'
        };
      case 'C1_ADVANCED':
        return {
          primary: 'from-red-500 to-red-700',
          accent: 'text-red-400',
          bg: 'bg-red-600'
        };
      case 'C2_PROFICIENCY':
        return {
          primary: 'from-orange-500 to-orange-700',
          accent: 'text-orange-400',
          bg: 'bg-orange-600'
        };
      default:
        return {
          primary: 'from-emerald-500 to-emerald-700',
          accent: 'text-emerald-400',
          bg: 'bg-emerald-600'
        };
    }
  };
  
  const levelStyling = getLevelStyling();
  
  if (!examData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading exam...</div>
      </div>
    );
  }
  
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Brand */}
              <button 
                onClick={() => navigate('/skills')}
                className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img 
                    src="/logo.ico" 
                    alt="SPINTA Logo" 
                    className="w-8 h-8 rounded-lg object-contain" 
                    style={{
                      imageRendering: 'crisp-edges',
                      filter: 'contrast(1.1) brightness(1.05)',
                      WebkitFilter: 'contrast(1.1) brightness(1.05)'
                    }} 
                  />
                </div>
                <span className="text-2xl font-bold text-white drop-shadow-lg">SPINTA</span>
              </button>
              
              {/* Exam Info */}
              <div className="hidden md:flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-base text-white/70">Exam</div>
                  <div className="text-white font-medium text-lg">{examData.testTitle}</div>
                </div>
                <div className="text-center">
                  <div className="text-base text-white/70">Task</div>
                  <div className="text-white font-medium text-lg">{currentTaskIndex + 1} of {examData.tasks.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-base text-white/70">Time Remaining</div>
                  <div className={`text-xl font-bold ${timeRemaining < 300 ? 'text-red-300' : 'text-white'}`}>
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>
              
              {/* User Actions */}
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white/80 px-4 py-2 rounded-lg hover:bg-white/20 hover:text-white transition-all duration-300 border border-white/20"
                >
                  <span className="material-icons text-lg">assignment</span>
                  <span className="text-sm font-medium">Review</span>
                </button>
                <button 
                  onClick={handleSubmitExam}
                  className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
                >
                  <span className="material-icons text-lg">send</span>
                  <span className="text-sm font-medium">Submit</span>
                </button>
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

        {/* Mobile Header Info */}
        <div className="md:hidden bg-white/5 backdrop-blur-sm border-b border-white/10 px-4 py-3">
          <div className="flex justify-between items-center text-base">
            <div className="text-white/90">Task {currentTaskIndex + 1} of {examData.tasks.length}</div>
            <div className={`font-bold ${timeRemaining < 300 ? 'text-red-300' : 'text-white'}`}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            
            {/* Task Instructions Panel */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 overflow-y-auto">
              {/* Task Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-white">
                    {currentTask?.taskTitle}
                  </h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${levelStyling.primary} text-white`}>
                    {examData.examLevel.replace('_', ' ')}
                  </span>
                </div>
                
                {/* Word Count Requirement */}
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="material-icons text-yellow-300">edit</span>
                    <span className="text-white font-medium text-lg">Word Count Requirement</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-300">
                    {getWordCountRequirement()} words
                  </div>
                </div>
              </div>
              
              {/* Dynamic Content Based on Task Structure */}
              
              {/* A2/B1 Scenario */}
              {currentTask?.scenario && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                    <span className="material-icons text-blue-300 mr-2">info</span>
                    Scenario
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4 text-white leading-relaxed text-lg">
                    {currentTask.scenario}
                  </div>
                </div>
              )}
              
              {/* B1 Scenario Context */}
              {currentTask?.scenarioContext && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                    <span className="material-icons text-blue-300 mr-2">info</span>
                    Context
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4 text-white leading-relaxed text-lg">
                    {currentTask.scenarioContext}
                  </div>
                </div>
              )}
              
              {/* B1 Email Input */}
              {currentTask?.emailInput && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                    <span className="material-icons text-cyan-300 mr-2">email</span>
                    Email Input
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4 text-white leading-relaxed text-lg whitespace-pre-line">
                    {currentTask.emailInput}
                  </div>
                </div>
              )}
              
              {/* A2 Story Prompt */}
              {currentTask?.storyPrompt && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                    <span className="material-icons text-purple-300 mr-2">auto_stories</span>
                    Story Prompt
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4 text-white leading-relaxed whitespace-pre-line text-lg">
                    {currentTask.storyPrompt}
                  </div>
                </div>
              )}
              
              {/* A2 Points to Include */}
              {currentTask?.pointsToInclude && currentTask.pointsToInclude.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                    <span className="material-icons text-green-300 mr-2">checklist</span>
                    Points to Include
                  </h3>
                  <div className="space-y-2">
                    {currentTask.pointsToInclude.map((point, index) => (
                      <div key={index} className="flex items-start space-x-3 bg-white/5 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full border-2 border-green-300 flex items-center justify-center mt-0.5">
                            <span className="text-green-300 text-sm font-bold">{index + 1}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={pointsChecked[`${currentTaskIndex}-${index}`] || false}
                            onChange={(e) => handlePointCheck(currentTaskIndex, index, e.target.checked)}
                            className="w-4 h-4 text-green-300 bg-white/10 border-green-300 rounded focus:ring-green-300"
                          />
                        </div>
                        <span className="text-white leading-relaxed text-lg">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* B2 Essay Topic Question */}
              {currentTask?.essayTopicQuestion && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                    <span className="material-icons text-indigo-300 mr-2">quiz</span>
                    Essay Question
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4 text-white leading-relaxed text-lg">
                    {currentTask.essayTopicQuestion}
                  </div>
                </div>
              )}
              
              {/* B2 Notes Provided */}
              {currentTask?.notesProvided && currentTask.notesProvided.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                    <span className="material-icons text-yellow-300 mr-2">sticky_note_2</span>
                    Notes Provided
                  </h3>
                  <div className="space-y-2">
                    {currentTask.notesProvided.map((note, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3 text-white leading-relaxed text-lg">
                        • {note}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* C1/C2 Input Texts */}
              {currentTask?.inputTexts && currentTask.inputTexts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                    <span className="material-icons text-teal-300 mr-2">article</span>
                    Input Texts
                  </h3>
                                     <div className="space-y-4">
                     {currentTask.inputTexts.map((text, index) => (
                       <div key={index} className="bg-white/5 rounded-lg p-4">
                         <div className="text-white leading-relaxed text-lg whitespace-pre-line">
                           {text.content}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
              
              {/* Choice Prompt for B1/B2/C1/C2 */}
              {currentTask?.choicePrompt && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                    <span className="material-icons text-pink-300 mr-2">rule</span>
                    Choose Your Task
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4 text-white leading-relaxed text-lg mb-4">
                    {currentTask.choicePrompt}
                  </div>
                  
                                     {/* Options */}
                   {currentTask?.options && (
                     <div className="space-y-3">
                       {currentTask.options.map((option, index) => {
                         const optionKey = option.optionNumber || option.optionLetter;
                         const isSelected = selectedOptions[currentTaskIndex] === optionKey;
                         const isCollapsed = collapsedOptions[`${currentTaskIndex}-${optionKey}`];
                         
                         return (
                           <div 
                             key={index} 
                             className={`bg-white/5 rounded-lg border border-white/20 transition-all duration-300 ${
                               isSelected ? 'scale-105 border-blue-300/50 bg-blue-500/10' : ''
                             }`}
                           >
                             {/* Option Header */}
                             <div className="flex items-center justify-between p-4">
                               <div className="flex items-start space-x-3 flex-1">
                                 <input
                                   type="radio"
                                   name={`task-${currentTaskIndex}-option`}
                                   value={optionKey}
                                   checked={isSelected}
                                   onChange={(e) => handleOptionSelect(currentTaskIndex, optionKey)}
                                   className="mt-1 w-4 h-4 text-blue-300 bg-white/10 border-blue-300 focus:ring-blue-300"
                                 />
                                 <div className="flex-1">
                                   <div className={`font-medium mb-2 ${isSelected ? 'text-blue-300 text-xl' : 'text-white text-lg'}`}>
                                     Option {optionKey}: {option.genre || option.taskGenre}
                                   </div>
                                   
                                   {/* Show basic info even when collapsed */}
                                   {option.constraints?.wordCount && (
                                     <div className="text-sm text-white/60">
                                       Word count: {option.constraints.wordCount}
                                       {option.constraints?.recommendedTimeMinutes && 
                                         ` • ${option.constraints.recommendedTimeMinutes} minutes`
                                       }
                                     </div>
                                   )}
                                 </div>
                               </div>
                               
                               {/* Collapse/Expand Button - only show for unselected options */}
                               {!isSelected && (
                                 <button
                                   onClick={() => toggleOptionCollapse(currentTaskIndex, optionKey)}
                                   className="ml-3 p-1 text-white/60 hover:text-white transition-colors"
                                 >
                                   <span className={`material-icons transition-transform duration-300 ${
                                     isCollapsed ? 'rotate-0' : 'rotate-180'
                                   }`}>
                                     expand_more
                                   </span>
                                 </button>
                               )}
                             </div>
                             
                             {/* Option Details - show if selected or not collapsed */}
                             {(isSelected || !isCollapsed) && (
                               <div className="px-4 pb-4 space-y-2">
                                 {/* B1 Article Title Prompt */}
                                 {option.articleTitlePrompt && (
                                   <div className="text-white/80 text-base">
                                     <strong>Article Title:</strong> {option.articleTitlePrompt}
                                   </div>
                                 )}
                                 
                                 {/* B1 Story Prompt */}
                                 {option.storyPrompt && (
                                   <div className="text-white/80 text-base">
                                     <strong>Story Beginning:</strong> {option.storyPrompt}
                                   </div>
                                 )}
                                 
                                 {/* B2/C1/C2 Scenario */}
                                 {option.scenario && (
                                   <div className="text-white/80 text-base">
                                     <strong>Scenario:</strong> {option.scenario}
                                   </div>
                                 )}
                                 
                                 {/* Writing Prompt */}
                                 {option.writingPrompt && (
                                   <div className="text-white/80 text-base">
                                     {option.writingPrompt}
                                   </div>
                                 )}
                               </div>
                             )}
                           </div>
                         );
                       })}
                     </div>
                   )}
                </div>
              )}
              
              {/* Writing Prompt */}
              {currentTask?.writingPrompt && currentTask.writingPrompt !== "[MISSING_OR_UNFILLED_WRITING_PROMPT]" && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                    <span className="material-icons text-orange-300 mr-2">assignment</span>
                    Instructions
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4 text-white leading-relaxed text-lg">
                    {currentTask.writingPrompt}
                  </div>
                </div>
              )}
              
              {/* Guidance (B2/C1/C2) */}
              {currentTask?.constraints?.guidance && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                    <span className="material-icons text-amber-300 mr-2">lightbulb</span>
                    Guidance
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4 text-white leading-relaxed text-lg">
                    {currentTask.constraints.guidance}
                  </div>
                </div>
              )}
              
              {/* Recommended Time (C1) */}
              {currentTask?.constraints?.recommendedTimeMinutes && (
                <div className="mb-6">
                  <div className="bg-blue-500/10 border border-blue-300/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className="material-icons text-blue-300">schedule</span>
                      <span className="text-white font-medium text-lg">
                        Recommended Time: {currentTask.constraints.recommendedTimeMinutes} minutes
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Writing Area Panel */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 flex flex-col">
              {/* Writing Area Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">Your Response</h3>
                <div className="flex items-center space-x-4">
                  {/* Auto-save Status */}
                  <div className="flex items-center space-x-2 text-base">
                    <span className="material-icons text-green-300 text-xl">
                      {autoSaveStatus === 'saving...' ? 'sync' : 'cloud_done'}
                    </span>
                    <span className="text-white/80">{autoSaveStatus}</span>
                  </div>
                  
                  {/* Word Counter */}
                  <div className="bg-white/10 rounded-lg px-3 py-2">
                    <div className="text-base text-white/70">Words</div>
                    <div className={`text-xl font-bold ${getWordCountColor()}`}>
                      {getCurrentWordCount()}
                    </div>
                    {(() => {
                      const selectedOption = selectedOptions[currentTaskIndex];
                      let wordCountTarget = null;
                      
                      if (selectedOption && currentTask?.options) {
                        const option = currentTask.options.find(opt => 
                          opt.optionNumber === selectedOption || opt.optionLetter === selectedOption
                        );
                        wordCountTarget = option?.constraints?.wordCount;
                      } else {
                        wordCountTarget = currentTask?.constraints?.wordCount;
                      }
                      
                      return wordCountTarget && (
                        <div className="text-sm text-white/60">
                          Target: {wordCountTarget}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              {/* Text Editor */}
              <div className="flex-1 relative">
                {/* Choice Required Warning */}
                {currentTask?.options && !selectedOptions[currentTaskIndex] && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <div className="bg-yellow-500/20 border border-yellow-300/50 rounded-lg p-6 text-center max-w-md">
                      <span className="material-icons text-yellow-300 text-3xl mb-2 block">warning</span>
                      <h4 className="text-white font-semibold text-lg mb-2">Choice Required</h4>
                      <p className="text-white/80">
                        Please select an option from the choices above before you can start writing.
                      </p>
                    </div>
                  </div>
                )}
                
                <textarea
                  ref={textareaRef}
                  value={taskResponses[currentTaskIndex] || ''}
                  onChange={(e) => {
                    // Character limit enforcement (reasonable typing limit)
                    const maxChars = 5000; // Reasonable limit for any task type
                    if (e.target.value.length <= maxChars) {
                      handleTaskResponse(currentTaskIndex, e.target.value);
                    }
                  }}
                  placeholder={
                    currentTask?.options && !selectedOptions[currentTaskIndex] 
                      ? "Please select an option above to start writing..." 
                      : "Start writing your response here..."
                  }
                  disabled={currentTask?.options && !selectedOptions[currentTaskIndex]}
                  className={`w-full h-full bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent text-lg ${
                    currentTask?.options && !selectedOptions[currentTaskIndex] ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{ minHeight: '400px' }}
                  maxLength={5000}
                />
                
                {/* Character count indicator */}
                <div className="absolute bottom-2 right-2 text-sm text-white/70 bg-black/30 px-2 py-1 rounded">
                  {(taskResponses[currentTaskIndex] || '').length}/5000
                </div>
              </div>
              
              {/* Navigation Controls */}
              <div className="space-y-4 mt-6 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentTaskIndex(prev => Math.max(0, prev - 1))}
                    disabled={isFirstTask}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 text-base ${
                      isFirstTask 
                        ? 'bg-white/5 text-white/40 cursor-not-allowed' 
                        : 'bg-white/10 text-white/90 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <span className="material-icons">arrow_back</span>
                    <span className="hidden sm:inline">Previous Task</span>
                  </button>
                  
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex items-center space-x-2 bg-white/10 text-white/90 px-4 py-2 rounded-lg hover:bg-white/20 hover:text-white transition-all duration-300 text-base"
                  >
                    <span className="material-icons">assignment</span>
                    <span className="hidden sm:inline">Review All</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentTaskIndex(prev => Math.min(examData.tasks.length - 1, prev + 1))}
                    disabled={isLastTask}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 text-base ${
                      isLastTask 
                        ? 'bg-white/5 text-white/40 cursor-not-allowed' 
                        : 'bg-white/10 text-white/90 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <span className="hidden sm:inline">Next Task</span>
                    <span className="material-icons">arrow_forward</span>
                  </button>
                </div>
                
                {/* Mobile Submit Button */}
                <button
                  onClick={handleSubmitExam}
                  className="md:hidden w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
                >
                  <span className="material-icons text-lg">send</span>
                  <span className="font-medium">Submit Exam</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Review All Tasks</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <span className="material-icons text-2xl">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
                              {examData.tasks.map((task, index) => {
                const status = getTaskCompletionStatus(index);
                const wordCount = taskResponses[index] ? 
                  taskResponses[index].trim().split(/\s+/).filter(word => word.length > 0).length : 0;
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                      index === currentTaskIndex 
                        ? 'bg-white/20 border-white/40' 
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      setCurrentTaskIndex(index);
                      setShowReviewModal(false);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xl font-semibold text-white">{task.taskTitle}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${
                          status === 'completed' ? 'bg-green-300' :
                          status === 'in-progress' ? 'bg-yellow-300' :
                          'bg-gray-300'
                        }`}></span>
                        <span className="text-base text-white/80">
                          {wordCount} words
                        </span>
                      </div>
                    </div>
                    <div className="text-white/80 text-base">
                      {/* Show word count requirement based on task type */}
                      {selectedOptions[index] && task.options ? (
                        (() => {
                          const option = task.options.find(opt => 
                            opt.optionNumber === selectedOptions[index] || opt.optionLetter === selectedOptions[index]
                          );
                          return option?.constraints?.wordCount ? 
                            `Required: ${option.constraints.wordCount} words` : 
                            'No word count specified';
                        })()
                      ) : (
                        task.constraints?.wordCount ? 
                          `Required: ${task.constraints.wordCount} words` : 
                          'No word count specified'
                      )}
                      
                      {/* Show selected option for choice tasks */}
                      {selectedOptions[index] && task.options && (
                        <div className="text-sm text-white/60 mt-1">
                          Selected: Option {selectedOptions[index]}
                        </div>
                      )}
                      
                      {/* Show if choice is required but not made */}
                      {task.options && !selectedOptions[index] && (
                        <div className="text-sm text-yellow-300 mt-1">
                          ⚠ Please select an option to continue
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between text-base text-white/80">
                <span>Overall Progress</span>
                <span>
                  {examData.tasks.filter((_, index) => getTaskCompletionStatus(index) === 'completed').length} of {examData.tasks.length} completed
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Warning Modal */}
      {showTimeWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 max-w-md w-full">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4">
                <span className="material-icons text-white text-2xl">schedule</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Time Warning
              </h3>
              <p className="text-white/70 mb-6">
                {warningType === '10min' 
                  ? 'You have 10 minutes remaining to complete your exam.'
                  : 'You have 5 minutes remaining to complete your exam.'
                }
              </p>
              <button
                onClick={() => setShowTimeWarning(false)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
              >
                Continue Writing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Review Modal */}
      {showSubmissionReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Review Your Submission</h3>
              <button
                onClick={() => setShowSubmissionReview(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <span className="material-icons text-2xl">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              {examData.tasks.map((task, index) => {
                const response = taskResponses[index] || '';
                const wordCount = response.trim().split(/\s+/).filter(word => word.length > 0).length;
                const status = getTaskCompletionStatus(index);
                
                return (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="material-icons text-blue-400">
                          {getTaskTypeIcon(task.taskType)}
                        </span>
                        <h4 className="text-lg font-semibold text-white">{task.taskTitle}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${
                          status === 'completed' ? 'bg-green-400' :
                          status === 'in-progress' ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`}></span>
                        <span className="text-sm text-white/70">{wordCount} words</span>
                      </div>
                    </div>
                    
                    {/* Show word count and selected option info */}
                    <div className="text-sm text-white/60 mb-3">
                      {selectedOptions[index] && task.options ? (
                        (() => {
                          const option = task.options.find(opt => 
                            opt.optionNumber === selectedOptions[index] || opt.optionLetter === selectedOptions[index]
                          );
                          return (
                            <div>
                              <div>Selected: Option {selectedOptions[index]} - {option?.genre || option?.taskGenre}</div>
                              {option?.constraints?.wordCount && (
                                <div>Required: {option.constraints.wordCount} words</div>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        task.constraints?.wordCount && (
                          <div>Required: {task.constraints.wordCount} words</div>
                        )
                      )}
                    </div>
                    
                    <div className="bg-white/5 rounded p-3 max-h-32 overflow-y-auto">
                      <p className="text-white/80 text-sm leading-relaxed">
                        {response || 'No response provided'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
              <div className="text-sm text-white/70">
                Total words: {Object.values(taskResponses).reduce((total, response) => {
                  return total + (response ? response.trim().split(/\s+/).filter(word => word.length > 0).length : 0);
                }, 0)}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSubmissionReview(false)}
                  className="px-4 py-2 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  Continue Writing
                </button>
                <button
                  onClick={() => setShowConfirmSubmission(true)}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
                >
                  Submit Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmSubmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 max-w-md w-full">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-4">
                <span className="material-icons text-white text-2xl">warning</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {timeRemaining <= 0 ? 'Time Expired' : 'Confirm Submission'}
              </h3>
              <p className="text-white/70 mb-6">
                {timeRemaining <= 0 
                  ? 'Your exam time has expired. Your responses will be submitted automatically.'
                  : 'Are you sure you want to submit your exam? You cannot make changes after submission.'
                }
              </p>
              <div className="flex space-x-3 justify-center">
                {timeRemaining > 0 && (
                  <button
                    onClick={() => setShowConfirmSubmission(false)}
                    className="px-4 py-2 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition-all duration-300"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleFinalSubmission}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
                >
                  {timeRemaining <= 0 ? 'Submit Now' : 'Submit Exam'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Screen */}
      {showSuccessScreen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl mb-6">
                <span className="material-icons text-white text-3xl">check_circle</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Exam Submitted Successfully!
              </h3>
              <p className="text-white/70 mb-8">
                Your Cambridge Writing exam has been submitted. You can review your answers or return to the main menu.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSuccessScreen(false);
                    setShowSubmissionReview(true);
                  }}
                  className="w-full px-6 py-3 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  Review Answers
                </button>
                <button
                  onClick={() => navigate('/cambridge/writing')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                >
                  Return to Main Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CambridgeWritingExam; 