import React from 'react';
import TimerDisplay from './TimerDisplay';

/**
 * ExamContainer - A component that wraps exam pages and ensures the timer is always visible
 * Use this container for any exam page to guarantee the timer displays correctly
 */
const ExamContainer = ({ children }) => {
  return (
    <div className="exam-container">
      {/* Always render timer at top level to ensure visibility, centered vertically */}
      <div className="timer-container" style={{ position: 'relative', zIndex: 10000 }}>
        <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 10000 }}>
          <TimerDisplay />
        </div>
      </div>
      
      {/* Render the actual exam content */}
      {children}
    </div>
  );
};

export default ExamContainer; 