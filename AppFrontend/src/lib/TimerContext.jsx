import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TimerContext = createContext();

export const useTimer = () => useContext(TimerContext);

export const TimerProvider = ({ children }) => {
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes in seconds
  const [examSection, setExamSection] = useState(null); // 'reading' or 'writing'
  const [timerStarted, setTimerStarted] = useState(false); // New state to track if timer has been manually started
  const location = useLocation();
  
  // Determine if we're on an exam page
  const isReadingExam = location.pathname.includes('/reading/exam');
  // Writing exam is only active after we've manually started the timer (not on instructions page)
  const isWritingExam = location.pathname.includes('/writing') && !location.pathname.includes('/skills') && timerStarted;
  const isExamActive = isReadingExam || isWritingExam;
  
  // Show timer on instructions pages but don't run it
  const isWritingInstructions = location.pathname.includes('/writing') && !location.pathname.includes('/skills') && !timerStarted;
  const isReadingInstructions = location.pathname.includes('/reading') && !location.pathname.includes('/exam');
  const showStaticTimer = isWritingInstructions || isReadingInstructions;
  
  // Set exam section based on path
  useEffect(() => {
    if (isReadingExam) {
      setExamSection('reading');
    } else if (isWritingExam || isWritingInstructions) {
      setExamSection('writing');
    } else {
      setExamSection(null);
    }
  }, [isReadingExam, isWritingExam, isWritingInstructions]);
  
  // Reset timer and timer state when navigating away
  const resetTimer = () => {
    setTimeRemaining(60 * 60);
    setTimerStarted(false);
  };
  
  // Start timer for a specific exam section
  const startTimer = (section) => {
    setExamSection(section);
    setTimerStarted(true);
  };
  
  // Stop timer
  const stopTimer = () => {
    setTimerStarted(false);
  };

  // Timer countdown effect
  useEffect(() => {
    let interval;
    
    if (isExamActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Time's up logic handled by components
    }
    
    return () => clearInterval(interval);
  }, [isExamActive, timeRemaining]);

  return (
    <TimerContext.Provider
      value={{
        isExamActive,
        showStaticTimer,
        timeRemaining,
        examSection,
        startTimer,
        stopTimer,
        resetTimer,
        timerStarted,
        setTimerStarted
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}; 