import React, { useRef, useState } from 'react';
import { useSpeakingContext } from './SpeakingContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import useSpeechRecognition from './useSpeechRecognition';
import './speaking.css';

// Part 1 Component
export const Part1 = () => {
  const {
    testData,
    nextPart,
    transcriptions,
    isRecording,
    updateTranscription,
    toggleRecording,
    setError
  } = useSpeakingContext();
  
  const { isSupported, startRecognition } = useSpeechRecognition();
  const recognitionRef = useRef(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
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
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto">
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
export const Part2 = () => {
  const {
    testData,
    nextPart,
    transcriptions,
    isRecording,
    updateTranscription,
    toggleRecording,
    setError
  } = useSpeakingContext();
  
  const { isSupported, startRecognition } = useSpeechRecognition();
  const recognitionRef = useRef(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const toggleRecordingHandler = () => {
    // If already recording, stop the recognition
    if (isRecording.part2) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('Speech recognition stopped for Part 2');
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
  
  // Get the Part 2 data from the test data
  const part2Data = testData?.Part2 || {
    title: "No topic available",
    cues: [],
    final_question: ""
  };
  
  // Validate data before rendering
  if (!part2Data.title || !Array.isArray(part2Data.cues) || part2Data.cues.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Invalid Data</h2>
          <p className="text-yellow-600">Could not load Part 2 question data. Please try restarting the test.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-bold mb-3" style={{
          background: "var(--primary-gradient)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent"
        }}>
          Speaking Test - Part 2
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          You will be given a topic to talk about for 1-2 minutes. You have 1 minute to prepare your response.
        </p>
      </div>
      
      <div className="animate-scale-in" style={{ animationDelay: "0.3s" }}>
        <Card className="p-8 mb-10 speaking-question-card cue-card">
          <h2 className="text-2xl font-bold mb-8 text-center">{part2Data.title}</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-indigo-800">You should say:</h3>
            <ul className="space-y-3">
              {part2Data.cues.map((cue, index) => (
                <li key={index} className="cue-item">{cue}</li>
              ))}
            </ul>
          </div>
          
          {part2Data.final_question && (
            <p className="text-lg font-medium text-indigo-700 mb-8 italic">{part2Data.final_question}</p>
          )}
          
          <div className="flex justify-center mt-10">
            <Button
              onClick={toggleRecordingHandler}
              className={`flex items-center justify-center rounded-full w-24 h-24 mic-button-large ${
                isRecording.part2
                  ? 'recording'
                  : ''
              }`}
              aria-label={isRecording.part2 ? "Stop recording" : "Start recording"}
            >
              {isRecording.part2 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </Button>
          </div>
          <p className="text-center text-indigo-600 font-medium mt-4">
            {isRecording.part2 ? "Recording in progress..." : "Click the microphone to begin speaking"}
          </p>
        </Card>
      </div>
      
      {transcriptions.part2 && (
        <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Card className="p-8 mb-10 speaking-question-card">
            <h3 className="text-xl font-semibold mb-4 text-indigo-800">Your Response:</h3>
            <div className="transcription-area">
              <p className="transcription-text">{transcriptions.part2}</p>
            </div>
          </Card>
        </div>
      )}
      
      <div className="text-center mb-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
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
export const Part3 = () => {
  const {
    testData,
    transcriptions,
    isRecording,
    updateTranscription,
    toggleRecording,
    getFeedback,
    setError
  } = useSpeakingContext();
  
  const { isSupported, startRecognition } = useSpeechRecognition();
  const recognitionRef = useRef(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const startRecording = (questionIndex) => {
    // If already recording, stop the recognition
    if (isRecording.part3[questionIndex]) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('Speech recognition stopped for Part 3');
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
  
  // Get the questions from the test data
  const questions = testData?.Part3 || [];
  
  // Validate data before rendering
  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">No Questions Available</h2>
          <p className="text-yellow-600">Could not load Part 3 questions. Please try restarting the test.</p>
        </div>
      </div>
    );
  }
  
  const hasSpoken = () => {
    return transcriptions.part1.some(text => text.trim() !== "") || 
           transcriptions.part2.trim() !== "" || 
           transcriptions.part3.some(text => text.trim() !== "");
  };
  
  return (
    <div className="max-w-5xl mx-auto">
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
          Answer the following questions related to the topic from Part 2. These questions will be more abstract and require deeper analysis.
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
          onClick={getFeedback}
          disabled={!hasSpoken()}
          className={`nav-button px-10 py-4 text-white text-lg font-medium rounded-xl shadow-lg ${!hasSpoken() ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Complete Test & Get Feedback
        </Button>
        <p className="mt-4 text-slate-600 text-sm">
          {!hasSpoken() ? 
            "Please record at least one answer before completing the test." : 
            "Click the button above to complete the test and get AI feedback on your performance."}
        </p>
      </div>
    </div>
  );
};

// Default export for backward compatibility if needed
export default {
  Part1,
  Part2,
  Part3
};