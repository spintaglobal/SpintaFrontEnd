import React, { useRef, useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { useToeflSpeakingContext } from './ToeflSpeakingContext';
import useToeflSpeechRecognition from './useToeflSpeechRecognition';
import './ToeflSpeaking.css';

const ToeflSpeakingTask = () => {
  const {
    testData,
    currentTaskIndex,
    nextTask,
    previousTask,
    transcriptions,
    isRecording,
    updateTranscription,
    startResponse,
    stopRecording,
    setIsRecording,
    getFeedback
  } = useToeflSpeakingContext();
  
  const { isSupported, startRecognition } = useToeflSpeechRecognition();
  const recognitionRef = useRef(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const currentTask = testData?.tasks[currentTaskIndex];
  
  // Handle recording toggle
  const toggleRecording = () => {
    if (isRecording) {
      stopRecordingFn();
    } else {
      startRecordingFn();
    }
  };
  
  // Start recording function
  const startRecordingFn = () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari.');
      return;
    }
    
    // Reset error
    setError(null);
    
    // Get existing transcript if available
    if (currentTask && transcriptions[currentTask.taskNumber]) {
      setCurrentTranscript(transcriptions[currentTask.taskNumber]);
    } else {
      setCurrentTranscript('');
    }
    
    // Start speech recognition
    recognitionRef.current = startRecognition(
      // onResult callback
      (transcript) => {
        setCurrentTranscript(transcript);
        // Update in real-time
        if (currentTask) {
          updateTranscription(currentTask.taskNumber, transcript);
        }
      },
      // onError callback
      (errorMessage) => {
        setError(errorMessage);
        setIsRecording(false);
      }
    );
    
    // Start the response in context
    startResponse();
  };
  
  // Stop recording function
  const stopRecordingFn = () => {
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
    if (currentTranscript && currentTask) {
      updateTranscription(currentTask.taskNumber, currentTranscript);
    }
    
    // Stop recording in context
    stopRecording();
  };
  
  // Update currentTranscript when changing tasks
  useEffect(() => {
    if (currentTask && transcriptions[currentTask.taskNumber]) {
      setCurrentTranscript(transcriptions[currentTask.taskNumber]);
    } else {
      setCurrentTranscript('');
    }
  }, [currentTaskIndex, transcriptions, currentTask]);
  
  // Stop recording when component unmounts
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  }, []);
  
  if (!currentTask) {
    return (
      <div className="error-container">
        <div className="error-icon">
          <span className="material-icons">error_outline</span>
        </div>
        <h2 className="error-title">Task Not Available</h2>
        <p className="error-message">
          The current task could not be loaded. Please try restarting the test.
        </p>
      </div>
    );
  }
  
  const renderTaskContent = () => {
    switch (currentTask.taskType) {
      case 'INDEPENDENT_SPEAKING_CHOICE':
        return (
          <div className="task-card">
            <div className="task-number">
              <span className="task-number-badge">{currentTask.taskNumber}</span>
              Task {currentTask.taskNumber} of {testData.tasks.length}
            </div>
            <h2 className="task-type">Independent Speaking Task</h2>
            <p className="task-prompt">{currentTask.prompt}</p>
          </div>
        );
      
      case 'INTEGRATED_SPEAKING_CAMPUS_SITUATION':
        return (
          <div className="task-card">
            <div className="task-number">
              <span className="task-number-badge">{currentTask.taskNumber}</span>
              Task {currentTask.taskNumber} of {testData.tasks.length}
            </div>
            <h2 className="task-type">Integrated Speaking: Campus Situation</h2>
            
            <div className="reading-section">
              <h3 className="reading-title">{currentTask.readingPassage.title}</h3>
              <p className="reading-content">{currentTask.readingPassage.content}</p>
            </div>
            
            <div className="listening-section">
              <h3 className="listening-title">{currentTask.listeningPassage.title}</h3>
              <p className="listening-content">{currentTask.listeningPassage.conversation}</p>
            </div>
            
            <div className="question-section">
              <h3 className="question-title">Question</h3>
              <p className="question-content">{currentTask.question}</p>
            </div>
          </div>
        );
      
      case 'INTEGRATED_SPEAKING_ACADEMIC_COURSE_CONCEPT':
        return (
          <div className="task-card">
            <div className="task-number">
              <span className="task-number-badge">{currentTask.taskNumber}</span>
              Task {currentTask.taskNumber} of {testData.tasks.length}
            </div>
            <h2 className="task-type">Integrated Speaking: Academic Course Concept</h2>
            
            <div className="reading-section">
              <h3 className="reading-title">{currentTask.readingPassage.title}</h3>
              <p className="reading-content">{currentTask.readingPassage.content}</p>
            </div>
            
            <div className="listening-section">
              <h3 className="listening-title">{currentTask.listeningPassage.title}</h3>
              <p className="listening-content">{currentTask.listeningPassage.lectureContent}</p>
            </div>
            
            <div className="question-section">
              <h3 className="question-title">Question</h3>
              <p className="question-content">{currentTask.question}</p>
            </div>
          </div>
        );
      
      case 'INTEGRATED_SPEAKING_ACADEMIC_READING_SUMMARY':
      case 'INTEGRATED_SPEAKING_ACADEMIC_LECTURE_SUMMARY':
        // Handle both API response format (lecture) and our modified version (reading)
        return (
          <div className="task-card">
            <div className="task-number">
              <span className="task-number-badge">{currentTask.taskNumber}</span>
              Task {currentTask.taskNumber} of {testData.tasks.length}
            </div>
            <h2 className="task-type">Integrated Speaking: Academic Summary</h2>
            
            {/* Display reading section if it exists, otherwise display listening as reading */}
            {currentTask.readingPassage ? (
              <div className="reading-section">
                <h3 className="reading-title">{currentTask.readingPassage.title}</h3>
                <p className="reading-content">{currentTask.readingPassage.content}</p>
              </div>
            ) : currentTask.listeningPassage && (
              <div className="reading-section">
                <h3 className="reading-title">{currentTask.listeningPassage.title}</h3>
                <p className="reading-content">{currentTask.listeningPassage.lectureContent}</p>
              </div>
            )}
            
            <div className="question-section">
              <h3 className="question-title">Question</h3>
              <p className="question-content">{currentTask.question}</p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="error-container">
            <p className="error-message">Unknown task type: {currentTask.taskType}</p>
          </div>
        );
    }
  };
  
  return (
    <div className="toefl-speaking-container">
      <div className="speaking-header">
        <h1 className="speaking-title">TOEFL iBT Speaking Practice</h1>
      </div>
      
      <div className="container mx-auto px-4 pb-12">
        {renderTaskContent()}
        
        <div className="mt-8 flex flex-col items-center">
          {/* Recording Controls */}
          <div className="recording-controls mb-4">
            {!isRecording ? (
              <button
                className="recording-button"
                onClick={startRecordingFn}
                aria-label="Start recording"
              >
                <span className="material-icons">mic</span>
                <span className="ml-2">Record</span>
              </button>
            ) : (
              <button
                className="recording-button recording"
                onClick={stopRecordingFn}
                aria-label="Stop recording"
              >
                <span className="material-icons">stop</span>
                <span className="ml-2">Stop Recording</span>
              </button>
            )}
            
            <div className={`recording-status ${isRecording ? 'recording' : ''}`}>
              {isRecording ? 'Recording in progress...' : 'Click Record to start speaking'}
            </div>
          </div>
          
          {/* Transcription Area */}
          <div className="transcription-area w-full max-w-3xl">
            <div className="transcription-label">Your Response:</div>
            <div className="transcription-text min-h-[100px]">
              {currentTask && transcriptions[currentTask.taskNumber] ? 
                transcriptions[currentTask.taskNumber] : 
                "Your response will appear here as you speak..."}
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-600">
              <p className="flex items-center">
                <span className="material-icons mr-2 text-sm">error_outline</span>
                {error}
              </p>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="action-buttons mt-8 flex space-x-4">
            <Button 
              onClick={previousTask} 
              disabled={currentTaskIndex === 0}
              className="action-button"
              variant="outline"
            >
              <span className="material-icons mr-1">arrow_back</span>
              Previous
            </Button>
            
            {currentTaskIndex < testData.tasks.length - 1 ? (
              <Button 
                onClick={nextTask} 
                className="action-button"
                variant="default"
              >
                Next
                <span className="material-icons ml-1">arrow_forward</span>
              </Button>
            ) : (
              <Button 
                onClick={getFeedback} 
                className="action-button finish-button"
                variant="default"
              >
                Finish & Get Feedback
                <span className="material-icons ml-1">check_circle</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToeflSpeakingTask; 