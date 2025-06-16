import React, { useEffect } from 'react';

const TimeUpModal = ({ onSubmit }) => {
  // Auto-submit after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onSubmit();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onSubmit]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-pulse">
        <div className="text-red-600 mb-4 text-center">
          <span className="material-icons text-6xl">timer_off</span>
        </div>
        <h3 className="text-2xl font-bold text-center mb-4">Time's Up!</h3>
        <p className="text-gray-700 mb-6 text-center">
          Your 60 minutes for the exam have ended. Your answers will be submitted automatically in <span className="font-bold">5</span> seconds.
        </p>
        <div className="flex justify-center">
          <button
            onClick={onSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Submit Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeUpModal; 