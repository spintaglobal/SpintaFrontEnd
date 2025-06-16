import React, { createContext, useContext, useState, useEffect } from 'react';

const ToeflReadingContext = createContext();

export const useToeflReadingContext = () => {
  const context = useContext(ToeflReadingContext);
  if (!context) {
    throw new Error('useToeflReadingContext must be used within a ToeflReadingProvider');
  }
  return context;
};

export const ToeflReadingProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentPassage, setCurrentPassage] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [passages, setPassages] = useState([]);
  const [testData, setTestData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(35 * 60); // 35 minutes in seconds
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (testStarted && !testCompleted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setTestCompleted(true);
            setShowFeedback(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      setTestCompleted(true);
      setShowFeedback(true);
    }
    return () => clearInterval(interval);
  }, [testStarted, testCompleted, timeRemaining]);

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
        setTestStarted(true);
      }
    }
  }, [countdownNumber, showCountdown]);

  // Transform API options format to simple array
  const transformOptions = (apiOptions) => {
    if (!apiOptions || !Array.isArray(apiOptions)) {
      console.warn('Invalid or missing options data:', apiOptions);
      return [];
    }
    
    return apiOptions.map(option => {
      if (!option || typeof option !== 'object') {
        console.warn('Invalid option format:', option);
        return '';
      }
      const key = Object.keys(option)[0];
      return key ? option[key] : '';
    });
  };

  // Transform API data to internal format
  const transformApiData = (apiData) => {
    if (!apiData || !apiData.passages || !Array.isArray(apiData.passages)) {
      console.error('Invalid API data structure:', apiData);
      throw new Error('Invalid API response structure');
    }

    return apiData.passages.map((passage, passageIndex) => {
      if (!passage) {
        console.error('Invalid passage data:', passage);
        return null;
      }

      return {
        id: passageIndex + 1,
        passageNumber: passage.passageNumber || passageIndex + 1,
        title: passage.passageTitle || `Passage ${passageIndex + 1}`,
        text: passage.passageText || '',
        questions: (passage.questions || []).map(question => {
          if (!question) {
            console.warn('Invalid question data:', question);
            return null;
          }

          return {
            id: `p${passageIndex + 1}_q${question.questionNumber || 1}`,
            questionNumber: question.questionNumber || 1,
            type: question.questionType || 'FACTUAL_INFORMATION',
            question: question.questionText || '',
            options: question.questionType === 'FILL_IN_A_TABLE' 
              ? [] // FILL_IN_A_TABLE questions don't have options
              : transformOptions(question.options),
            correctAnswer: question.correctAnswer || 'A',
            paragraphReference: question.paragraphReference,
            // Additional fields for special question types
            targetWord: question.targetWord,
            sentenceToHighlight: question.sentenceToHighlight,
            sentenceToInsert: question.sentenceToInsert,
            tableCategories: question.tableCategories || [],
            statementsToCategorize: question.statementsToCategorize || [],
            correctMapping: question.correctMapping || {}
          };
        }).filter(q => q !== null) // Remove any null questions
      };
    }).filter(p => p !== null); // Remove any null passages
  };

  const startTest = async () => {
    setError(null);
    
    // Start countdown animation immediately
    setShowCountdown(true);
    setCountdownNumber(3);
    
    // Fetch data in background while countdown plays
    try {
      const response = await fetch('https://h5gf4jspy7.execute-api.us-east-1.amazonaws.com/prod/toefl/reading/1');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiData = await response.json();
      console.log('Raw API Response:', JSON.stringify(apiData, null, 2));
      
      // Validate basic API structure
      if (!apiData) {
        throw new Error('Empty response from server');
      }
      
      if (!apiData.passages) {
        console.error('API response missing passages field:', apiData);
        throw new Error('Invalid API response: missing passages');
      }
      
      if (!Array.isArray(apiData.passages)) {
        console.error('API passages is not an array:', typeof apiData.passages, apiData.passages);
        throw new Error('Invalid API response: passages should be an array');
      }
      
      if (apiData.passages.length === 0) {
        throw new Error('No passages found in API response');
      }
      
      // Transform the API data
      const transformedPassages = transformApiData(apiData);
      console.log('Transformed passages:', transformedPassages);
      
      if (!transformedPassages || transformedPassages.length === 0) {
        throw new Error('No valid passages after transformation');
      }
      
      setTestData(apiData);
      setPassages(transformedPassages);
      setTimeRemaining((apiData.estimatedTimeMinutes || 35) * 60);
      setUsingFallback(false);
      
    } catch (err) {
      console.error('Error loading test:', err);
      console.error('Error stack:', err.stack);
      
      // Fallback to mock data if API fails
      try {
        // Enhanced mock data for fallback
        const mockData = {
          testId: "toefl_reading_test_mock",
          testTitle: "TOEFL iBT Reading Practice Test",
          estimatedTimeMinutes: 35,
          passages: [
            {
              passageNumber: 1,
              passageTitle: "The Evolution of Urban Planning",
              passageText: "Urban planning has undergone significant transformations throughout history. Initially, cities developed organically without formal planning, but as populations grew, the need for systematic organization became apparent.\n\nThe industrial revolution marked a turning point in urban development. Cities experienced rapid growth as people migrated from rural areas seeking employment in factories. This migration led to overcrowding, poor sanitation, and inadequate housing conditions. Urban planners began to recognize the importance of designing cities that could accommodate large populations while maintaining livability.\n\nModern urban planning incorporates principles of sustainability, accessibility, and community well-being. Planners now consider factors such as environmental impact, transportation networks, and social equity when designing urban spaces. The integration of green spaces, efficient public transportation, and mixed-use developments has become central to contemporary urban planning philosophy.",
              questions: [
                {
                  questionNumber: 1,
                  questionType: "FACTUAL_INFORMATION",
                  questionText: "According to the passage, what was the primary factor that led to the development of systematic urban planning?",
                  options: [
                    {"A": "The industrial revolution"},
                    {"B": "Population growth"},
                    {"C": "Environmental concerns"},
                    {"D": "Transportation needs"}
                  ],
                  correctAnswer: "B",
                  paragraphReference: 1
                },
                {
                  questionNumber: 2,
                  questionType: "VOCABULARY", 
                  questionText: "The word 'livability' in paragraph 2 is closest in meaning to:",
                  options: [
                    {"A": "affordability"},
                    {"B": "accessibility"},
                    {"C": "habitability"},
                    {"D": "sustainability"}
                  ],
                  correctAnswer: "C",
                  targetWord: "livability",
                  paragraphReference: 2
                },
                {
                  questionNumber: 3,
                  questionType: "INFERENCE",
                  questionText: "What can be inferred about cities before the industrial revolution?",
                  options: [
                    {"A": "They were carefully planned"},
                    {"B": "They grew without formal organization"},
                    {"C": "They had excellent transportation"},
                    {"D": "They were environmentally sustainable"}
                  ],
                  correctAnswer: "B",
                  paragraphReference: 1
                }
              ]
            }
          ]
        };
        
        console.log('Using fallback mock data:', mockData);
        const transformedMockPassages = transformApiData(mockData);
        setTestData(mockData);
        setPassages(transformedMockPassages);
        setTimeRemaining(35 * 60);
        setUsingFallback(true);
        
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        setError(`Failed to load test data. Original error: ${err.message}. Fallback error: ${fallbackErr.message}`);
        setShowCountdown(false);
      }
    }
  };

  const submitAnswer = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const navigateToQuestion = (passageIndex, questionIndex) => {
    setCurrentPassage(passageIndex);
    setCurrentQuestion(questionIndex);
  };

  const nextQuestion = () => {
    const currentPassageQuestions = passages[currentPassage]?.questions || [];
    if (currentQuestion < currentPassageQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentPassage < passages.length - 1) {
      setCurrentPassage(currentPassage + 1);
      setCurrentQuestion(0);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentPassage > 0) {
      setCurrentPassage(currentPassage - 1);
      const prevPassageQuestions = passages[currentPassage - 1]?.questions || [];
      setCurrentQuestion(prevPassageQuestions.length - 1);
    }
  };

  const finishTest = () => {
    setTestCompleted(true);
    setTestStarted(false);
    setShowFeedback(true);
  };

  const resetTest = () => {
    setError(null);
    setShowInstructions(true);
    setShowFeedback(false);
    setCurrentPassage(0);
    setCurrentQuestion(0);
    setUserAnswers({});
    setPassages([]);
    setTestData(null);
    setTimeRemaining(35 * 60);
    setTestStarted(false);
    setTestCompleted(false);
    setUsingFallback(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Helper function to get the correct answer format for scoring
  const getCorrectAnswerForScoring = (question) => {
    if (question.type === 'FILL_IN_A_TABLE') {
      // For table questions, the correct answers are in statementsToCategorize
      return question.statementsToCategorize || [];
    }
    
    if (question.type === 'PROSE_SUMMARY') {
      return question.correctAnswer; // Array or complex object
    }
    
    // For most question types, convert letter to index
    if (typeof question.correctAnswer === 'string') {
      return question.correctAnswer.charCodeAt(0) - 65; // Convert A=0, B=1, etc.
    }
    
    return question.correctAnswer;
  };

  const value = {
    error,
    showInstructions,
    showFeedback,
    currentPassage,
    currentQuestion,
    userAnswers,
    passages,
    testData,
    timeRemaining,
    testStarted,
    testCompleted,
    usingFallback,
    showCountdown,
    countdownNumber,
    startTest,
    submitAnswer,
    navigateToQuestion,
    nextQuestion,
    previousQuestion,
    finishTest,
    resetTest,
    formatTime,
    getCorrectAnswerForScoring
  };

  return (
    <ToeflReadingContext.Provider value={value}>
      {children}
    </ToeflReadingContext.Provider>
  );
}; 