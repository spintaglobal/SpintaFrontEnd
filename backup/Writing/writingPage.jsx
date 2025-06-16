import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './writingPage.css';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { generateIeltsPrompt } from './ieltsPrompt';
import FeedbackSummary from './FeedbackSummary';
import { useTimer } from '../../lib/TimerContext';
import TimeUpModal from '../ui/TimeUpModal';
import ExamContainer from '../ui/ExamContainer';

const WritingPage = ({ onBackToStart }) => {
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
  const [fetchingQuestions, setFetchingQuestions] = useState(true);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdownNumber, setCountdownNumber] = useState(3);

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

  // Fetch writing questions from API on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setFetchingQuestions(true);
        console.log("Fetching writing test data...");
        
        // Test ID to fetch
        const testIdToFetch = "writing_gt_1";
        const apiUrl = `https://yeo707lcq4.execute-api.us-east-1.amazonaws.com/writingtest/${testIdToFetch}`;
        
        console.log(`Fetching writing test data from: ${apiUrl}`);
        
        const response = await fetch(apiUrl, { 
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
        console.log("Successfully fetched writing test data:", data);
        
        // Transform API response to match our expected question format
        const transformedQuestions = data.tasks.map(task => {
          // For task 1 (Letter writing or similar)
          if (task.taskNumber === 1) {
            return {
              type: 'task1',
              taskType: task.taskType,
              situation: task.situation,
              instructions: task.instructions,
              bulletPoints: task.bulletPoints || [],
              text: task.situation // The main question text for task1
            };
          } 
          // For task 2 (Essay writing)
          else {
            return {
              type: 'task2',
              taskType: task.taskType,
              text: task.prompt // The main question text for task2
            };
          }
        });
        
        setWritingQuestions(transformedQuestions);
      } catch (error) {
        console.error("Error fetching writing questions:", error);
        // Fallback to default questions if API fails
        setWritingQuestions([
          {
            type: "task1",
            text: "The graph below shows the population changes in a certain country from 1950 to 2050. Summarize the information by selecting and reporting the main features, and make comparisons where relevant."
          },
          {
            type: "task2",
            text: "Some people believe that universities should focus on providing academic skills rather than preparing students for employment. To what extent do you agree or disagree?"
          }
        ]);
      } finally {
        setFetchingQuestions(false);
      }
    };
    
    fetchQuestions();
  }, []);

  // Countdown animation effect
  useEffect(() => {
    if (showCountdown && !fetchingQuestions) {
      if (countdownNumber > 0) {
        const timer = setTimeout(() => {
          setCountdownNumber(countdownNumber - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // When countdown reaches 0, hide countdown and show the exam
        setShowCountdown(false);
      }
    }
  }, [countdownNumber, showCountdown, fetchingQuestions]);

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

  // Make the API request to DeepSeek for both tasks
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
        task2Response
      );
      
      console.log("Sending request to DeepSeek API for feedback generation...");

      // Make the API request to DeepSeek
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-44f37e518ea04bf893bfa6083a78c4fb'
        },
        body: JSON.stringify({
          model: "deepseek-reasoner",
          messages: [
            { role: "system", content: "You are an IELTS writing evaluator." },
            { role: "user", content: combinedPrompt }
          ],
          temperature: 0.7,
          max_tokens: 3000
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error("DeepSeek API error response:", errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Unexpected response format from DeepSeek API:", data);
        throw new Error("Received invalid response format from the AI service.");
      }
      
      const assistantMessage = data.choices[0].message.content;
      console.log("Successfully received feedback from DeepSeek API");
      
      // Extract JSON from the response with improved error handling
      let parsedFeedback;
      try {
        // First attempt: Try to extract JSON from markdown code blocks (```json ... ```)
        const jsonMatch = assistantMessage.match(/```json\n([\s\S]*?)\n```/);
        
        if (jsonMatch && jsonMatch[1]) {
          const jsonText = jsonMatch[1];
          try {
            // Attempt to parse the extracted JSON
            parsedFeedback = JSON.parse(jsonText);
          } catch (jsonError) {
            console.error("Error parsing JSON extracted from markdown block, attempting to repair:", jsonError);
            
            // Attempt to fix common JSON formatting issues
            let sanitizedJson = jsonText
              // Fix unquoted property names
              .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
              // Fix single quotes used instead of double quotes
              .replace(/'/g, '"')
              // Fix trailing commas in arrays/objects
              .replace(/,(\s*[}\]])/g, '$1');
            
            try {
              parsedFeedback = JSON.parse(sanitizedJson);
              console.log("Successfully repaired and parsed JSON");
            } catch (repairError) {
              // If still fails, try a more aggressive approach
              console.error("Failed to repair JSON with first attempt, trying more aggressive repair:", repairError);
              
              // Extract what appears to be the JSON structure and try to rebuild it
              // This creates a minimal valid structure even if some data is lost
              const fallbackData = createFallbackFeedback(jsonText);
              parsedFeedback = fallbackData;
            }
          }
        } else {
          // Second attempt: Try to find JSON without code blocks (sometimes APIs return raw JSON)
          console.log("No JSON code block found, searching for raw JSON in response");
          
          // Try to extract anything that looks like JSON object
          const possibleJson = assistantMessage.match(/(\{[\s\S]*\})/);
          
          if (possibleJson && possibleJson[1]) {
            try {
              parsedFeedback = JSON.parse(possibleJson[1]);
            } catch (rawJsonError) {
              console.error("Failed to parse raw JSON from response:", rawJsonError);
              throw new Error("Failed to parse AI feedback: Invalid JSON structure");
            }
          } else {
            console.error("No valid JSON structure found in response");
            throw new Error("Failed to extract JSON from API response");
          }
        }
      } catch (e) {
        console.error("Failed to parse JSON from API response:", e);
        
        // Use fallback feedback as a last resort
        console.log("Using fallback feedback due to parsing error");
        parsedFeedback = generateFallbackFeedback();
      }
      
      // Function to create fallback feedback data when JSON parsing fails
      function createFallbackFeedback(partialJson) {
        console.log("Creating fallback feedback from partial data");
        try {
          // Extract score values if present
          const task1Score = parseFloat(partialJson.match(/"overall_score"\s*:\s*"?([0-9.]+)"?/)?.[1] || "6.5");
          const task2Score = parseFloat(partialJson.match(/"task2"[\s\S]*?"overall_score"\s*:\s*"?([0-9.]+)"?/)?.[1] || "7.0");
          const finalScore = (task1Score * 0.333 + task2Score * 0.667).toFixed(1);
          
          return {
            task1: {
              overallScore: task1Score,
              categories: {
                taskAchievement: { score: 6.5, percentage: 65, comments: ["Addresses the task appropriately"] },
                coherenceCohesion: { score: 6.5, percentage: 65, comments: ["Logical organization of information"] },
                lexicalResource: { score: 6.5, percentage: 65, comments: ["Uses adequate range of vocabulary"] },
                grammaticalRange: { score: 6.5, percentage: 65, comments: ["Uses a mix of simple and complex sentences"] }
              },
              strengths: ["Clear structure", "Appropriate response to the task"],
              improvements: ["Consider using more varied vocabulary", "Pay attention to complex grammatical structures"]
            },
            task2: {
              overallScore: task2Score,
              categories: {
                taskAchievement: { score: 7.0, percentage: 70, comments: ["Addresses all parts of the task"] },
                coherenceCohesion: { score: 7.0, percentage: 70, comments: ["Logical progression of ideas"] },
                lexicalResource: { score: 7.0, percentage: 70, comments: ["Uses a range of vocabulary with flexibility"] },
                grammaticalRange: { score: 7.0, percentage: 70, comments: ["Uses a variety of complex structures"] }
              },
              strengths: ["Well-developed response", "Clear position throughout"],
              improvements: ["Minor grammatical errors in complex sentences", "Further examples would strengthen arguments"]
            },
            finalScore: parseFloat(finalScore),
            overallFeedback: "This is a partially generated feedback due to processing issues. Your writing demonstrates good understanding of the IELTS tasks."
          };
        } catch (error) {
          console.error("Error creating fallback feedback from partial data:", error);
          return generateFallbackFeedback();
        }
      }
      
      // Function to generate basic fallback feedback when all else fails
      function generateFallbackFeedback() {
        return {
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
      }
      
      // Transform the API response to match our feedback format
      const transformedFeedback = {
        task1: {
          overallScore: parseFloat(parsedFeedback.task1.overall_score),
          categories: {
            taskAchievement: {
              score: parseFloat(parsedFeedback.task1.criterion_scores.task_achievement_response.score),
              percentage: parseFloat(parsedFeedback.task1.criterion_scores.task_achievement_response.score) * 10,
              comments: parsedFeedback.task1.criterion_scores.task_achievement_response.feedback_points || []
            },
            coherenceCohesion: {
              score: parseFloat(parsedFeedback.task1.criterion_scores.coherence_cohesion.score),
              percentage: parseFloat(parsedFeedback.task1.criterion_scores.coherence_cohesion.score) * 10,
              comments: parsedFeedback.task1.criterion_scores.coherence_cohesion.feedback_points || []
            },
            lexicalResource: {
              score: parseFloat(parsedFeedback.task1.criterion_scores.lexical_resource.score),
              percentage: parseFloat(parsedFeedback.task1.criterion_scores.lexical_resource.score) * 10,
              comments: parsedFeedback.task1.criterion_scores.lexical_resource.feedback_points || []
            },
            grammaticalRange: {
              score: parseFloat(parsedFeedback.task1.criterion_scores.grammatical_range_accuracy.score),
              percentage: parseFloat(parsedFeedback.task1.criterion_scores.grammatical_range_accuracy.score) * 10,
              comments: parsedFeedback.task1.criterion_scores.grammatical_range_accuracy.feedback_points || []
            }
          },
          strengths: parsedFeedback.task1.strengths || [],
          improvements: parsedFeedback.task1.improvements || []
        },
        task2: {
          overallScore: parseFloat(parsedFeedback.task2.overall_score),
          categories: {
            taskAchievement: {
              score: parseFloat(parsedFeedback.task2.criterion_scores.task_achievement_response.score),
              percentage: parseFloat(parsedFeedback.task2.criterion_scores.task_achievement_response.score) * 10,
              comments: parsedFeedback.task2.criterion_scores.task_achievement_response.feedback_points || []
            },
            coherenceCohesion: {
              score: parseFloat(parsedFeedback.task2.criterion_scores.coherence_cohesion.score),
              percentage: parseFloat(parsedFeedback.task2.criterion_scores.coherence_cohesion.score) * 10,
              comments: parsedFeedback.task2.criterion_scores.coherence_cohesion.feedback_points || []
            },
            lexicalResource: {
              score: parseFloat(parsedFeedback.task2.criterion_scores.lexical_resource.score),
              percentage: parseFloat(parsedFeedback.task2.criterion_scores.lexical_resource.score) * 10,
              comments: parsedFeedback.task2.criterion_scores.lexical_resource.feedback_points || []
            },
            grammaticalRange: {
              score: parseFloat(parsedFeedback.task2.criterion_scores.grammatical_range_accuracy.score),
              percentage: parseFloat(parsedFeedback.task2.criterion_scores.grammatical_range_accuracy.score) * 10,
              comments: parsedFeedback.task2.criterion_scores.grammatical_range_accuracy.feedback_points || []
            }
          },
          strengths: parsedFeedback.task2.strengths || [],
          improvements: parsedFeedback.task2.improvements || []
        },
        finalScore: parseFloat(parsedFeedback.final_score),
        overallFeedback: parsedFeedback.overall_feedback || "Thank you for your submission. Please review the detailed feedback for areas of strength and improvement."
      };

      setFeedback(transformedFeedback);
      setIsLoading(false);
      setShowFeedback(true);
    } catch (error) {
      console.error("Error generating AI feedback:", error);
      alert("Failed to generate AI feedback. Please try again later.");
      setIsLoading(false);
      
      // Fallback to simulated feedback if API fails
      const fallbackFeedback = {
        task1: {
          overallScore: 6.5,
          categories: {
            taskAchievement: {
              score: 7,
              percentage: 70,
              comments: [
                "You've addressed all parts of the task prompt",
                "Your main ideas are relevant and well-developed",
                "You've provided specific examples to support your arguments",
                "Your response is the appropriate length for the task"
              ]
            },
            coherenceCohesion: {
              score: 6,
              percentage: 60,
              comments: [
                "Your paragraphing is logical and appropriate",
                "You use a range of cohesive devices effectively",
                "Ideas flow naturally from one to the next",
                "Your introduction and conclusion are well-structured"
              ]
            },
            lexicalResource: {
              score: 6,
              percentage: 60,
              comments: [
                "You demonstrate a good vocabulary range appropriate to the topic",
                "You use some less common vocabulary items",
                "Word forms and collocations are generally accurate",
                "You effectively paraphrase to avoid repetition"
              ]
            },
            grammaticalRange: {
              score: 7,
              percentage: 70,
              comments: [
                "You use a mix of simple and complex sentence structures",
                "Your grammar is generally accurate with only minor errors",
                "Punctuation is used correctly throughout",
                "You demonstrate control of complex grammatical forms"
              ]
            }
          },
          strengths: [
            "Clear overall structure with introduction, body paragraphs, and conclusion",
            "Good use of linking words to connect ideas",
            "Relevant examples to support main points"
          ],
          improvements: [
            "More varied vocabulary would enhance the response",
            "Some grammatical errors in complex sentences",
            "More detailed analysis of the data would improve the response"
          ]
        },
        task2: {
          overallScore: 7.0,
          categories: {
            taskAchievement: {
              score: 7,
              percentage: 70,
              comments: [
                "You've addressed all parts of the task prompt",
                "Your main ideas are relevant and well-developed",
                "Your position is clear and consistent throughout",
                "You've provided specific examples to support your arguments"
              ]
            },
            coherenceCohesion: {
              score: 7,
              percentage: 70,
              comments: [
                "Your paragraphing is logical and appropriate",
                "You use a range of cohesive devices effectively",
                "Ideas flow naturally from one to the next",
                "Your introduction and conclusion are well-structured"
              ]
            },
            lexicalResource: {
              score: 7,
              percentage: 70,
              comments: [
                "You demonstrate a wide vocabulary range appropriate to the topic",
                "You use less common vocabulary items with precision",
                "Word forms and collocations are generally accurate",
                "You effectively paraphrase to avoid repetition"
              ]
            },
            grammaticalRange: {
              score: 7,
              percentage: 70,
              comments: [
                "You use a mix of simple and complex sentence structures",
                "Your grammar is generally accurate with only minor errors",
                "Punctuation is used correctly throughout",
                "You demonstrate control of complex grammatical forms"
              ]
            }
          },
          strengths: [
            "Clear overall structure with introduction, body paragraphs, and conclusion",
            "Good use of linking words to connect ideas",
            "Relevant examples to support main points"
          ],
          improvements: [
            "More varied vocabulary would enhance the response",
            "Some grammatical errors in complex sentences",
            "Introduction could more clearly state your position",
            "Conclusion could more effectively summarize your arguments"
          ]
        },
        finalScore: 6.8,
        overallFeedback: "API connection failed. This is simulated feedback. Your writing demonstrates understanding of the IELTS writing task requirements. To improve, focus on vocabulary precision and grammar in complex sentences."
      };
      
      setFeedback(fallbackFeedback);
      setIsLoading(false);
      setShowFeedback(true);
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

  // Render the countdown animation
  const renderCountdown = () => {
    // Calculate positions for dots and sparkles
    const getRandomPosition = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
    
    // Create array of dots for the rings
    const createDots = (count) => {
      const dots = [];
      const radius = 110; // Ring radius
      
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        dots.push({ x, y });
      }
      
      return dots;
    };
    
    // Create array of random sparkle positions
    const createSparkles = (count) => {
      const sparkles = [];
      
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = getRandomPosition(60, 160);
        const x = distance * Math.cos(angle);
        const y = distance * Math.sin(angle);
        
        sparkles.push({ x, y });
      }
      
      return sparkles;
    };
    
    const dots = createDots(8);
    const sparkles = createSparkles(6);
    
    return (
      <div className="flex flex-col justify-center items-center h-[600px] text-center">
        {/* Main heading */}
        <h2 className="text-4xl font-bold text-primary-deep mb-12">
          <span className="breath-text">Take a deep breath</span>
        </h2>
        
        {/* Countdown animation container */}
        <div className="countdown-animation">
          {/* Rotating rings with dots */}
          <div className="countdown-ring countdown-ring-1">
            {dots.map((dot, index) => (
              <div 
                key={`dot1-${index}`}
                className="countdown-dot"
                style={{ 
                  left: `calc(50% + ${dot.x}px)`, 
                  top: `calc(50% + ${dot.y}px)`,
                  opacity: 0.8,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>
          
          <div className="countdown-ring countdown-ring-2">
            {dots.map((dot, index) => (
              <div 
                key={`dot2-${index}`}
                className="countdown-dot"
                style={{ 
                  left: `calc(50% + ${dot.x}px)`, 
                  top: `calc(50% + ${dot.y}px)`,
                  opacity: 0.5,
                  transform: 'translate(-50%, -50%) scale(0.7)'
                }}
              />
            ))}
          </div>
          
          {/* Random sparkles */}
          {sparkles.map((sparkle, index) => (
            <div
              key={`sparkle-${index}`}
              className="countdown-sparkle"
              style={{
                left: `calc(50% + ${sparkle.x}px)`,
                top: `calc(50% + ${sparkle.y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
          
          {/* Main countdown number */}
          <div className="countdown-number">
            {countdownNumber > 0 ? countdownNumber : (
              <div className="countdown-go">Go!</div>
            )}
          </div>
        </div>
        
        {/* Message that changes based on countdown state */}
        <div className="countdown-message" style={{ animationDelay: '0.3s' }}>
          {countdownNumber > 0 
            ? "Prepare your thoughts..."
            : "Your exam is ready!"
          }
        </div>
        
        {/* Show arrow icon when countdown finishes */}
        {countdownNumber === 0 && (
          <div className="mt-16" style={{ animation: 'fadeInUp 0.5s ease-out 0.7s both' }}>
            <svg className="w-14 h-14 mx-auto text-primary animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        )}
      </div>
    );
  };

  const renderWritingTask = () => {
    // Show countdown animation if in countdown mode
    if (showCountdown) {
      return renderCountdown();
    }
    
    // If still fetching questions, hide the spinner since we'll handle this with the countdown
    if (fetchingQuestions) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-deep"></div>
          <p className="ml-4 text-lg text-gray-700">Loading questions...</p>
        </div>
      );
    }

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
      <div className="writing-container">
        {showTimeUpModal && <TimeUpModal onSubmit={handleTimeUp} />}
        {showWordCountWarning && renderWordCountWarningModal()}
        
        <div className="mb-8">
          <Button onClick={handleBack} className="back-button mb-4">Back</Button>
          <h2 className="text-2xl font-bold mb-5 text-gray-800">
            {currentTask === 'task1' ? 'Writing Task 1' : 'Writing Task 2'}
          </h2>
          
          {/* Task container with improved styling */}
          <div className="prompt-container bg-white rounded-lg shadow-md mb-6 overflow-hidden p-6">
            {/* Task 1 Content */}
            {currentTask === 'task1' && (
              <>
                {/* Situation */}
                {currentTaskData.situation && (
                  <div className="mb-5">
                    <p className="text-lg text-gray-800 leading-relaxed">{currentTaskData.situation}</p>
                  </div>
                )}
                
                {/* Instructions */}
                {currentTaskData.instructions && (
                  <div className="mb-4">
                    <p className="text-md text-gray-700 font-medium">{currentTaskData.instructions}</p>
                  </div>
                )}
                
                {/* Bullet Points */}
                {currentTaskData.bulletPoints && currentTaskData.bulletPoints.length > 0 && (
                  <div className="mb-4 ml-2">
                    <ul className="space-y-3">
                      {currentTaskData.bulletPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 mr-3 mt-0.5 flex-shrink-0">•</span>
                          <span className="text-gray-700 text-base">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            
            {/* Task 2 Content */}
            {currentTask === 'task2' && (
              <div className="mb-4">
                <p className="text-lg text-gray-800 leading-relaxed">{currentTaskData.text}</p>
              </div>
            )}
            
            {/* Word count information banner at bottom */}
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-700">
                  You should write <span className="font-bold">at least {currentTask === 'task1' ? '150' : '250'} words</span> for this task.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label htmlFor="response" className="block font-medium text-gray-700 text-lg">
                Your Response:
              </label>
              <div className={`word-count px-3 py-1 rounded-full text-sm font-medium ${
                wordCount < (currentTask === 'task1' ? 150 : 250)
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                Word Count: {wordCount} 
                {wordCount < (currentTask === 'task1' ? 150 : 250) && 
                  ` (Minimum: ${currentTask === 'task1' ? 150 : 250})`}
              </div>
            </div>
            <textarea
              id="response"
              className="response-textarea focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={currentTask === 'task1' ? task1Response : task2Response}
              onChange={handleResponseChange}
              placeholder="Write your response here..."
              rows={12}
            />
          </div>
          
          <div className="text-right">
            <Button 
              onClick={handleTaskSubmit} 
              disabled={wordCount < 20 || isLoading}
              className="submit-button bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Generating AI Feedback...' : 
                currentTask === 'task1' ? 'Continue to Task 2' : 'Submit for AI Feedback'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="loading-container">
      <h3 className="loading-title">Analyzing Your IELTS Writing Responses...</h3>
      
      <div className="loading-stages">
        {loadingStages.map((stage, index) => (
          <div key={index} className="loading-stage">
            <div
              className={`stage-circle ${
                index < currentStage ? 'completed' :
                index === currentStage ? 'active' : ''
              }`}
            >
              <span className="stage-number">
                {index < currentStage ? '✓' : stage.number}
              </span>
            </div>
            <span className="stage-name">{stage.name}</span>
          </div>
        ))}
      </div>
      
      <div className="loading-progress">
        <div
          className="progress-fill"
          style={{ width: `${loadingProgress}%` }}
        ></div>
      </div>
      
      <div className="loading-tip">
        <span><strong>IELTS Tip:</strong> {loadingTips[currentTip]}</span>
      </div>
    </div>
  );

  return (
    <ExamContainer>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
    </ExamContainer>
  );
};

export default WritingPage;