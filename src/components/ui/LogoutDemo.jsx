import React, { useState } from 'react';
import LogoutSuccessExperience from './LogoutSuccessExperience.jsx';

const LogoutDemo = () => {
  const [showLogout, setShowLogout] = useState(false);

  const triggerLogout = () => {
    setShowLogout(true);
  };

  const handleClose = () => {
    setShowLogout(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">
          Modern Logout Experience Demo
        </h1>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          Click the button below to experience the new Gen Z-friendly logout animation
        </p>
        <button
          onClick={triggerLogout}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
        >
          🚪 Trigger Logout Experience
        </button>
        
        <div className="mt-8 text-sm text-gray-400">
          <p>Features:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Random Gen Z messages</li>
            <li>Animated teardrops and sparkles</li>
            <li>Interactive "jk come back" button</li>
            <li>Glassmorphism effects</li>
            <li>Mobile-responsive design</li>
          </ul>
        </div>
      </div>

      <LogoutSuccessExperience 
        isVisible={showLogout} 
        onClose={handleClose} 
      />
    </div>
  );
};

export default LogoutDemo; 