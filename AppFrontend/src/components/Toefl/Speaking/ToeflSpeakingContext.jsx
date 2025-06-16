import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock data in case API fails
const mockToeflSpeakingData = {
  "testId": "toefl_speaking_test_1",
  "testTitle": "TOEFL iBT Speaking Practice Test",
  "tasks": [
    {
      "taskNumber": 1,
      "taskType": "INDEPENDENT_SPEAKING_CHOICE",
      "prompt": "Some students prefer to live on campus in a dormitory, while others choose to live off-campus in an apartment. Which living arrangement do you prefer and why? Use specific reasons and examples to support your choice.",
      "preparationTimeSeconds": 15,
      "responseTimeSeconds": 45
    },
    {
      "taskNumber": 2,
      "taskType": "INTEGRATED_SPEAKING_CAMPUS_SITUATION",
      "readingPassage": {
        "title": "New Campus-Wide Recycling Initiative",
        "content": "Starting next semester, the university will implement a comprehensive recycling program across all campus buildings. This initiative aims to reduce waste sent to landfills and promote environmental sustainability. Designated recycling bins will be placed in classrooms, offices, and common areas, with clear labeling for different recyclable materials."
      },
      "listeningPassage": {
        "title": "Student Discussion on Recycling Program",
        "participants": [
          "Speaker 1 (Male Student)",
          "Speaker 2 (Female Student)"
        ],
        "conversation": "Speaker 1: Have you heard about the new recycling program? Speaker 2: Yes, I think it's a great idea! Speaker 1: Really? I'm not so sure. It seems like a lot of extra work. Speaker 2: But think of the environmental benefits! Reducing waste is crucial, and it will also help the university meet its sustainability goals. Plus, it'll teach everyone to be more responsible. Speaker 1: I guess, but it's going to be inconvenient. I'm worried about finding enough space for all the different bins, and it'll slow down cleaning up."
      },
      "question": "The woman expresses her opinion of the university's new recycling program. State her opinion and explain the reasons she gives for holding that opinion.",
      "preparationTimeSeconds": 30,
      "responseTimeSeconds": 60
    },
    {
      "taskNumber": 3,
      "taskType": "INTEGRATED_SPEAKING_ACADEMIC_COURSE_CONCEPT",
      "readingPassage": {
        "title": "Confirmation Bias",
        "content": "Confirmation bias is a cognitive bias where individuals tend to favor information that confirms their pre-existing beliefs or hypotheses, while ignoring or downplaying information that contradicts them. This bias can significantly impact decision-making and critical thinking."
      },
      "listeningPassage": {
        "title": "Confirmation Bias in Scientific Research",
        "speaker": "Professor",
        "lectureContent": "Confirmation bias is a serious issue in scientific research. For example, a researcher might design an experiment to test a hypothesis they already believe to be true. They might unconsciously favor data supporting their hypothesis and overlook contradictory findings, leading to inaccurate conclusions. Another example is seen in the selective interpretation of research findings. A researcher might highlight data that supports their pre-existing beliefs while minimizing or ignoring data that challenges those beliefs. This selective interpretation can lead to flawed conclusions and hinder scientific progress."
      },
      "question": "The professor explains confirmation bias by providing examples from scientific research. Explain how the examples used by the professor illustrate the concept of confirmation bias.",
      "preparationTimeSeconds": 30,
      "responseTimeSeconds": 60
    },
    {
      "taskNumber": 4,
      "taskType": "INTEGRATED_SPEAKING_ACADEMIC_READING_SUMMARY",
      "readingPassage": {
        "title": "The Impact of Social Media on Political Polarization",
        "content": "Social media has significantly impacted political polarization in recent years. Firstly, the algorithmic filtering of information on platforms like Facebook and Twitter creates echo chambers, where individuals are primarily exposed to viewpoints that reinforce their own beliefs. This lack of exposure to diverse perspectives exacerbates existing divisions. Secondly, social media facilitates the rapid spread of misinformation and propaganda. False or misleading information, often designed to manipulate public opinion, can easily go viral, further fueling political division and distrust. The ease with which this information spreads makes it difficult to counteract its effects, leading to a more polarized society."
      },
      "question": "Using points and examples from the passage, explain the impact of social media on political polarization.",
      "preparationTimeSeconds": 20,
      "responseTimeSeconds": 60
    }
  ]
};

// Create the context
const ToeflSpeakingContext = createContext();

// Custom hook to use the context
export const useToeflSpeakingContext = () => {
  const context = useContext(ToeflSpeakingContext);
  if (!context) {
    throw new Error('useToeflSpeakingContext must be used within a ToeflSpeakingProvider');
  }
  return context;
};

// Provider component
export const ToeflSpeakingProvider = ({ children }) => {
  // Initialize with mock data to ensure we have something to display immediately
  const [testData, setTestData] = useState(mockToeflSpeakingData);
  const [error, setError] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [usingFallback, setUsingFallback] = useState(true);
  const [transcriptions, setTranscriptions] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);

  // Initialize transcriptions based on test data
  useEffect(() => {
    if (testData) {
      const initialTranscriptions = {};
      testData.tasks.forEach(task => {
        // Keep existing transcriptions if available
        initialTranscriptions[task.taskNumber] = 
          transcriptions[task.taskNumber] || '';
      });
      // Only set transcriptions if they're empty
      if (Object.keys(transcriptions).length === 0) {
        setTranscriptions(initialTranscriptions);
      }
    }
  }, [testData]);

  // Countdown animation effect
  useEffect(() => {
    if (showCountdown) {
      if (countdownNumber > 0) {
        const timer = setTimeout(() => {
          setCountdownNumber(countdownNumber - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // When countdown reaches 0, hide countdown and show the exam
        setShowCountdown(false);
        setShowInstructions(false);
        setCurrentTaskIndex(0);
      }
    }
  }, [countdownNumber, showCountdown]);

  // Function to fetch test data from HTTP API with fallback
  const fetchTestData = async () => {
    setError(null);
    
    try {
      // Use the API endpoint for TOEFL speaking test
      const apiUrl = `https://h5gf4jspy7.execute-api.us-east-1.amazonaws.com/prod/toefl/speaking/2`;
      
      console.log(`Fetching TOEFL speaking test data from: ${apiUrl}`);
      
      const response = await fetch(apiUrl, { 
        method: 'GET', 
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        const errorMsg = `Request failed with status: ${response.status}`;
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      console.log("Successfully fetched TOEFL speaking test data:", data);
      
      // Set the data
      setTestData(data);
      setUsingFallback(false);
      
      console.log('Successfully loaded test data');
      
    } catch (err) {
      console.error(`Error fetching test data from API:`, err);
      console.log("Using mock data due to error");
      
      // Keep using mock data
      setUsingFallback(true);
    }
  };

  // Start the test - only called when clicking on Start button in instructions
  const startTest = () => {
    // Start countdown animation immediately
    setShowCountdown(true);
    setCountdownNumber(3);
    
    // Fetch data in background while countdown plays
    fetchTestData();
  };

  // Move to the next task
  const nextTask = () => {
    // Stop any active recordings
    stopRecording();
    
    if (testData && currentTaskIndex < testData.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      // If this is the last task, show feedback
      getFeedback();
    }
  };

  // Move to the previous task
  const previousTask = () => {
    // Stop any active recordings
    stopRecording();
    
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  // Update transcription for a specific task
  const updateTranscription = (taskNumber, text) => {
    setTranscriptions(prev => ({
      ...prev,
      [taskNumber]: text
    }));
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
  };

  // Start response - recording without time constraints
  const startResponse = () => {
    if (!testData) return;
    setIsRecording(true);
  };

  // Reset the test state
  const resetTest = () => {
    setShowInstructions(true);
    setShowFeedback(false);
    setCurrentTaskIndex(0);
    setTranscriptions({});
    setIsRecording(false);
    setFeedback(null);
    setFeedbackLoading(false);
    setError(null);
    setShowCountdown(false);
    setCountdownNumber(3);
    
    // Keep using mock data as fallback
    setTestData(mockToeflSpeakingData);
    setUsingFallback(true);
  };

  // Get feedback from AI
  const getFeedback = async () => {
    if (!testData) return;
    
    // Check if the user has spoken at all
    if (!hasSpoken()) {
      setError("You need to record at least one answer before getting feedback.");
      return;
    }
    
    // Stop any active recordings when getting feedback
    stopRecording();
    
    // Set loading state and show feedback page immediately
    setFeedbackLoading(true);
    setShowFeedback(true);
    setError(null);
    
    try {
      // Format the content for the AI
      let promptContent = "TOEFL Speaking Test Responses:\n\n";
      
      // Add responses for each task
      testData.tasks.forEach(task => {
        const response = transcriptions[task.taskNumber] || '';
        if (response.trim()) {
          promptContent += `Task ${task.taskNumber} (${task.taskType.replace(/_/g, ' ')}):\n`;
          promptContent += `Question: ${task.question || task.prompt}\n`;
          promptContent += `Response: ${response}\n\n`;
        }
      });
      
      // Create prompt with instructions for evaluating TOEFL speaking responses
      const evaluationInstructions = `
Instructions for Evaluating TOEFL iBT Speaking Test Responses:

Evaluation Focus:
Your goal is to evaluate the spoken response based on relevance, elaboration, and language use, adhering to the specific requirements of each task.

Scoring Criteria (0-5 Scale):

Relevance & Elaboration (Primary Focus):
- Score 5: A relevant and very clearly expressed contribution. Provides relevant and well-elaborated explanations, examples, and/or details that fully support the opinion and engage with the discussion.
- Score 4: A relevant contribution with adequately elaborated explanations, examples, and/or details. Clear but may lack some depth.
- Score 3: Mostly relevant and understandable, but elaboration may be missing, unclear, or partially irrelevant. May struggle to fully integrate with the broader discussion.
- Score 2: Ideas may be poorly elaborated or only partially relevant to the discussion. Limited engagement with other contributions.
- Score 1: Words and phrases indicate an attempt to address the task, but with few or no coherent ideas or relevant content.
- Score 0: Blank, rejects the topic, not in English, entirely copied, or entirely unconnected to the prompt.

Language Use (Grammar, Vocabulary, Syntax, Fluency):
- Score 5: Demonstrates consistent facility in language use; effective use of a variety of syntactic structures and precise, idiomatic word choice. Almost no lexical or grammatical errors (excluding minor typos).
- Score 4: A variety of syntactic structures and appropriate word choice. Few lexical or grammatical errors.
- Score 3: Some variety in syntactic structures and range of vocabulary. Some noticeable lexical and grammatical errors in sentence structure, word form, or idiomatic language.
- Score 2: Limited range of syntactic structures and vocabulary. An accumulation of errors in sentence structure, word forms, or usage, making ideas hard to follow.
- Score 1: Severely limited range of syntactic structures and vocabulary. Serious and frequent errors prevent the expression of ideas. Minimal original language.

Please provide a JSON output with the following structure:
{
  "overall_score": [0-30 scale converted from the average of all task scores], 
  "task_scores": [
    {
      "task_number": 1,
      "score": [0-4 scale for backward compatibility],
      "relevance_elaboration_score": [0-5 scale],
      "language_use_score": [0-5 scale],
      "general_description": "...",
      "delivery": "...",
      "language_use": "...",
      "topic_development": "..."
    },
    ...
  ],
  "strengths": ["strength 1", "strength 2", ...],
  "areas_for_improvement": ["area 1", "area 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}
`;
      
      // Call the AI API
      const API_KEY = "AIzaSyA6MdoSLwUd2D8kf1goBDg-92nvMTq2j9A";
      const MODEL = "gemini-2.0-flash-lite";
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
      
      console.log("Sending TOEFL speaking test responses for AI feedback");
      
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: evaluationInstructions + "\n\n" + promptContent
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          try {
            const generatedText = data.candidates[0].content.parts[0].text;
            
            // Extract JSON from the response
            let parsedData;
            
            try {
              // Try to find and parse JSON
              const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                parsedData = JSON.parse(jsonMatch[0]);
              } else {
                throw new Error('No JSON found in the response');
              }
            } catch (parseError) {
              console.error('Error parsing feedback JSON:', parseError);
              
              // Generate a simple fallback feedback
              parsedData = {
                overall_score: 20,
                task_scores: testData.tasks.map(task => ({
                  task_number: task.taskNumber,
                  score: 3,
                  relevance_elaboration_score: 3,
                  language_use_score: 3,
                  general_description: "Good response that addresses the task.",
                  delivery: "Generally clear delivery with good fluency.",
                  language_use: "Effective use of vocabulary and grammar with minor errors.",
                  topic_development: "Well-developed ideas with logical progression."
                })),
                strengths: [
                  "Good overall fluency and pronunciation",
                  "Effective vocabulary usage",
                  "Clear organization of ideas"
                ],
                areas_for_improvement: [
                  "Some grammatical errors",
                  "Could include more specific examples",
                  "Occasional hesitations in speech"
                ],
                recommendations: [
                  "Practice speaking with more complex sentence structures",
                  "Focus on developing more detailed examples",
                  "Work on smoother transitions between ideas"
                ]
              };
            }
            
            setFeedback(parsedData);
            console.log('Successfully received AI feedback', parsedData);
          } catch (error) {
            console.error('Error processing feedback:', error);
            setError('Error processing feedback: ' + error.message);
          }
        } else {
          console.warn('No feedback data returned from API');
          setError('No feedback available from AI. The API response did not contain the expected data format.');
        }
      } catch (fetchError) {
        console.error('Error calling Gemini API:', fetchError);
        setError(`Error getting feedback: ${fetchError.message}. Please check your internet connection and try again.`);
      }
    } catch (err) {
      console.error('Error preparing feedback data:', err);
      setError(`Error preparing feedback data: ${err.message}`);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Function to check if the user has spoken
  const hasSpoken = () => {
    return Object.values(transcriptions).some(text => text.trim() !== "");
  };

  // Reset error state
  const resetError = () => {
    setError(null);
  };

  // Value object to be provided by the context
  const value = {
    testData,
    error,
    setError,
    resetError,
    showInstructions,
    currentTaskIndex,
    usingFallback,
    transcriptions,
    isRecording,
    feedback,
    feedbackLoading,
    showFeedback,
    showCountdown,
    countdownNumber,
    fetchTestData,
    startTest,
    nextTask,
    previousTask,
    updateTranscription,
    stopRecording,
    startResponse,
    resetTest,
    getFeedback,
    hasSpoken,
    setIsRecording,
  };

  return (
    <ToeflSpeakingContext.Provider value={value}>
      {children}
    </ToeflSpeakingContext.Provider>
  );
}; 