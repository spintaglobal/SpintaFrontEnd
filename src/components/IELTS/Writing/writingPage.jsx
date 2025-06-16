import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './writingPage.css';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { generateIeltsPrompt } from './ieltsPrompt';
import FeedbackSummary from './FeedbackSummary';
import { useTimer } from '../../../lib/TimerContext';
import TimeUpModal from "../../ui/TimeUpModal";
import ExamContainer from "../../ui/ExamContainer";
import genAIService from '../../../services/genAIService';
import RefreshTestButton from '../RefreshTestButton';
import { logger } from '../../../utils/globalLogger.js';
import { logProductionError } from '../../../utils/envCheck.js';

const WritingPage = ({ onBackToStart, testType, testData }) => {
  const navigate = useNavigate();
  const [currentTask, setCurrentTask] = useState('task1');
  const [task1Response, setTask1Response] = useState('');
  const [task2Response, setTask2Response] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [showWordCountWarning, setShowWordCountWarning] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState({
    taskAchievement: false,
    coherenceCohesion: false,
    lexicalResource: false,
    grammaticalRange: false
  });
  const [loadingTips, setLoadingTips] = useState([
    "Taking a deep breath before writing can help improve your focus.",
    "Try to use a variety of linking words to improve your coherence score.",
    "IELTS examiners look for a range of grammatical structures.",
    "Writing a clear topic sentence for each paragraph can boost your score.",
    "Remember to support your arguments with specific examples."
  ]);
  const [currentTip, setCurrentTip] = useState(0);
  const [writingQuestions, setWritingQuestions] = useState([]);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Get timer context
  const { startTimer, resetTimer, timeRemaining } = useTimer();

  // Loading stages
  const loadingStages = [
    { number: 1, name: "Analyzing Your Responses" },
    { number: 2, name: "Evaluating Task Achievement" },
    { number: 3, name: "Assessing Language Use" },
    { number: 4, name: "Calculating Scores" },
    { number: 5, name: "Finalizing Feedback" }
  ];

  // Process the testData when component mounts or testData changes
  useEffect(() => {
    if (testData && testData.tasks) {
      const transformedQuestions = testData.tasks.map(task => {
        // For task 1
        if (task.taskNumber === 1) {
          const questionData = {
            type: 'task1',
            taskType: task.taskType,
            text: task.prompt, // Use prompt from task
            testId: testData.testId || 'default'
          };
          
          // Add specific fields based on test type
          if (testType === 'academic') {
            // Academic tests may have imageUrl for visual description tasks
            const imageUrl = testData.imageUrl || task.imageContent || task.typeImage || task.imageUrl;
            
            if (imageUrl && imageUrl.trim() !== '') {
              questionData.imageUrl = imageUrl;
              questionData.hasImage = true;
            } else {
              questionData.hasImage = false;
            }
            
            // Store image description for AI context (separate from imageUrl)
            questionData.imageDescription = task.imageContent || task.imageDescription || null;
            questionData.instructions = task.instructions || "Summarize the information by selecting and reporting the main features, and make comparisons where relevant.";
            questionData.prompt = task.prompt; // Keep the original prompt
          } else {
            // General Training tests have letter writing with situation and bullet points
            questionData.situation = task.situation || task.prompt;
            questionData.instructions = task.instructions;
            questionData.bulletPoints = task.bulletPoints || [];
            questionData.hasImage = false;
          }
          
          return questionData;
        } 
        // For task 2 (Essay writing - similar for both types)
        else if (task.taskNumber === 2) {
          return {
            type: 'task2',
            taskType: task.taskType,
            text: task.prompt,
            testId: testData.testId || 'default'
          };
        }
      }).filter(Boolean); // Remove any undefined entries
      
      setWritingQuestions(transformedQuestions);
      
      // Start the timer immediately when the component loads with data
      startTimer();
    } else {
      // Fallback to default questions if no testData provided
      const fallbackQuestions = testType === 'academic' ? [
        {
          type: "task1",
          text: "The graph below shows the population changes in a certain country from 1950 to 2050. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
          taskType: "Graph Description",
          hasImage: true,
          imageUrl: "https://via.placeholder.com/600x400/3b82f6/ffffff?text=Sample+Chart+for+Academic+Task+1",
          imageDescription: "A line graph showing population changes from 1950 to 2050. The graph displays population in millions on the y-axis and years on the x-axis. The line shows a steady increase from 1950 to 2000, followed by a projected decline from 2000 to 2050. Key data points include: 1950 (25 million), 1980 (45 million), 2000 (60 million), 2020 (55 million), and 2050 (40 million projected).",
          prompt: "The graph below shows the population changes in a certain country from 1950 to 2050. Summarize the information by selecting and reporting the main features, and make comparisons where relevant."
        },
        {
          type: "task2",
          text: "Some people believe that universities should focus on providing academic skills rather than preparing students for employment. To what extent do you agree or disagree?",
          taskType: "Opinion Essay"
        }
      ] : [
        {
          type: "task1",
          text: "You recently bought a piece of equipment for your kitchen but it did not work. You phoned the shop but no action was taken. Write a letter to the shop manager.",
          taskType: "Complaint Letter",
          situation: "You recently bought a piece of equipment for your kitchen but it did not work. You phoned the shop but no action was taken.",
          instructions: "Write a letter to the shop manager. In your letter:",
          bulletPoints: [
            "describe the problem with the equipment",
            "explain what happened when you phoned the shop",
            "say what you would like the manager to do"
          ]
        },
        {
          type: "task2",
          text: "Some people think that parents should teach children how to be good members of society. Others, however, believe that school is the place to learn this. Discuss both these views and give your own opinion.",
          taskType: "Discussion Essay"
        }
      ];
      
      setWritingQuestions(fallbackQuestions);
      startTimer();
    }
  }, [testData, testType, startTimer]);

  // Update word count whenever response changes
  useEffect(() => {
    const currentResponse = currentTask === 'task1' ? task1Response : task2Response;
    const words = currentResponse.trim() ? currentResponse.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [task1Response, task2Response, currentTask]);

  // Rotate through loading tips
  useEffect(() => {
    if (isLoading) {
      const tipInterval = setInterval(() => {
        setCurrentTip(prevTip => (prevTip + 1) % loadingTips.length);
      }, 7500);
      
      return () => clearInterval(tipInterval);
    }
  }, [isLoading, loadingTips.length]);

  // Progress through loading stages and update loading progress
  useEffect(() => {
    if (isLoading) {
      // Reset progress when loading starts
      setLoadingProgress(0);
      
      // Stage duration in milliseconds (7 seconds per stage)
      const stageDuration = 7000;
      const totalDuration = stageDuration * loadingStages.length;
      
      // Update progress every 50ms
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + (100 / (totalDuration / 50));
        });
      }, 50);
      
      // Progress through stages
      const stageInterval = setInterval(() => {
        setCurrentStage(prevStage => {
          // If we're at the last stage, stay there until loading completes
          if (prevStage === loadingStages.length - 1) {
            clearInterval(stageInterval);
            return prevStage;
          }
          return prevStage + 1;
        });
      }, stageDuration); // Each stage takes 4 seconds
      
      return () => {
        clearInterval(progressInterval);
        clearInterval(stageInterval);
      };
    } else {
      setCurrentStage(0);
      setLoadingProgress(0);
    }
  }, [isLoading, loadingStages.length]);

  // Monitor time remaining and show modal when time is up
  useEffect(() => {
    if (timeRemaining === 0 && !showFeedback) {
      setShowTimeUpModal(true);
    }
    
    // Clean up function to reset timer when component unmounts
    return () => {
      if (showFeedback) {
        resetTimer();
      }
    };
  }, [timeRemaining, showFeedback, resetTimer]);
  
  // Handle time up event
  const handleTimeUp = () => {
    setShowTimeUpModal(false);
    generateCombinedFeedback();
  };

  const handleResponseChange = (e) => {
    if (currentTask === 'task1') {
      setTask1Response(e.target.value);
    } else {
      setTask2Response(e.target.value);
    }
  };

  const toggleCategoryExpansion = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Check word count and show warning if needed
  const checkWordCount = () => {
    const minWords = currentTask === 'task1' ? 150 : 250;
    const currentResponse = currentTask === 'task1' ? task1Response : task2Response;
    const words = currentResponse.trim() ? currentResponse.trim().split(/\s+/).length : 0;
    
    // For demo purposes, allow with fewer words but show custom warning
    if (words < minWords && words > 20) {
      setShowWordCountWarning(true);
      return false;
    } else if (words <= 20) {
      alert("Please write at least 20 words to continue.");
      return false;
    }
    
    return true;
  };

  // Handle task submission
  const handleTaskSubmit = () => {
    if (!checkWordCount()) return;
    
    if (currentTask === 'task1') {
      // Move to Task 2
      setCurrentTask('task2');
    } else {
      // Both tasks completed, generate feedback
      generateCombinedFeedback();
    }
  };

  // Make the API request to GenAI for both tasks
  const generateCombinedFeedback = async () => {
    setIsLoading(true);
    setCurrentStage(0);
    setLoadingProgress(0);

    try {
      // Find the questions from our array
      const task1Question = writingQuestions.find(q => q.type === 'task1');
      const task2Question = writingQuestions.find(q => q.type === 'task2');
      
      if (!task1Question || !task2Question) {
        throw new Error("Unable to retrieve task questions. Please refresh and try again.");
      }
      
      // Generate the combined prompt using the imported function
      const combinedPrompt = generateIeltsPrompt(
        task1Question ? (task1Question.situation || task1Question.text) : '',
        task1Response,
        task2Question ? task2Question.text : '',
        task2Response,
        null, // Not using image description anymore
        testType || 'academic' // Pass test type
      );
      
      // Use the GenAI service instead of DeepSeek
      logger.log('Generating IELTS writing feedback...');
      const parsedFeedback = await genAIService.generateIELTSWritingFeedback(combinedPrompt);
      
      // Transform the API response to match our feedback format
      const transformedFeedback = {
        task1: {
          overallScore: parseFloat(parsedFeedback.task1.overall_score),
          categories: {
            taskAchievement: { 
              score: parseFloat(parsedFeedback.task1.criterion_scores.task_achievement_response.score), 
              percentage: Math.round(parseFloat(parsedFeedback.task1.criterion_scores.task_achievement_response.score) * 10), 
              comments: parsedFeedback.task1.criterion_scores.task_achievement_response.feedback_points 
            },
            coherenceCohesion: { 
              score: parseFloat(parsedFeedback.task1.criterion_scores.coherence_cohesion.score), 
              percentage: Math.round(parseFloat(parsedFeedback.task1.criterion_scores.coherence_cohesion.score) * 10), 
              comments: parsedFeedback.task1.criterion_scores.coherence_cohesion.feedback_points 
            },
            lexicalResource: { 
              score: parseFloat(parsedFeedback.task1.criterion_scores.lexical_resource.score), 
              percentage: Math.round(parseFloat(parsedFeedback.task1.criterion_scores.lexical_resource.score) * 10), 
              comments: parsedFeedback.task1.criterion_scores.lexical_resource.feedback_points 
            },
            grammaticalRange: { 
              score: parseFloat(parsedFeedback.task1.criterion_scores.grammatical_range_accuracy.score), 
              percentage: Math.round(parseFloat(parsedFeedback.task1.criterion_scores.grammatical_range_accuracy.score) * 10), 
              comments: parsedFeedback.task1.criterion_scores.grammatical_range_accuracy.feedback_points 
            }
          },
          strengths: parsedFeedback.task1.strengths,
          improvements: parsedFeedback.task1.improvements
        },
        task2: {
          overallScore: parseFloat(parsedFeedback.task2.overall_score),
          categories: {
            taskAchievement: { 
              score: parseFloat(parsedFeedback.task2.criterion_scores.task_achievement_response.score), 
              percentage: Math.round(parseFloat(parsedFeedback.task2.criterion_scores.task_achievement_response.score) * 10), 
              comments: parsedFeedback.task2.criterion_scores.task_achievement_response.feedback_points 
            },
            coherenceCohesion: { 
              score: parseFloat(parsedFeedback.task2.criterion_scores.coherence_cohesion.score), 
              percentage: Math.round(parseFloat(parsedFeedback.task2.criterion_scores.coherence_cohesion.score) * 10), 
              comments: parsedFeedback.task2.criterion_scores.coherence_cohesion.feedback_points 
            },
            lexicalResource: { 
              score: parseFloat(parsedFeedback.task2.criterion_scores.lexical_resource.score), 
              percentage: Math.round(parseFloat(parsedFeedback.task2.criterion_scores.lexical_resource.score) * 10), 
              comments: parsedFeedback.task2.criterion_scores.lexical_resource.feedback_points 
            },
            grammaticalRange: { 
              score: parseFloat(parsedFeedback.task2.criterion_scores.grammatical_range_accuracy.score), 
              percentage: Math.round(parseFloat(parsedFeedback.task2.criterion_scores.grammatical_range_accuracy.score) * 10), 
              comments: parsedFeedback.task2.criterion_scores.grammatical_range_accuracy.feedback_points 
            }
          },
          strengths: parsedFeedback.task2.strengths,
          improvements: parsedFeedback.task2.improvements
        },
        finalScore: parseFloat(parsedFeedback.final_score),
        overallFeedback: parsedFeedback.overall_feedback
      };

      logger.log('Successfully generated and transformed IELTS writing feedback');
      setFeedback(transformedFeedback);
      setShowFeedback(true);
      setIsLoading(false);
    } catch (error) {
      logProductionError('IELTS Writing Feedback Generation', error, {
        hasTask1Question: !!task1Question,
        hasTask2Question: !!task2Question,
        task1ResponseLength: task1Response?.length || 0,
        task2ResponseLength: task2Response?.length || 0,
        testType: testType
      });
      
      // Use fallback feedback on error
      const fallbackFeedback = {
        task1: {
          overallScore: 6.5,
          categories: {
            taskAchievement: { score: 6.5, percentage: 65, comments: ["Addresses the task appropriately", "Covers the main features of the graph/chart", "Presents a clear overview"] },
            coherenceCohesion: { score: 6.5, percentage: 65, comments: ["Information is arranged coherently", "Uses cohesive devices effectively", "Paragraphing is logical"] },
            lexicalResource: { score: 6.5, percentage: 65, comments: ["Uses adequate range of vocabulary", "Makes some errors in word choice/formation", "Generally paraphrases successfully"] },
            grammaticalRange: { score: 6.5, percentage: 65, comments: ["Uses a mix of simple and complex sentences", "Makes some errors but meaning remains clear", "Shows good control of grammar and punctuation"] }
          },
          strengths: ["Clear structure", "Appropriate response to the task", "Effective use of language"],
          improvements: ["Consider using more varied vocabulary", "Pay attention to complex grammatical structures", "Provide more detailed analysis of data"]
        },
        task2: {
          overallScore: 7.0,
          categories: {
            taskAchievement: { score: 7.0, percentage: 70, comments: ["Addresses all parts of the task", "Presents a clear position throughout", "Fully developed response"] },
            coherenceCohesion: { score: 7.0, percentage: 70, comments: ["Logical progression of ideas", "Uses a range of cohesive devices", "Clear central topic in each paragraph"] },
            lexicalResource: { score: 7.0, percentage: 70, comments: ["Uses a range of vocabulary with flexibility", "Uses less common items with some awareness of style", "Makes occasional errors in word choice"] },
            grammaticalRange: { score: 7.0, percentage: 70, comments: ["Uses a variety of complex structures", "Majority of sentences are error-free", "Good control of grammar and punctuation"] }
          },
          strengths: ["Well-developed response", "Clear position throughout", "Good range of vocabulary"],
          improvements: ["Minor grammatical errors in complex sentences", "Further examples would strengthen arguments", "More precise word choice in some instances"]
        },
        finalScore: 6.8,
        overallFeedback: "This is generated feedback as we couldn't process your submission. Your writing demonstrates a good understanding of the IELTS writing task requirements. To improve your score, focus on vocabulary precision and grammar in complex sentences."
      };

      setFeedback(fallbackFeedback);
      setShowFeedback(true);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (showFeedback) {
      setShowFeedback(false);
      setCurrentTask('task1');
      setTask1Response('');
      setTask2Response('');
    } else if (currentTask === 'task2') {
      setCurrentTask('task1');
    } else {
      resetTimer();
      onBackToStart();
    }
  };

  const confirmRefreshTest = async () => {
    setRefreshLoading(true);
    
    try {
      // Reset the timer before generating a new test
      resetTimer();
      
      // Generate a random test number between 1 and 20 for writing tests
      const randomTestNumber = Math.floor(Math.random() * 20) + 1;
      
      // Navigate back to writing home with a flag to load a new test
      navigate(`/ielts/${testType}/writing`, { 
        state: { 
          refreshTest: true,
          testNumber: randomTestNumber
        },
        replace: true
      });
      
    } catch (error) {
      console.error('Error refreshing writing test:', error);
      alert('Failed to load new test. Please try again.');
    } finally {
      setRefreshLoading(false);
    }
  };

  const renderWordCountWarningModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
        <h3 className="text-xl font-bold text-primary-deep mb-4">Word Count Notice</h3>
        <p className="text-dark mb-6">
          Your response has only <span className="font-bold">{wordCount}</span> words. The recommended minimum is <span className="font-bold">{currentTask === 'task1' ? 150 : 250}</span> words. 
          <br /><br />
          Would you like to continue or go back to add more content?
        </p>
        <div className="flex justify-end space-x-4">
          <Button 
            onClick={() => setShowWordCountWarning(false)} 
            className="back-button"
          >
            Continue Writing
          </Button>
          <Button 
            onClick={() => {
              setShowWordCountWarning(false);
              if (currentTask === 'task1') {
                setCurrentTask('task2');
              } else {
                generateCombinedFeedback();
              }
            }} 
            className="submit-button"
          >
            {currentTask === 'task1' ? 'Continue to Task 2' : 'Get Feedback Anyway'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderWritingTask = () => {
    // Find the current task
    const currentTaskData = writingQuestions.find(q => q.type === currentTask);
    
    if (!currentTaskData || writingQuestions.length === 0) {
      return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-600 mb-4 text-center">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p className="text-lg text-gray-600 mb-4">Unable to load questions. Please check your network connection and try again later.</p>
          <Button onClick={handleBack} className="back-button mt-4">Back to Instructions</Button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {showTimeUpModal && <TimeUpModal onSubmit={handleTimeUp} />}
        {showWordCountWarning && renderWordCountWarningModal()}
        
        {/* Header Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-full">
            <div className="flex items-center space-x-4">
              <Button onClick={handleBack} className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                <span className="material-icons text-lg">arrow_back</span>
                <span>Back</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${currentTask === 'task1' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm font-medium ${currentTask === 'task1' ? 'text-blue-600' : 'text-gray-500'}`}>Task 1</span>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className={`w-3 h-3 rounded-full ${currentTask === 'task2' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm font-medium ${currentTask === 'task2' ? 'text-blue-600' : 'text-gray-500'}`}>Task 2</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Test Type Badge */}
              {testType && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  testType === 'academic' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  <span className="material-icons text-sm mr-1">
                    {testType === 'academic' ? 'school' : 'work'}
                  </span>
                  {testType === 'academic' ? 'Academic' : 'General Training'}
                </span>
              )}
              
              {/* Word Count */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                wordCount < (currentTask === 'task1' ? 150 : 250)
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                <span className="material-icons text-sm">text_format</span>
                <span className="text-sm font-medium">
                  {wordCount} / {currentTask === 'task1' ? 150 : 250} words
                </span>
              </div>
              
              {/* Timer would go here if needed */}
            </div>
          </div>
        </div>

        {/* Main Content Area - Split Screen */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Panel - Questions */}
          <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              {/* Task Header */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentTask === 'task1' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    <span className="material-icons text-lg">
                      {currentTask === 'task1' 
                        ? (testType === 'academic' ? 'analytics' : 'mail')
                        : 'edit'
                      }
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      IELTS Writing Task {currentTask === 'task1' ? '1' : '2'}
                    </h2>
                    <p className="text-gray-600">
                      {currentTask === 'task1' 
                        ? (testType === 'academic' 
                            ? 'Describe and analyze visual information' 
                            : 'Write a letter based on the situation')
                        : 'Write an essay response'
                      }
                    </p>
                  </div>
                </div>
                
                {/* Task Requirements */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{currentTask === 'task1' ? '150+' : '250+'}</div>
                    <div className="text-xs text-gray-600">Min Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{currentTask === 'task1' ? '20' : '40'}</div>
                    <div className="text-xs text-gray-600">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{currentTask === 'task1' ? '33%' : '67%'}</div>
                    <div className="text-xs text-gray-600">Weight</div>
                  </div>
                </div>
              </div>

              {/* Task Content */}
              <div className="space-y-6">
                {/* Task 1 Content */}
                {currentTask === 'task1' && (
                  <>
                    {/* Task Prompt - Always show first */}
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="material-icons text-blue-600">
                          {testType === 'academic' ? 'analytics' : 'mail'}
                        </span>
                        <h3 className="font-semibold text-blue-800">
                          {testType === 'academic' ? 'Task Description' : 'Letter Writing Task'}
                        </h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {currentTaskData.prompt || currentTaskData.text}
                      </p>
                    </div>

                    {/* Image Display for Academic Tests - Show after task description */}
                    {currentTaskData.hasImage && currentTaskData.imageUrl && (
                      <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="material-icons text-gray-600">image</span>
                          <h3 className="font-semibold text-gray-800">Visual Data</h3>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            Academic Task 1
                          </span>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <img 
                            src={currentTaskData.imageUrl} 
                            alt="Task 1 Visual Data - Chart/Graph/Diagram" 
                            className="academic-task-image mx-auto block"
                            onLoad={(e) => {
                              e.target.style.display = 'block';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'none';
                              }
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'block';
                              }
                            }}
                          />
                          <div 
                            className="text-center text-gray-500 p-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
                            style={{ display: 'none' }}
                          >
                            <span className="material-icons text-4xl mb-2 text-gray-400">broken_image</span>
                            <p className="font-medium text-gray-600 mb-2">Image could not be loaded</p>
                            <p className="text-xs text-gray-500 break-all">URL: {currentTaskData.imageUrl}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              This may be due to network issues or an invalid image URL.
                            </p>
                          </div>
                        </div>
                        <div className="image-analysis-note">
                          <div className="flex items-start space-x-2">
                            <span className="material-icons text-blue-600 text-sm mt-0.5">info</span>
                            <div className="image-analysis-text">
                              <p className="font-medium mb-1">Analysis Instructions:</p>
                              <p>Carefully examine the visual data above. Describe the main features, trends, and patterns. Make comparisons where relevant and highlight significant changes or differences.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Debug info for Academic Task 1 without image - Compact version */}
                    {testType === 'academic' && currentTask === 'task1' && (!currentTaskData.hasImage || !currentTaskData.imageUrl) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="material-icons text-yellow-600 text-sm">warning</span>
                          <h4 className="font-medium text-yellow-800">No Visual Data Available</h4>
                        </div>
                        <p className="text-sm text-yellow-700 mb-2">
                          This Academic Task 1 question does not include a chart, graph, or diagram.
                        </p>
                        <details className="text-xs text-yellow-600">
                          <summary className="cursor-pointer font-medium">Debug Info</summary>
                          <div className="mt-2 p-2 bg-yellow-100 rounded">
                            <div>hasImage: {String(currentTaskData.hasImage)}</div>
                            <div>imageUrl: {currentTaskData.imageUrl || 'null'}</div>
                            <div>imageDescription: {currentTaskData.imageDescription || 'null'}</div>
                          </div>
                        </details>
                      </div>
                    )}
                    
                    {/* Instructions */}
                    {currentTaskData.instructions && (
                      <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-400">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="material-icons text-amber-600">task_alt</span>
                          <h3 className="font-semibold text-amber-800">Instructions</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed font-medium">{currentTaskData.instructions}</p>
                      </div>
                    )}
                    
                    {/* Situation (for General Training) */}
                    {currentTaskData.situation && testType === 'general-training' && (
                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="material-icons text-green-600">description</span>
                          <h3 className="font-semibold text-green-800">Situation</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{currentTaskData.situation}</p>
                      </div>
                    )}
                    
                    {/* Bullet Points (for General Training) */}
                    {currentTaskData.bulletPoints && currentTaskData.bulletPoints.length > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="material-icons text-yellow-600">format_list_bulleted</span>
                          <h3 className="font-semibold text-yellow-800">Key Points to Address</h3>
                        </div>
                        <ul className="space-y-2">
                          {currentTaskData.bulletPoints.map((point, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-200 text-yellow-800 text-sm font-bold flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <span className="text-gray-700 leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
                
                {/* Task 2 Content */}
                {currentTask === 'task2' && (
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="material-icons text-purple-600">edit</span>
                      <h3 className="font-semibold text-purple-800">Essay Prompt</h3>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed">{currentTaskData.text}</p>
                  </div>
                )}
                
                {/* Writing Tips */}
                <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-400">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="material-icons text-indigo-600">lightbulb</span>
                    <h3 className="font-semibold text-indigo-800">
                      {currentTask === 'task1' 
                        ? (testType === 'academic' ? 'Academic Writing Tips' : 'Letter Writing Tips')
                        : 'Essay Writing Tips'
                      }
                    </h3>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {currentTask === 'task1' ? (
                      testType === 'academic' ? (
                        <>
                          <li>• Focus on key trends, patterns, and significant data points</li>
                          <li>• Use appropriate academic vocabulary and formal language</li>
                          <li>• Make comparisons and highlight contrasts where relevant</li>
                          <li>• Organize information logically with clear paragraphs</li>
                        </>
                      ) : (
                        <>
                          <li>• Use appropriate tone (formal, semi-formal, or informal)</li>
                          <li>• Address all bullet points clearly and completely</li>
                          <li>• Use proper letter format with greeting and closing</li>
                          <li>• Organize your ideas in logical paragraphs</li>
                        </>
                      )
                    ) : (
                      <>
                        <li>• Present a clear position and maintain it throughout</li>
                        <li>• Support your arguments with relevant examples</li>
                        <li>• Use a variety of linking words and phrases</li>
                        <li>• Write a strong introduction and conclusion</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Writing Area */}
          <div className="w-1/2 bg-gray-50 flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              {/* Writing Area Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Response</h3>
                <p className="text-sm text-gray-600">
                  Write your {currentTask === 'task1' 
                    ? (testType === 'academic' ? 'description' : 'letter') 
                    : 'essay'} here. Remember to check your word count and grammar.
                </p>
              </div>
              
              {/* Writing Textarea */}
              <div className="flex-1 flex flex-col">
                <textarea
                  className="flex-1 w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm leading-relaxed"
                  value={currentTask === 'task1' ? task1Response : task2Response}
                  onChange={handleResponseChange}
                  placeholder={`Start writing your ${currentTask === 'task1' 
                    ? (testType === 'academic' ? 'description' : 'letter') 
                    : 'essay'} here...`}
                  style={{ minHeight: '400px' }}
                />
              </div>
            </div>
            
            {/* Bottom Action Bar */}
            <div className="bg-white border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    wordCount < (currentTask === 'task1' ? 150 : 250)
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {wordCount} words
                  </div>
                  
                  {wordCount < (currentTask === 'task1' ? 150 : 250) && (
                    <div className="text-sm text-amber-600">
                      {(currentTask === 'task1' ? 150 : 250) - wordCount} more words needed
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {currentTask === 'task2' && (
                    <Button 
                      onClick={() => setCurrentTask('task1')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      Back to Task 1
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleTaskSubmit} 
                    disabled={wordCount < 20 || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generating Feedback...</span>
                      </>
                    ) : (
                      <>
                        <span>{currentTask === 'task1' ? 'Continue to Task 2' : 'Submit for Feedback'}</span>
                        <span className="material-icons text-lg">
                          {currentTask === 'task1' ? 'arrow_forward' : 'send'}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Test Button - Positioned at top-middle for better visibility */}
        <RefreshTestButton
          testType="writing test"
          isLoading={refreshLoading}
          onRefreshTest={confirmRefreshTest}
          position="top-middle"
          variant="visible"
        />
      </div>
    );
  };

  const renderLoading = () => (
    <div className="enhanced-loading-container">
      <div className="loading-background-animation">
        {/* Floating particles */}
        <div className="particles-container">
          {[...Array(15)].map((_, index) => (
            <div 
              key={`particle-${index}`}
              className="floating-particle"
              style={{ 
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Geometric shapes */}
        <div className="geometric-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="loading-content">
        {/* Header with animated icon */}
        <div className="loading-header">
          <div className="animated-icon-container">
            <span className="material-icons loading-icon">auto_awesome</span>
            <div className="icon-ripple"></div>
          </div>
          <h3 className="loading-title">
            Crafting Your Personalized Feedback
          </h3>
          <p className="loading-subtitle">
            Our AI is analyzing your writing with expert precision
          </p>
        </div>

        {/* Enhanced progress visualization */}
        <div className="progress-visualization">
          <div className="circular-progress">
            <svg className="progress-ring" width="120" height="120">
              <circle 
                className="progress-ring-background"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="transparent"
                r="52"
                cx="60"
                cy="60"
              />
              <circle 
                className="progress-ring-progress"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="transparent"
                r="52"
                cx="60"
                cy="60"
                style={{
                  strokeDasharray: `${2 * Math.PI * 52}`,
                  strokeDashoffset: `${2 * Math.PI * 52 * (1 - loadingProgress / 100)}`
                }}
              />
            </svg>
            <div className="progress-percentage">
              {Math.round(loadingProgress)}%
            </div>
          </div>
        </div>

        {/* Dynamic stages with better animations */}
        <div className="enhanced-loading-stages">
          {loadingStages.map((stage, index) => (
            <div key={index} className={`enhanced-stage ${
              index < currentStage ? 'completed' :
              index === currentStage ? 'active' : 'pending'
            }`}>
              <div className="stage-indicator">
                <div className="stage-circle">
                  {index < currentStage ? (
                    <span className="material-icons stage-check">check</span>
                  ) : index === currentStage ? (
                    <div className="stage-spinner"></div>
                  ) : (
                    <span className="stage-number">{stage.number}</span>
                  )}
                </div>
                {index < loadingStages.length - 1 && (
                  <div className={`stage-connector ${index < currentStage ? 'completed' : ''}`}></div>
                )}
              </div>
              <div className="stage-content">
                <h4 className="stage-title">{stage.name}</h4>
                <p className="stage-description">
                  {index === 0 && "Examining your responses for structure and content"}
                  {index === 1 && "Evaluating how well you addressed the task requirements"}
                  {index === 2 && "Analyzing vocabulary, grammar, and coherence"}
                  {index === 3 && "Computing your band scores across all criteria"}
                  {index === 4 && "Preparing personalized improvement suggestions"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Rotating tips with smooth transitions */}
        <div className="enhanced-loading-tips">
          <div className="tip-container">
            <div className="tip-icon">
              <span className="material-icons">lightbulb</span>
            </div>
            <div className="tip-content">
              <h4>IELTS Writing Tip</h4>
              <p className="tip-text">{loadingTips[currentTip]}</p>
            </div>
          </div>
        </div>

        {/* Motivational message */}
        <div className="motivation-message">
          <p>✨ Great job completing your writing test! Your detailed feedback is almost ready.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-none">
      <div className="w-full max-w-none">
        {isLoading
          ? renderLoading()
          : showFeedback
            ? <FeedbackSummary
                feedback={feedback}
                onBack={() => {
                  setShowFeedback(false);
                  setCurrentTask('task1');
                  setTask1Response('');
                  setTask2Response('');
                }}
              />
            : renderWritingTask()
        }
      </div>
    </div>
  );
};

export default WritingPage;