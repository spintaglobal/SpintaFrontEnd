import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

const ListeningExam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const audioRef = useRef(null);
  
  // State management
  const [currentPart, setCurrentPart] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [audioEnded, setAudioEnded] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [justSaved, setJustSaved] = useState(false);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        // Save to localStorage
        localStorage.setItem('cambridge_listening_answers', JSON.stringify({
          answers,
          currentPart,
          timestamp: Date.now()
        }));
        setLastSaved(new Date());
        setJustSaved(true);
        
        // Hide the tick mark after 2 seconds
        setTimeout(() => {
          setJustSaved(false);
        }, 2000);
      }
    }, 5000); // Auto-save every 5 seconds

    return () => clearInterval(autoSaveInterval);
  }, [answers, currentPart]);

  // Cleanup localStorage when component unmounts or user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('cambridge_listening_answers');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        localStorage.removeItem('cambridge_listening_answers');
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function for component unmount
    return () => {
      localStorage.removeItem('cambridge_listening_answers');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Load saved answers on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('cambridge_listening_answers');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Only load if saved within last hour
        if (Date.now() - parsed.timestamp < 3600000) {
          setAnswers(parsed.answers || {});
        } else {
          // Clear old saved data
          localStorage.removeItem('cambridge_listening_answers');
        }
      } catch (error) {
        console.error('Error loading saved answers:', error);
        localStorage.removeItem('cambridge_listening_answers');
      }
    }
  }, []);

  useEffect(() => {
    // Get test data from navigation state
    const { testData: apiTestData, currentPart: initialPart } = location.state || {};
    
    if (!apiTestData) {
      // If no test data, redirect back to level selection
      navigate('/cambridge/listening');
      return;
    }

    // Set the current part from navigation state or default to 1
    if (initialPart) {
      setCurrentPart(initialPart);
    }

    console.log('Raw API data received:', apiTestData);

    // Transform API data to match component structure
    let transformedData;

    // Check if this is a single part data (like Part 4 directly) or full test data
    if (apiTestData.sections && !apiTestData.parts) {
      // This is single part data (like Part 4 multiple_matching format)
      console.log('Processing single part data with sections');
      
      const allQuestions = [];
      let questionCounter = 1;
      
      apiTestData.sections.forEach(section => {
        console.log(`Processing section:`, section);
        section.questions.forEach(question => {
          allQuestions.push({
            ...question,
            id: `4_${questionCounter}`, // Assume this is Part 4
            question_number: questionCounter++,
            question_type: section.question_type,
            section_id: section.section_id,
            section_description: section.section_description,
            matching_options: section.matching_options,
            options: question.options ? question.options.map(opt => 
              typeof opt === 'object' ? opt.text : opt
            ) : undefined
          });
        });
      });

      transformedData = {
        test_id: apiTestData.test_id || 'cambridge_test',
        level: 'c2', // Default for Part 4 multiple matching
        test_number: 1,
        parts: [{
          id: 4,
          title: 'Part 4',
          audioUrl: apiTestData.audio_url || '',
          questions: allQuestions,
          sections: apiTestData.sections,
          total_questions: allQuestions.length
        }]
      };
    } else if (apiTestData.parts) {
      // Standard multi-part test data structure
      transformedData = {
        test_id_composite: `cambridge_${apiTestData.level}_test_${apiTestData.test_number}`,
        level: apiTestData.level,
        test_number: apiTestData.test_number,
        parts: Object.keys(apiTestData.parts).map(partNum => {
          const partData = apiTestData.parts[partNum];
          
          console.log(`Processing part ${partNum}:`, partData);
          
          // Flatten all questions from all sections in this part
          const allQuestions = [];
          let questionCounter = 1; // Start numbering from 1 for each part
          
          // Handle different data structures
          if (partData.questions_data && partData.questions_data.sections) {
            // Standard structure with questions_data.sections
            console.log(`Part ${partNum}: Using questions_data.sections structure`);
            partData.questions_data.sections.forEach(section => {
              section.questions.forEach(question => {
                // Transform question to include section info and standardize format
                allQuestions.push({
                  ...question,
                  id: `${partNum}_${questionCounter}`, // Unique ID for each question
                  question_number: questionCounter++,
                  question_type: section.question_type,
                  section_id: section.section_id,
                  section_description: section.section_description,
                  matching_options: section.matching_options,
                  // Transform options to include both letter and text if needed
                  options: question.options ? question.options.map(opt => 
                    typeof opt === 'object' ? opt.text : opt
                  ) : undefined
                });
              });
            });
          } else if (partData.sections) {
            // Direct sections structure (for multiple_matching)
            console.log(`Part ${partNum}: Using direct sections structure`);
            partData.sections.forEach(section => {
              console.log(`Processing section:`, section);
              section.questions.forEach(question => {
                // Transform question to include section info and standardize format
                allQuestions.push({
                  ...question,
                  id: `${partNum}_${questionCounter}`, // Unique ID for each question
                  question_number: questionCounter++,
                  question_type: section.question_type,
                  section_id: section.section_id,
                  section_description: section.section_description,
                  matching_options: section.matching_options,
                  // Transform options to include both letter and text if needed
                  options: question.options ? question.options.map(opt => 
                    typeof opt === 'object' ? opt.text : opt
                  ) : undefined
                });
              });
            });
          } else {
            console.warn(`Part ${partNum}: No valid data structure found`, partData);
          }
          
          console.log(`Part ${partNum}: Generated ${allQuestions.length} questions:`, allQuestions);
          
          return {
            id: parseInt(partNum),
            title: `Part ${partNum}`,
            audioUrl: partData.audio_url || '',
            questions: allQuestions,
            sections: partData.questions_data?.sections || partData.sections || [],
            total_questions: partData.total_questions || allQuestions.length
          };
        }).filter(part => part.questions.length > 0) // Filter out parts with no questions
      };
    } else {
      console.error('Unknown API data structure:', apiTestData);
      navigate('/cambridge/listening');
      return;
    }

    console.log('Final transformed data:', transformedData);
    setTestData(transformedData);
    setIsLoading(false);
  }, [location.state, navigate]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Try to play even if not fully loaded - let the browser handle buffering
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio started playing successfully');
              if (!hasStartedAudio) {
                setHasStartedAudio(true);
              }
            })
            .catch((error) => {
              console.error('Audio play error:', error);
              
              // If it's a loading issue, set loading state but don't show error
              if (error.name === 'NotAllowedError') {
                console.log('Audio play blocked by browser - user interaction required');
              } else if (error.name === 'NotSupportedError') {
                setAudioError(true);
              } else {
                // For other errors (like network issues), keep loading state
                console.log('Audio not ready yet, keeping loading state');
                setAudioLoading(true);
              }
            });
        } else {
          // Fallback for older browsers
          if (!hasStartedAudio) {
            setHasStartedAudio(true);
          }
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioEnded(true);
  };

  const handleAudioLoadStart = () => {
    setAudioLoading(true);
    setAudioError(false);
  };

  const handleAudioCanPlay = () => {
    setAudioLoading(false);
    setAudioError(false);
  };

  // Add new handler for when enough data is loaded to start playing
  const handleAudioCanPlayThrough = () => {
    setAudioLoading(false);
    setAudioError(false);
    console.log('Audio can play through - enough data buffered');
  };

  // Add handler for progress event to track buffering
  const handleAudioProgress = () => {
    if (audioRef.current && audioRef.current.buffered.length > 0) {
      const buffered = audioRef.current.buffered;
      const duration = audioRef.current.duration;
      if (duration > 0) {
        const bufferedEnd = buffered.end(buffered.length - 1);
        const bufferedPercent = (bufferedEnd / duration) * 100;
        console.log(`Audio buffered: ${bufferedPercent.toFixed(1)}%`);
        
        // If we have at least 10% buffered, we can start playing
        if (bufferedPercent >= 10 && audioLoading) {
          setAudioLoading(false);
          console.log('Enough audio buffered to start playing');
        }

        // Preload next part when current part is 50% buffered
        if (bufferedPercent >= 50 && currentPart < 4) {
          preloadNextPartAudio();
        }
      }
    }
  };

  // Preload next part audio
  const preloadNextPartAudio = () => {
    if (currentPart < 4 && testData && testData.parts) {
      const nextPartData = testData.parts.find(p => p.id === currentPart + 1);
      if (nextPartData && nextPartData.audioUrl) {
        const nextAudio = new Audio();
        nextAudio.preload = 'auto';
        nextAudio.src = normalizeAudioUrl(nextPartData.audioUrl);
        console.log(`Preloading audio for Part ${currentPart + 1}`);
      }
    }
  };

  const handleAudioError = () => {
    setAudioLoading(false);
    setAudioError(true);
    
    // Enhanced error logging for debugging
    console.error('Audio error occurred for Part:', currentPart);
    console.error('Original audio URL:', currentPartData?.audioUrl);
    console.error('Normalized audio URL:', normalizeAudioUrl(currentPartData?.audioUrl));
    console.error('Audio element error:', audioRef.current?.error);
    
    if (audioRef.current?.error) {
      const errorCodes = {
        1: 'MEDIA_ERR_ABORTED - The user aborted the video playback',
        2: 'MEDIA_ERR_NETWORK - A network error occurred while fetching the media',
        3: 'MEDIA_ERR_DECODE - An error occurred while decoding the media',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - The media format is not supported'
      };
      console.error('Error code:', audioRef.current.error.code, '-', errorCodes[audioRef.current.error.code]);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setAudioCurrentTime(current);
      if (duration && !isNaN(duration)) {
        const progress = (current / duration) * 100;
        setAudioProgress(progress);
      }
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      setAudioDuration(duration);
    }
  };

  const handleAudioSeek = (e) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percentage = x / width;
      const newTime = percentage * audioDuration;
      audioRef.current.currentTime = newTime;
      setAudioCurrentTime(newTime);
      setAudioProgress(percentage * 100);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Normalize audio URL to fix inconsistent capitalization
  const normalizeAudioUrl = (url) => {
    if (!url) return '';
    
    // Fix inconsistent capitalization in Cambridge audio URLs
    // Convert paths like /cambridge/C2/ to /cambridge/c2/
    const normalizedUrl = url.replace(/\/cambridge\/([A-Z]\d+)\//g, (match, level) => {
      return `/cambridge/${level.toLowerCase()}/`;
    });
    
    console.log('Original URL:', url);
    console.log('Normalized URL:', normalizedUrl);
    
    return normalizedUrl;
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNextPart = () => {
    if (currentPart < 4) {
      const nextPart = currentPart + 1;
      setCurrentPart(nextPart);
      setIsPlaying(false);
      setHasStartedAudio(false);
      setAudioEnded(false);
      setAudioLoading(false);
      setAudioError(false);
      setAudioProgress(0);
      setAudioCurrentTime(0);
      setAudioDuration(0);
      
      // Reset audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  const handleSubmitExam = () => {
    // Clear auto-saved data
    localStorage.removeItem('cambridge_listening_answers');
    
    // Calculate results and navigate to feedback
    const results = calculateResults();
    navigate('/cambridge/listening/feedback', { 
      state: { 
        answers, 
        testData, 
        results 
      } 
    });
  };

  const handleRefreshTest = () => {
    setShowRefreshConfirm(true);
  };

  const confirmRefreshTest = async () => {
    setShowRefreshConfirm(false);
    setIsLoading(true);
    
    try {
      // Get a new random Cambridge test
      const testNumber = Math.floor(Math.random() * 20) + 1; // Random test from 1-20
      const level = testData?.level || 'b1'; // Use current test level or default to B1
      
      console.log(`Refreshing with Cambridge ${level.toUpperCase()} test ${testNumber}...`);
      
      // Fetch parts sequentially in order (1, 2, 3, 4)
      const parts = [];
      let successfulParts = 0;
      
      for (let partNumber = 1; partNumber <= 4; partNumber++) {
        try {
          console.log(`Fetching part ${partNumber}...`);
          const response = await fetch(
            `https://fesix53cz3.execute-api.us-east-1.amazonaws.com/prod/cambridge/listening/${level}/tests/${testNumber}/parts/${partNumber}`
          );
          
          if (!response.ok) {
            console.warn(`Part ${partNumber} not available (${response.status})`);
            // If it's part 1 and it fails, we need to try a different test
            if (partNumber === 1) {
              throw new Error(`Part 1 is required but not available for test ${testNumber}`);
            }
            // For other parts, we can continue without them
            continue;
          }
          
          const partData = await response.json();
          parts.push({ partNumber, data: partData });
          successfulParts++;
          console.log(`Successfully fetched part ${partNumber}`);
          
        } catch (error) {
          console.error(`Error fetching part ${partNumber}:`, error);
          // If it's part 1 and it fails, we need to try a different test
          if (partNumber === 1) {
            throw new Error(`Failed to fetch required part 1: ${error.message}`);
          }
          // For other parts, log the error but continue
          console.warn(`Skipping part ${partNumber} due to error`);
        }
      }
      
      // Ensure we have at least part 1
      if (successfulParts === 0 || !parts.find(p => p.partNumber === 1)) {
        throw new Error('Could not load any test parts. Please try again.');
      }
      
      console.log(`Successfully loaded ${successfulParts} parts for refresh`);
      
      // Transform the API response to match our component structure
      const newTestData = {
        test_id_composite: `cambridge_${level}_test_${testNumber}`,
        level,
        test_number: testNumber,
        parts: {}
      };

      // Process each successfully fetched part in order
      parts.sort((a, b) => a.partNumber - b.partNumber).forEach(({ partNumber, data }) => {
        console.log(`Refresh: Processing Part ${partNumber} data:`, data);
        
        // Handle different API response structures
        let sectionsData;
        if (data.questions_data && Array.isArray(data.questions_data)) {
          // Standard structure: data.questions_data is an array of sections
          sectionsData = data.questions_data.map(section => ({
            section_id: section.section_id,
            section_description: section.section_description,
            question_type: section.question_type,
            questions: section.questions,
            matching_options: section.matching_options || undefined
          }));
        } else if (data.sections && Array.isArray(data.sections)) {
          // Direct sections structure (for multiple_matching like Part 4)
          sectionsData = data.sections.map(section => ({
            section_id: section.section_id,
            section_description: section.section_description,
            question_type: section.question_type,
            questions: section.questions,
            matching_options: section.matching_options || undefined
          }));
        } else {
          console.warn(`Refresh: Part ${partNumber}: Unknown data structure`, data);
          sectionsData = [];
        }

        newTestData.parts[partNumber.toString()] = {
          audio_url: data.audio_url,
          part_number: data.part_number,
          total_questions: data.total_questions,
          questions_data: {
            sections: sectionsData
          },
          // Also store direct sections for compatibility
          sections: sectionsData
        };
      });
      
      console.log('Refresh test data prepared:', newTestData);
      
      // Navigate to a fresh exam with new test data
      navigate('/cambridge/listening/exam', { 
        state: { 
          testData: newTestData,
          currentPart: 1
        } 
      });
    } catch (error) {
      console.error('Error refreshing Cambridge test:', error);
      alert(`Failed to refresh test: ${error.message}. Please try again.`);
      setIsLoading(false);
    }
  };

  const cancelRefreshTest = () => {
    setShowRefreshConfirm(false);
  };

  const calculateResults = () => {
    // Calculate total questions dynamically from test data
    const totalQuestions = testData.parts.reduce((total, part) => total + part.questions.length, 0);
    let correctAnswers = 0;
    
    testData.parts.forEach(part => {
      part.questions.forEach(question => {
        const userAnswer = answers[question.id];
        const correctAnswer = question.correct_answer;
        
        if (userAnswer && correctAnswer) {
          // Normalize answers for comparison (case insensitive, trim whitespace)
          const normalizedUserAnswer = userAnswer.toString().toLowerCase().trim();
          const normalizedCorrectAnswer = correctAnswer.toString().toLowerCase().trim();
          
          if (normalizedUserAnswer === normalizedCorrectAnswer) {
            correctAnswers++;
          }
        }
      });
    });
    
    const percentage = (correctAnswers / totalQuestions) * 100;
    const bandScore = getBandScore(correctAnswers, totalQuestions);
    
    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      percentage: percentage.toFixed(1),
      bandScore
    };
  };

  const getBandScore = (correct, total) => {
    const percentage = (correct / total) * 100;
    
    if (percentage >= 90) return 9.0;
    if (percentage >= 80) return 8.0;
    if (percentage >= 70) return 7.0;
    if (percentage >= 60) return 6.0;
    if (percentage >= 50) return 5.0;
    if (percentage >= 40) return 4.0;
    if (percentage >= 30) return 3.0;
    if (percentage >= 20) return 2.0;
    return 1.0;
  };

  const getLevelInfo = () => {
    const level = testData?.level || 'b1';
    const levelData = {
      b1: { name: 'B1 Intermediate', shortName: 'B1' },
      b2: { name: 'B2 Upper Intermediate', shortName: 'B2' },
      c1: { name: 'C1 Advanced', shortName: 'C1' },
      c2: { name: 'C2 Proficiency', shortName: 'C2' }
    };
    return levelData[level] || levelData.b1;
  };

  const getQuestionTypeInstructions = (questionType) => {
    switch (questionType) {
      case 'multiple_choice':
      case 'multiple-choice':
      case 'Multiple Choice':
        return 'Choose the correct answer from the options below.';
      case 'form_filling':
      case 'form-filling':
      case 'Form Filling':
        return 'Complete the form by filling in the missing information.';
      case 'matching':
      case 'Matching':
      case 'multiple_matching':
      case 'multiple-matching':
      case 'Multiple Matching':
        return 'You will hear five different speakers. Match each speaker to the correct option. There are extra options which you do not need to use.';
      case 'note_completion':
      case 'note-completion':
      case 'Note Completion':
        return 'Complete the notes with the missing words.';
      case 'sentence_completion':
      case 'sentence-completion':
      case 'Sentence Completion':
        return 'Complete the sentences with the missing words.';
      case 'table_completion':
      case 'table-completion':
      case 'Table Completion':
        return 'Complete the table with the missing information.';
      default:
        return 'Answer the questions based on what you hear in the audio.';
    }
  };

  const groupQuestionsByType = (questions) => {
    const groups = [];
    let currentGroup = null;
    
    questions.forEach(question => {
      const questionType = question.question_type || question.type;
      
      if (!currentGroup || currentGroup.type !== questionType) {
        currentGroup = {
          type: questionType,
          instructions: getQuestionTypeInstructions(questionType),
          questions: []
        };
        groups.push(currentGroup);
      }
      
      currentGroup.questions.push(question);
    });
    
    return groups;
  };

  const renderMatchingGroup = (questions) => {
    // Get matching options from the first question (they should all be the same)
    const matchingOptions = questions[0]?.matching_options;
    
    if (!matchingOptions) {
      return questions.map(renderQuestion);
    }

    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        {/* Instructions */}
        <div className="mb-6">
          <h4 className="text-xl font-bold text-white mb-3 flex items-center">
            <span className="material-icons text-blue-400 mr-2">connect_without_contact</span>
            Matching Questions
          </h4>
          <p className="text-orange-400 font-medium text-lg mb-4">
            You will hear five different speakers. Match each speaker to the correct option. There are extra options which you do not need to use.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Speakers */}
          <div>
            <h5 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="material-icons text-purple-400 mr-2">record_voice_over</span>
              Speakers
            </h5>
            <div className="space-y-3">
              {questions.map((question) => {
                const userAnswer = answers[question.id];
                return (
                  <div key={question.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200">
                    {/* Speaker Label */}
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{question.question_number}</span>
                      </div>
                      <span className="text-white font-medium text-lg">
                        {question.question_text || question.question || `Speaker ${question.question_number}`}
                      </span>
                    </div>
                    
                    {/* Selection */}
                    <div className="flex items-center space-x-3">
                      <select
                        value={userAnswer || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[120px]"
                      >
                        <option value="" className="bg-gray-800 text-white">Select...</option>
                        {Object.entries(matchingOptions).map(([letter, text]) => (
                          <option key={letter} value={letter} className="bg-gray-800 text-white">
                            {letter}
                          </option>
                        ))}
                      </select>
                      
                      {/* Selected Answer Display */}
                      {userAnswer && (
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                          <span className="text-white font-bold text-sm">{userAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Options Reference */}
          <div>
            <h5 className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="material-icons text-green-400 mr-2">list</span>
              Options
            </h5>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="space-y-3">
                {Object.entries(matchingOptions).map(([letter, text]) => {
                  // Check how many times this option is used
                  const usageCount = questions.filter(q => answers[q.id] === letter).length;
                  
                  return (
                    <div key={letter} className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 ${
                      usageCount > 0 ? 'bg-blue-500/10 border border-blue-400/30' : 'bg-white/5'
                    }`}>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        usageCount > 0 
                          ? 'border-blue-400 bg-blue-500 text-white' 
                          : 'border-white/30 text-white/60'
                      }`}>
                        {letter}
                      </div>
                      <div className="flex-1">
                        <span className={`text-base font-medium ${
                          usageCount > 0 ? 'text-blue-300' : 'text-white/80'
                        }`}>
                          {text}
                        </span>
                        {usageCount > 0 && (
                          <div className="mt-1">
                            <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                              Used {usageCount} time{usageCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Progress indicator */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Progress:</span>
                  <span>
                    {questions.filter(q => answers[q.id]).length}/{questions.length} completed
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(questions.filter(q => answers[q.id]).length / questions.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // New specialized Part 4 renderer with three-column layout
  const renderPart4MultipleMatching = (partData) => {
    if (!partData.sections || partData.sections.length === 0) {
      return renderMatchingGroup(partData.questions);
    }

    // Get sections and their questions
    const sections = partData.sections;
    const allQuestions = partData.questions;
    
    // Group questions by section
    const sectionQuestions = {};
    sections.forEach(section => {
      sectionQuestions[section.section_id] = allQuestions.filter(q => q.section_id === section.section_id);
    });

    // Calculate total answered questions
    const totalAnswered = allQuestions.filter(q => answers[q.id]).length;
    const totalQuestions = allQuestions.length;

    return (
      <div className="w-full max-w-none mx-auto">
        {/* Instructions Header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h4 className="text-2xl font-bold text-green-300 mb-3 flex items-center">
            <span className="material-icons text-green-400 mr-2 text-2xl">connect_without_contact</span>
            Part 4: Multiple Matching
          </h4>
          <p className="text-green-400 font-medium text-lg mb-4">
            You will hear five different speakers discussing the same topic. For questions 1-5, choose from the list A-H the feeling each speaker expresses. 
            For questions 5-10, choose from the list A-H the consequence each speaker mentions. You may use any letter more than once.
          </p>
          
          {/* Overall Progress */}
          <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
            <span className="text-white font-medium">Overall Progress:</span>
            <div className="flex items-center space-x-3">
              <span className="text-white font-bold">{totalAnswered}/{totalQuestions} completed</span>
              <div className="w-32 bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
          {/* Left Column - Section 1 (30%) */}
          {sections[0] && (
            <div className="xl:col-span-3">
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-6 h-full">
                <h5 className="text-xl font-bold text-blue-300 mb-4">
                  Section 1: Feelings/Attitudes
                </h5>
                <p className="text-blue-200 text-sm mb-6 leading-relaxed">
                  Questions 1-5: 
                  Choose from list A-H the feeling each speaker expresses.
                </p>
                
                <div className="space-y-4">
                  {sectionQuestions[sections[0].section_id]?.map((question, index) => {
                    const userAnswer = answers[question.id];
                    const speakerNum = index + 1; // Use index to show Speaker 1-5
                    
                    return (
                      <div key={question.id} className="bg-white/10 border border-blue-400/20 rounded-lg p-4 hover:bg-white/20 transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{question.question_number}</span>
                            </div>
                            <span className="text-white font-medium">Speaker {speakerNum}</span>
                          </div>
                          {userAnswer && (
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                              <span className="text-white font-bold text-sm">{userAnswer}</span>
                            </div>
                          )}
                        </div>
                        
                        <select
                          value={userAnswer || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-full bg-white/10 border border-blue-400/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="" className="bg-gray-800 text-white">Select feeling...</option>
                          {Object.entries(sections[0].matching_options || {}).map(([letter, text]) => (
                            <option key={letter} value={letter} className="bg-gray-800 text-white">
                              {letter} - {text.substring(0, 30)}...
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Middle Column - Options Reference (40%) */}
          <div className="xl:col-span-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full">
              <h5 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="material-icons text-purple-400 mr-2">list_alt</span>
                Answer Options Reference
              </h5>
              
              {/* Section 1 Options */}
              {sections[0] && (
                <div className="mb-8">
                  <h6 className="text-lg font-semibold text-blue-300 mb-4">
                    Feelings/Attitudes (A-H)
                  </h6>
                  <div className="space-y-2">
                    {Object.entries(sections[0].matching_options || {}).map(([letter, text]) => {
                      const usageCount = sectionQuestions[sections[0].section_id]?.filter(q => answers[q.id] === letter).length || 0;
                      
                      return (
                        <div key={letter} className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 ${
                          usageCount > 0 ? 'bg-blue-500/20 border border-blue-400/40' : 'bg-white/5 hover:bg-white/10'
                        }`}>
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            usageCount > 0 
                              ? 'border-blue-400 bg-blue-500 text-white' 
                              : 'border-white/30 text-white/60'
                          }`}>
                            {letter}
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium leading-relaxed ${
                              usageCount > 0 ? 'text-blue-200' : 'text-white/80'
                            }`}>
                              {text}
                            </span>
                            {usageCount > 0 && (
                              <div className="mt-1">
                                <span className="text-xs text-blue-300 bg-blue-500/30 px-2 py-1 rounded">
                                  Used {usageCount}x
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Visual Divider */}
              <div className="border-t border-white/20 my-6"></div>

              {/* Section 2 Options */}
              {sections[1] && (
                <div>
                  <h6 className="text-lg font-semibold text-green-300 mb-4">
                    Consequences (A-H)
                  </h6>
                  <div className="space-y-2">
                    {Object.entries(sections[1].matching_options || {}).map(([letter, text]) => {
                      const usageCount = sectionQuestions[sections[1].section_id]?.filter(q => answers[q.id] === letter).length || 0;
                      
                      return (
                        <div key={letter} className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 ${
                          usageCount > 0 ? 'bg-green-500/20 border border-green-400/40' : 'bg-white/5 hover:bg-white/10'
                        }`}>
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            usageCount > 0 
                              ? 'border-green-400 bg-green-500 text-white' 
                              : 'border-white/30 text-white/60'
                          }`}>
                            {letter}
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium leading-relaxed ${
                              usageCount > 0 ? 'text-green-200' : 'text-white/80'
                            }`}>
                              {text}
                            </span>
                            {usageCount > 0 && (
                              <div className="mt-1">
                                <span className="text-xs text-green-300 bg-green-500/30 px-2 py-1 rounded">
                                  Used {usageCount}x
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Section 2 (30%) */}
          {sections[1] && (
            <div className="xl:col-span-3">
              <div className="bg-green-500/10 border border-green-400/30 rounded-2xl p-6 h-full">
                <h5 className="text-xl font-bold text-green-300 mb-4">
                  Section 2: Consequences
                </h5>
                <p className="text-green-200 text-sm mb-6 leading-relaxed">
                  Questions 6-10: 
                  Choose from list A-H the consequence each speaker mentions.
                </p>
                
                <div className="space-y-4">
                  {sectionQuestions[sections[1].section_id]?.map((question, index) => {
                    const userAnswer = answers[question.id];
                    const speakerNum = index + 1; // Use index to show Speaker 1-5
                    
                    return (
                      <div key={question.id} className="bg-white/10 border border-green-400/20 rounded-lg p-4 hover:bg-white/20 transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{question.question_number}</span>
                            </div>
                            <span className="text-white font-medium">Speaker {speakerNum}</span>
                          </div>
                          {userAnswer && (
                            <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                              <span className="text-white font-bold text-sm">{userAnswer}</span>
                            </div>
                          )}
                        </div>
                        
                        <select
                          value={userAnswer || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-full bg-white/10 border border-green-400/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="" className="bg-gray-800 text-white">Select consequence...</option>
                          {Object.entries(sections[1].matching_options || {}).map(([letter, text]) => (
                            <option key={letter} value={letter} className="bg-gray-800 text-white">
                              {letter} - {text.substring(0, 30)}...
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Summary Bar */}
        <div className="mt-6 bg-white/10 border border-white/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="material-icons text-blue-400">check_circle</span>
                <span className="text-white font-medium">Completed: {totalAnswered}/{totalQuestions} questions</span>
              </div>
              {sections[0] && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-300 text-sm">
                    Feelings: {sectionQuestions[sections[0].section_id]?.filter(q => answers[q.id]).length || 0}/{sectionQuestions[sections[0].section_id]?.length || 0}
                  </span>
                </div>
              )}
              {sections[1] && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-300 text-sm">
                    Consequences: {sectionQuestions[sections[1].section_id]?.filter(q => answers[q.id]).length || 0}/{sectionQuestions[sections[1].section_id]?.length || 0}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  // Clear all answers for this part
                  const newAnswers = { ...answers };
                  allQuestions.forEach(q => {
                    delete newAnswers[q.id];
                  });
                  setAnswers(newAnswers);
                }}
                className="px-4 py-2 bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-200 flex items-center space-x-2"
              >
                <span className="material-icons text-sm">clear</span>
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestion = (question) => {
    const questionType = question.question_type || question.type;
    const userAnswer = answers[question.id];
    
    switch (questionType) {
      case 'multiple_choice':
      case 'multiple-choice':
      case 'Multiple Choice':
        return (
          <div key={question.id} className="mb-4">
            <p className="text-white mb-3 font-medium text-lg">{question.question_number}. {question.question_text || question.question}</p>
            <div className="space-y-2">
              {(question.options || question.choices || []).map((option, index) => {
                const letter = String.fromCharCode(65 + index); // A, B, C, etc.
                const isSelected = answers[question.id] === letter;
                
                return (
                  <label 
                    key={index} 
                    className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-blue-500/20 border-blue-400 text-blue-300' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      value={letter}
                      checked={isSelected}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                      isSelected 
                        ? 'border-blue-400 bg-blue-500 text-white' 
                        : 'border-white/30 text-white/60'
                    }`}>
                      {letter}
                    </div>
                    <span className="flex-1 text-base font-semibold">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      
      default:
        // Text input for all other question types
        return (
          <div key={question.id} className="mb-4">
            <p className="text-white font-medium text-lg mb-3">{question.question_number}. {question.question_text || question.question}</p>
            <input
              type="text"
              value={userAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
              placeholder="Type your answer here..."
            />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Cambridge test...</p>
        </div>
      </div>
    );
  }

  // Add error handling for missing test data or current part
  if (!testData || !testData.parts || testData.parts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/20 border border-red-400/50 rounded-2xl p-8 max-w-md">
            <span className="material-icons text-red-400 text-6xl mb-4">error</span>
            <h3 className="text-2xl font-bold text-white mb-4">Test Data Not Available</h3>
            <p className="text-white/80 mb-6">
              There was an error loading the test data. Please try again.
            </p>
            <button
              onClick={() => navigate('/cambridge/listening')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Back to Test Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPartData = testData.parts.find(p => p.id === currentPart);
  
  // Add error handling for missing current part data
  if (!currentPartData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-orange-500/20 border border-orange-400/50 rounded-2xl p-8 max-w-md">
            <span className="material-icons text-orange-400 text-6xl mb-4">warning</span>
            <h3 className="text-2xl font-bold text-white mb-4">Part {currentPart} Not Available</h3>
            <p className="text-white/80 mb-6">
              Part {currentPart} of this test is not available. Please try a different part or test.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentPart(1)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Go to Part 1
              </button>
              <button
                onClick={() => navigate('/cambridge/listening')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back to Tests
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add safety check for questions array
  if (!currentPartData.questions || currentPartData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-2xl p-8 max-w-md">
            <span className="material-icons text-yellow-400 text-6xl mb-4">quiz</span>
            <h3 className="text-2xl font-bold text-white mb-4">No Questions Available</h3>
            <p className="text-white/80 mb-6">
              Part {currentPart} doesn't have any questions loaded. This might be a data issue.
            </p>
            <div className="flex space-x-4">
              {currentPart > 1 && (
                <button
                  onClick={() => setCurrentPart(currentPart - 1)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Previous Part
                </button>
              )}
              <button
                onClick={() => navigate('/cambridge/listening')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back to Tests
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const questionGroups = groupQuestionsByType(currentPartData.questions);
  
  // Check if this is Part 4 with multiple matching sections
  const isPart4MultipleMatching = currentPart === 4 && 
    currentPartData.sections && 
    currentPartData.sections.length > 1 &&
    questionGroups.some(group => 
      group.type === 'matching' || 
      group.type === 'Matching' || 
      group.type === 'multiple_matching' || 
      group.type === 'multiple-matching' || 
      group.type === 'Multiple Matching'
    );
  
  // Check if there are matching questions that should use full width
  const hasMatchingQuestions = questionGroups.some(group => 
    group.type === 'matching' || 
    group.type === 'Matching' || 
    group.type === 'multiple_matching' || 
    group.type === 'multiple-matching' || 
    group.type === 'Multiple Matching'
  );
  
  // Split questions into two columns dynamically based on actual number of questions
  const totalQuestions = currentPartData.questions.length;
  const halfPoint = Math.ceil(totalQuestions / 2);
  const leftQuestions = currentPartData.questions.slice(0, halfPoint);
  const rightQuestions = currentPartData.questions.slice(halfPoint);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
      {/* Audio Player Bar */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-white font-semibold text-2xl">Cambridge {getLevelInfo().name} {currentPartData.title}</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                disabled={audioError || (audioLoading && (!audioRef.current || !audioRef.current.buffered.length || 
                  audioRef.current.buffered.length === 0 || 
                  (audioRef.current.duration > 0 && (audioRef.current.buffered.end(0) / audioRef.current.duration) < 0.05)))}
                className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
                  audioError
                    ? 'bg-red-500 hover:bg-red-600'
                    : !hasStartedAudio 
                    ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/50' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } ${(audioError || (audioLoading && (!audioRef.current || !audioRef.current.buffered.length || 
                  audioRef.current.buffered.length === 0 || 
                  (audioRef.current.duration > 0 && (audioRef.current.buffered.end(0) / audioRef.current.duration) < 0.05)))) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {audioLoading ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : audioError ? (
                  <span className="material-icons text-white text-xl">error</span>
                ) : (
                  <span className="material-icons text-white text-xl">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                )}
              </button>
              
              {/* Audio Status */}
              {!hasStartedAudio && !audioLoading && !audioError && (
                <div className="flex items-center space-x-3 bg-green-500/20 border border-green-400/50 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="material-icons text-green-400 text-xl">play_circle</span>
                    <span className="text-green-400 font-bold text-lg">Click to Start Audio</span>
                  </div>
                  <span className="material-icons text-green-400 text-xl">arrow_back</span>
                </div>
              )}
              
              {/* Audio Progress Indicator */}
              {(hasStartedAudio || isPlaying) && !audioError && (
                <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 min-w-[300px]">
                  {/* Play Status Indicator */}
                  <div className="flex items-center space-x-2">
                    {isPlaying ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-medium text-sm">Playing</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-yellow-400 font-medium text-sm">Paused</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="flex-1 flex items-center space-x-3">
                    <span className="text-white/70 text-xs font-mono min-w-[35px]">
                      {formatTime(audioCurrentTime)}
                    </span>
                    <div 
                      className="flex-1 h-2 bg-white/20 rounded-full cursor-pointer group relative overflow-hidden"
                      onClick={handleAudioSeek}
                    >
                      {/* Progress track */}
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-200 relative"
                        style={{ width: `${audioProgress}%` }}
                      >
                        {/* Animated shine effect when playing */}
                        {isPlaying && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse rounded-full"></div>
                        )}
                      </div>
                      
                      {/* Hover indicator */}
                      <div className="absolute top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                           style={{ left: `${audioProgress}%` }}>
                        <div className="w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-500 transform -translate-x-1/2"></div>
                      </div>
                    </div>
                    <span className="text-white/70 text-xs font-mono min-w-[35px]">
                      {formatTime(audioDuration)}
                    </span>
                  </div>
                  
                  {/* Audio wave animation when playing */}
                  {isPlaying && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                      <div className="w-1 h-4 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                      <div className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
                      <div className="w-1 h-5 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '450ms'}}></div>
                    </div>
                  )}
                </div>
              )}
              
              {audioLoading && (
                <div className="flex items-center space-x-3 bg-blue-500/20 border border-blue-400/50 rounded-lg px-4 py-2">
                  <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-blue-400 font-medium text-lg">
                    Buffering audio...
                  </span>
                  {audioRef.current && audioRef.current.buffered.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-1 bg-blue-900/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-400 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${audioRef.current.duration > 0 ? 
                              (audioRef.current.buffered.end(audioRef.current.buffered.length - 1) / audioRef.current.duration) * 100 : 
                              0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-blue-400 text-sm">
                        {audioRef.current.duration > 0 ? 
                          Math.round((audioRef.current.buffered.end(audioRef.current.buffered.length - 1) / audioRef.current.duration) * 100) : 
                          0}%
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {audioError && (
                <span className="text-red-400 font-medium text-lg">
                  Audio failed to load
                </span>
              )}
              
              {audioEnded && !isPlaying && (
                <div className="flex items-center space-x-2 bg-yellow-500/20 border border-yellow-400/50 rounded-lg px-4 py-2">
                  <span className="material-icons text-yellow-400 text-xl">check_circle</span>
                  <span className="text-yellow-400 font-medium text-lg">Audio completed</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-white/70 text-lg">Part {currentPart} of 4</span>
            <span className="text-white/50 text-sm">Test #{testData.test_number}</span>
            {lastSaved && (
              <div className="flex items-center space-x-2 bg-green-500/20 rounded-lg px-3 py-1">
                <span className="material-icons text-green-400 text-lg">save</span>
                <span className="material-icons text-green-400 text-sm">autorenew</span>
                {justSaved && (
                  <span className="material-icons text-green-400 text-sm animate-pulse">check</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Hidden audio element */}
        <audio
          key={`part-${currentPart}`}
          ref={audioRef}
          onEnded={handleAudioEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadStart={handleAudioLoadStart}
          onCanPlay={handleAudioCanPlay}
          onCanPlayThrough={handleAudioCanPlayThrough}
          onProgress={handleAudioProgress}
          onError={handleAudioError}
          onTimeUpdate={handleAudioTimeUpdate}
          onLoadedMetadata={handleAudioLoadedMetadata}
          preload="auto"
        >
          <source src={normalizeAudioUrl(currentPartData.audioUrl)} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {isPart4MultipleMatching ? (
          // Special Part 4 three-column layout
          renderPart4MultipleMatching(currentPartData)
        ) : (
          <div className="max-w-8xl mx-auto">
            {/* Part Header */}
            <div className="text-center mb-8">
              <h3 className="text-4xl font-bold text-white mb-2">Cambridge {getLevelInfo().name} {currentPartData.title}</h3>
              <div className="flex justify-center items-center space-x-4 text-white/70 text-lg">
                <span>{currentPartData.questions.length} questions</span>
                {currentPartData.sections.length > 0 && (
                  <>
                    <span>•</span>
                    <span>Listening Task</span>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-base text-white/70 mb-2">
                <span>Progress</span>
                <span>{currentPart}/4 parts</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(currentPart / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Questions Layout - Full width for matching, two columns for others */}
            {hasMatchingQuestions ? (
              // Full width layout for matching questions
              <div className="mb-8">
                {questionGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-6">
                    {group.type === 'matching' || 
                     group.type === 'Matching' || 
                     group.type === 'multiple_matching' || 
                     group.type === 'multiple-matching' || 
                     group.type === 'Multiple Matching' ? (
                      renderMatchingGroup(group.questions)
                    ) : (
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-7 border border-white/20">
                        <h4 className="text-2xl font-bold text-white mb-6 flex items-center">
                          <span className="material-icons text-blue-400 mr-2 text-xl">quiz</span>
                          {group.instructions}
                        </h4>
                        <div className="space-y-4">
                          {group.questions.map(renderQuestion)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Two column layout for non-matching questions
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8" style={{ maxWidth: '110%', margin: '0 auto' }}>
                {/* Left Column */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-7 border border-white/20">
                  <h4 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <span className="material-icons text-blue-400 mr-2 text-xl">quiz</span>
                    Questions 1-{leftQuestions.length}
                  </h4>
                  
                  {/* Group questions by type for left column */}
                  {groupQuestionsByType(leftQuestions).map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-6">
                      <p className="text-orange-400 font-bold text-lg mb-4">{group.instructions}</p>
                      <div className="space-y-4">
                        {group.questions.map(renderQuestion)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-7 border border-white/20">
                  <h4 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <span className="material-icons text-purple-400 mr-2 text-xl">quiz</span>
                    {rightQuestions.length > 0 ? `Questions ${leftQuestions.length + 1}-${currentPartData.questions.length}` : 'All Questions in Left Column'}
                  </h4>
                  
                  {/* Group questions by type for right column */}
                  {rightQuestions.length > 0 ? (
                    groupQuestionsByType(rightQuestions).map((group, groupIndex) => (
                      <div key={groupIndex} className="mb-6">
                        <p className="text-orange-400 font-bold text-lg mb-4">{group.instructions}</p>
                        <div className="space-y-4">
                          {group.questions.map(renderQuestion)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-white/50 py-12">
                      <span className="material-icons text-5xl mb-4">check_circle</span>
                      <p className="text-lg">All questions for this part are in the left column</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Part Navigation Dots */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((partNum) => (
              <div
                key={partNum}
                className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 ${
                  partNum === currentPart
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : partNum < currentPart
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-white/30 text-white/50'
                }`}
              >
                {partNum < currentPart ? (
                  <span className="material-icons text-lg">check</span>
                ) : (
                  <span className="text-lg font-bold">{partNum}</span>
                )}
              </div>
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex flex-col items-center space-y-4">
            {currentPart < 4 ? (
              <button
                onClick={handleNextPart}
                disabled={!hasStartedAudio}
                className={`inline-flex items-center space-x-3 px-10 py-5 rounded-2xl text-white font-semibold transition-all duration-300 text-xl ${
                  hasStartedAudio
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1'
                    : 'bg-gray-500 cursor-not-allowed opacity-50'
                }`}
              >
                <span>Next Part</span>
                <span className="material-icons text-xl">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleSubmitExam}
                disabled={!hasStartedAudio}
                className={`inline-flex items-center space-x-3 px-10 py-5 rounded-2xl text-white font-semibold transition-all duration-300 text-xl ${
                  hasStartedAudio
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1'
                    : 'bg-gray-500 cursor-not-allowed opacity-50'
                }`}
              >
                <span>Submit Exam</span>
                <span className="material-icons text-xl">check_circle</span>
              </button>
            )}
            
            {!hasStartedAudio && (
              <p className="text-white/60 text-lg text-center">
                Please start the audio to continue
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Refresh Test Button - Only visible on Part 1 */}
      {currentPart === 1 && (
        <>
          <div className="fixed bottom-6 right-6 z-10">
            <div className="relative group">
              <button
                onClick={handleRefreshTest}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-110"
                title="Get a new test"
              >
                <span className="material-icons text-2xl">refresh</span>
              </button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                <div className="bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-xl border border-white/20 whitespace-nowrap">
                  <div className="font-semibold mb-1">Already taken this test?</div>
                  <div className="text-gray-300">Click to get a fresh new test!</div>
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Dialog */}
          {showRefreshConfirm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md mx-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-6">
                    <span className="material-icons text-white text-2xl">refresh</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Get a New Test?</h3>
                  <p className="text-white/80 mb-8 leading-relaxed">
                    Are you sure you want to refresh and get a completely new Cambridge test? 
                    Your current progress will be lost.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={cancelRefreshTest}
                      className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmRefreshTest}
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Loading...</span>
                        </div>
                      ) : (
                        'Yes, Get New Test'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListeningExam; 