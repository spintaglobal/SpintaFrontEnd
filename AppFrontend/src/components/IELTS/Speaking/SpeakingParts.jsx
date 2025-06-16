import React, { useRef, useState } from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import useSpeechRecognition from './useSpeechRecognition';
import RefreshTestButton from '../RefreshTestButton';
import './speaking.css';
import { useSpeakingContext } from './SpeakingContext';

// Part 1 Component
export const Part1 = ({ 
  testData, 
  transcriptions, 
  isRecording, 
  updateTranscription, 
  toggleRecording, 
  nextPart,
  onBack 
}) => {
  const { isSupported, startRecognition } = useSpeechRecognition();
  const recognitionRef = useRef(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const startRecording = (questionIndex) => {
    // If already recording, stop the recognition
    if (isRecording.part1[questionIndex]) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('Speech recognition stopped');
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
        recognitionRef.current = null;
      }
      
      // Save the final transcript
      if (currentTranscript) {
        updateTranscription(1, questionIndex, currentTranscript);
      }
    } else {
      // Stop any existing recognition before starting a new one
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('Stopping previous speech recognition');
        } catch (error) {
          console.error('Error stopping previous speech recognition:', error);
        }
        recognitionRef.current = null;
      }
      
      // Start new recording
      if (!isSupported) {
        setError('Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari.');
        return;
      }
      
      // Reset current transcript
      setCurrentTranscript('');
      
      // Start speech recognition
      recognitionRef.current = startRecognition(
        // onResult callback
        (transcript) => {
          setCurrentTranscript(transcript);
          // Update in real-time
          updateTranscription(1, questionIndex, transcript);
        },
        // onError callback
        (errorMessage) => {
          setError(errorMessage);
          toggleRecording(1, questionIndex); // Turn off recording state
        }
      );
    }
    
    // Toggle recording state
    toggleRecording(1, questionIndex);
  };
  
  // Get the questions from the test data
  const questions = testData?.Part1 || [];
  
  // Validate data before rendering
  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">No Questions Available</h2>
          <p className="text-yellow-600">Could not load Part 1 questions. Please try restarting the test.</p>
          <Button onClick={onBack} className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white">
            Return to Instructions
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => setError(null)} className="mt-2 text-sm bg-red-600 hover:bg-red-700 text-white">
            Dismiss
          </Button>
        </div>
      )}
      
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-bold mb-3" style={{
          background: "var(--primary-gradient)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent"
        }}>
          Speaking Test - Part 1
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Answer the following questions about familiar topics. Click the microphone button to start recording your answer.
        </p>
      </div>
      
      <div className="space-y-8 mb-12">
        {questions.map((question, index) => (
          <div key={index} className="flex items-start gap-6 animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
            <Card className="p-8 speaking-question-card flex-1">
              <h2 className="text-xl font-semibold mb-4">{question}</h2>
              
              {transcriptions.part1[index] && (
                <div className="transcription-area">
                  <h3 className="transcription-label">Your Answer:</h3>
                  <p className="transcription-text">{transcriptions.part1[index]}</p>
                </div>
              )}
            </Card>
            
            <Button
              onClick={() => startRecording(index)}
              className={`mic-button ${
                isRecording.part1[index]
                  ? 'recording'
                  : ''
              }`}
              aria-label={isRecording.part1[index] ? "Stop recording" : "Start recording"}
            >
              {isRecording.part1[index] ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </Button>
          </div>
        ))}
      </div>
      
      <div className="text-center mb-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <Button
          onClick={nextPart}
          className="nav-button px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-medium rounded-xl shadow-lg"
        >
          <span className="mr-2">Next: Part 2</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

// Part 2 Component
export const Part2 = ({ 
  testData, 
  transcriptions, 
  isRecording, 
  updateTranscription, 
  toggleRecording, 
  nextPart,
  onBack 
}) => {
  const { isSupported, startRecognition } = useSpeechRecognition();
  const recognitionRef = useRef(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState(null);
  const [preparationTime, setPreparationTime] = useState(60); // 1 minute preparation
  const [isPreparationPhase, setIsPreparationPhase] = useState(true);
  const [speakingTime, setSpeakingTime] = useState(120); // 2 minutes speaking
  const [isSpeakingPhase, setIsSpeakingPhase] = useState(false);
  
  // Timer effect for preparation phase
  React.useEffect(() => {
    if (isPreparationPhase && preparationTime > 0) {
      const timer = setTimeout(() => {
        setPreparationTime(preparationTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isPreparationPhase && preparationTime === 0) {
      setIsPreparationPhase(false);
      setIsSpeakingPhase(true);
    }
  }, [preparationTime, isPreparationPhase]);
  
  // Timer effect for speaking phase
  React.useEffect(() => {
    if (isSpeakingPhase && speakingTime > 0 && !isRecording.part2) {
      const timer = setTimeout(() => {
        setSpeakingTime(speakingTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isSpeakingPhase && speakingTime === 0) {
      // Time's up, stop recording if active
      if (isRecording.part2) {
        toggleRecordingHandler();
      }
      setIsSpeakingPhase(false);
    }
  }, [speakingTime, isSpeakingPhase, isRecording.part2]);
  
  const toggleRecordingHandler = () => {
    if (isRecording.part2) {
      // Stop recording
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('Speech recognition stopped');
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
        recognitionRef.current = null;
      }
      
      // Save the final transcript
      if (currentTranscript) {
        updateTranscription(2, 0, currentTranscript);
      }
    } else {
      // Start recording
      if (!isSupported) {
        setError('Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari.');
        return;
      }
      
      if (isPreparationPhase) {
        setError('Please wait for the preparation time to finish before recording.');
        return;
      }
      
      // Reset current transcript
      setCurrentTranscript('');
      
      // Start speech recognition
      recognitionRef.current = startRecognition(
        // onResult callback
        (transcript) => {
          setCurrentTranscript(transcript);
          // Update in real-time
          updateTranscription(2, 0, transcript);
        },
        // onError callback
        (errorMessage) => {
          setError(errorMessage);
          toggleRecording(2, 0); // Turn off recording state
        }
      );
    }
    
    // Toggle recording state
    toggleRecording(2, 0);
  };
  
  const skipPreparation = () => {
    setIsPreparationPhase(false);
    setIsSpeakingPhase(true);
    setPreparationTime(0);
  };
  
  // Get the Part 2 data
  const part2Data = testData?.Part2;
  
  // Validate data before rendering
  if (!part2Data || !part2Data.title) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">No Topic Available</h2>
          <p className="text-yellow-600">Could not load Part 2 topic. Please try restarting the test.</p>
          <Button onClick={onBack} className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white">
            Return to Instructions
          </Button>
        </div>
      </div>
    );
  }
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => setError(null)} className="mt-2 text-sm bg-red-600 hover:bg-red-700 text-white">
            Dismiss
          </Button>
        </div>
      )}
      
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-bold mb-3" style={{
          background: "var(--primary-gradient)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent"
        }}>
          Speaking Test - Part 2
        </h1>
        
        {isPreparationPhase && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Preparation Time</h2>
            <p className="text-blue-600 mb-2">You have 1 minute to prepare your answer. Make notes if needed.</p>
            <div className="text-2xl font-bold text-blue-800">{formatTime(preparationTime)}</div>
            <Button onClick={skipPreparation} className="mt-2 text-sm bg-blue-600 hover:bg-blue-700 text-white">
              Skip Preparation
            </Button>
          </div>
        )}
        
        {isSpeakingPhase && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-green-800 mb-2">Speaking Time</h2>
            <p className="text-green-600 mb-2">Speak for 1-2 minutes about the topic below.</p>
            <div className="text-2xl font-bold text-green-800">{formatTime(speakingTime)}</div>
          </div>
        )}
      </div>
      
      <Card className="p-8 speaking-question-card mb-8">
        <h2 className="text-2xl font-bold mb-4">{part2Data.title}</h2>
        
        {part2Data.cues && Array.isArray(part2Data.cues) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">You should say:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {part2Data.cues.map((cue, index) => (
                <li key={index}>{cue}</li>
              ))}
            </ul>
          </div>
        )}
        
        {part2Data.final_question && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">{part2Data.final_question}</p>
          </div>
        )}
        
        {transcriptions.part2 && (
          <div className="transcription-area mt-6">
            <h3 className="transcription-label">Your Answer:</h3>
            <p className="transcription-text">{transcriptions.part2}</p>
          </div>
        )}
      </Card>
      
      <div className="text-center mb-8">
        <Button
          onClick={toggleRecordingHandler}
          disabled={isPreparationPhase}
          className={`mic-button-large ${
            isRecording.part2 ? 'recording' : ''
          } ${isPreparationPhase ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={isRecording.part2 ? "Stop recording" : "Start recording"}
        >
          {isRecording.part2 ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Recording
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {isPreparationPhase ? 'Preparing...' : 'Start Recording'}
            </>
          )}
        </Button>
      </div>
      
      <div className="text-center mb-16 animate-fade-in">
        <Button
          onClick={nextPart}
          className="nav-button px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-medium rounded-xl shadow-lg"
        >
          <span className="mr-2">Next: Part 3</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

// Part 3 Component
export const Part3 = ({ 
  testData, 
  transcriptions, 
  isRecording, 
  updateTranscription, 
  toggleRecording, 
  onBack 
}) => {
  const { isSupported, startRecognition } = useSpeechRecognition();
  const { getFeedback } = useSpeakingContext();
  const recognitionRef = useRef(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const startRecording = (questionIndex) => {
    // If already recording, stop the recognition
    if (isRecording.part3[questionIndex]) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('Speech recognition stopped');
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
        recognitionRef.current = null;
      }
      
      // Save the final transcript
      if (currentTranscript) {
        updateTranscription(3, questionIndex, currentTranscript);
      }
    } else {
      // Stop any existing recognition before starting a new one
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('Stopping previous speech recognition');
        } catch (error) {
          console.error('Error stopping previous speech recognition:', error);
        }
        recognitionRef.current = null;
      }
      
      // Start new recording
      if (!isSupported) {
        setError('Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari.');
        return;
      }
      
      // Reset current transcript
      setCurrentTranscript('');
      
      // Start speech recognition
      recognitionRef.current = startRecognition(
        // onResult callback
        (transcript) => {
          setCurrentTranscript(transcript);
          // Update in real-time
          updateTranscription(3, questionIndex, transcript);
        },
        // onError callback
        (errorMessage) => {
          setError(errorMessage);
          toggleRecording(3, questionIndex); // Turn off recording state
        }
      );
    }
    
    // Toggle recording state
    toggleRecording(3, questionIndex);
  };
  
  // Check if user has spoken in any part
  const hasSpoken = () => {
    const hasSpokenPart1 = transcriptions.part1.some(answer => answer.trim().length > 0);
    const hasSpokenPart2 = transcriptions.part2.trim().length > 0;
    const hasSpokenPart3 = transcriptions.part3.some(answer => answer.trim().length > 0);
    
    return hasSpokenPart1 || hasSpokenPart2 || hasSpokenPart3;
  };
  
  const handleGetFeedback = async () => {
    if (!hasSpoken()) {
      setError("You need to record at least one answer before getting feedback.");
      return;
    }
    
    try {
      // Call the context's getFeedback function to generate feedback
      await getFeedback();
    } catch (err) {
      setError(`Error generating feedback: ${err.message}`);
    }
  };
  
  // Get the questions from the test data
  const questions = testData?.Part3 || [];
  
  // Validate data before rendering
  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">No Questions Available</h2>
          <p className="text-yellow-600">Could not load Part 3 questions. Please try restarting the test.</p>
          <Button onClick={onBack} className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white">
            Return to Instructions
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => setError(null)} className="mt-2 text-sm bg-red-600 hover:bg-red-700 text-white">
            Dismiss
          </Button>
        </div>
      )}
      
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-bold mb-3" style={{
          background: "var(--primary-gradient)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent"
        }}>
          Speaking Test - Part 3
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Discuss more abstract ideas and issues. These questions are related to the topic in Part 2.
        </p>
      </div>
      
      <div className="space-y-8 mb-12">
        {questions.map((question, index) => (
          <div key={index} className="flex items-start gap-6 animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
            <Card className="p-8 speaking-question-card flex-1">
              <h2 className="text-xl font-semibold mb-4">{question}</h2>
              
              {transcriptions.part3[index] && (
                <div className="transcription-area">
                  <h3 className="transcription-label">Your Answer:</h3>
                  <p className="transcription-text">{transcriptions.part3[index]}</p>
                </div>
              )}
            </Card>
            
            <Button
              onClick={() => startRecording(index)}
              className={`mic-button ${
                isRecording.part3[index]
                  ? 'recording'
                  : ''
              }`}
              aria-label={isRecording.part3[index] ? "Stop recording" : "Start recording"}
            >
              {isRecording.part3[index] ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </Button>
          </div>
        ))}
      </div>
      
      <div className="text-center mb-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <Button
          onClick={handleGetFeedback}
          className="nav-button px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-medium rounded-xl shadow-lg"
        >
          <span className="mr-2">Get AI Feedback</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>
    </div>
  );
};