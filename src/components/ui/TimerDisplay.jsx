import React from 'react';
import { useTimer } from '../../lib/TimerContext';

const TimerDisplay = () => {
  const { timeRemaining, showStaticTimer } = useTimer();
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate colors based on time remaining
  const getTimerColor = () => {
    if (timeRemaining <= 300) return 'text-red-600'; // Last 5 minutes: red
    if (timeRemaining <= 600) return 'text-amber-600'; // Last 10 minutes: amber
    return 'text-blue-600'; // Normal: blue
  };

  return (
    <div className={`flex items-center bg-white shadow-md rounded-full px-4 py-2 ${getTimerColor()} border-2 border-current`}>
      <span className="material-icons mr-2">timer</span>
      <span className="font-bold text-lg">
        {showStaticTimer ? '60:00' : formatTime(timeRemaining)}
      </span>
    </div>
  );
};

export default TimerDisplay; 