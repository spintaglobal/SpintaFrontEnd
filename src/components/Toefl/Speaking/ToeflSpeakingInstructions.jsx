import React from 'react';
import { Button } from '../../ui/button';
import { useToeflSpeakingContext } from './ToeflSpeakingContext';
import './ToeflSpeaking.css';

const ToeflSpeakingInstructions = () => {
  const { startTest, usingFallback, showCountdown, countdownNumber } = useToeflSpeakingContext();
  
  const handleStartTest = () => {
    startTest();
  };
  
  // Show countdown animation when starting test
  if (showCountdown) {
    return (
      <div className="instructions-container">
        <div className="speaking-header">
          <h1 className="speaking-title">TOEFL iBT Speaking Practice</h1>
        </div>
        
        <div className="flex flex-col justify-center items-center h-[600px] text-center">
          {/* Main heading with enhanced styling */}
          <h2 className="text-4xl font-bold text-gradient mb-12">
            <span className="breath-text">Take a deep breath</span>
          </h2>
          
          {/* Enhanced countdown animation container */}
          <div className="countdown-animation">
            {/* Floating particles background */}
            <div className="particles-container">
              {[...Array(15)].map((_, index) => (
                <div 
                  key={`particle-${index}`}
                  className="floating-particle"
                  style={{ 
                    '--delay': `${Math.random() * 5}s`,
                    '--duration': `${5 + Math.random() * 10}s`,
                    '--x-start': `${Math.random() * 100}%`,
                    '--x-end': `${Math.random() * 100}%`,
                    '--y-start': `${Math.random() * 100}%`,
                    '--y-end': `${Math.random() * 100}%`,
                    '--size': `${Math.random() * 10 + 5}px`,
                    '--opacity': Math.random() * 0.5 + 0.2
                  }}
                />
              ))}
            </div>
            
            {/* Animated circles */}
            <div className="countdown-ring countdown-ring-1">
              {[...Array(8)].map((_, index) => {
                const angle = (index / 8) * 2 * Math.PI;
                const x = 110 * Math.cos(angle);
                const y = 110 * Math.sin(angle);
                
                return (
                  <div 
                    key={`dot1-${index}`}
                    className="countdown-dot"
                    style={{ 
                      left: `calc(50% + ${x}px)`, 
                      top: `calc(50% + ${y}px)`,
                      opacity: 0.8,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                );
              })}
            </div>
            
            <div className="countdown-ring countdown-ring-2">
              {[...Array(12)].map((_, index) => {
                const angle = (index / 12) * 2 * Math.PI;
                const x = 80 * Math.cos(angle);
                const y = 80 * Math.sin(angle);
                
                return (
                  <div 
                    key={`dot2-${index}`}
                    className="countdown-dot"
                    style={{ 
                      left: `calc(50% + ${x}px)`, 
                      top: `calc(50% + ${y}px)`,
                      opacity: 0.6,
                      transform: 'translate(-50%, -50%)',
                      width: '8px',
                      height: '8px'
                    }}
                  />
                );
              })}
            </div>
            
            {/* Central countdown number */}
            <div className="countdown-center">
              {countdownNumber > 0 ? (
                <div className="countdown-number">{countdownNumber}</div>
              ) : (
                <div className="countdown-go">GO!</div>
              )}
            </div>
          </div>
          
          <div className="countdown-message" style={{ animationDelay: '0.3s' }}>
            {countdownNumber > 0 
              ? "Preparing your speaking test..."
              : "Your test is ready - good luck!"
            }
          </div>
          
          {/* Breathing guide animation */}
          <div className="breathing-guide">
            <div className="breathing-circle" style={{ 
              animationDuration: `${countdownNumber > 0 ? '4s' : '0s'}`
            }}></div>
            <p className="breathing-text">
              {countdownNumber > 0 ? "Breathe in... and out..." : "Get ready to speak"}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="instructions-container">
      <div className="speaking-header">
        <h1 className="speaking-title">TOEFL iBT Speaking Practice</h1>
        <p className="speaking-subtitle">
          Enhance your speaking skills with authentic TOEFL iBT speaking tasks
        </p>
      </div>
      
      <div className="instructions-card">
        <h2 className="instructions-title">About the TOEFL iBT Speaking Section</h2>
        
        <div className="my-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-700">
            The Speaking section assesses your ability to communicate effectively in English 
            in academic situations. You'll record responses to 4 tasks that are evaluated
            on delivery, language use, and topic development.
          </p>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Task Types:</h3>
        
        <ul className="task-list mb-6">
          <li>Task 1: Independent Speaking - Express your opinion on a familiar topic</li>
          <li>Task 2: Campus Situation - Read a passage and respond to a question</li>
          <li>Task 3: Academic Course - Read about an academic concept and explain it</li>
          <li>Task 4: Academic Summary - Read a passage and summarize key points</li>
        </ul>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-3">How This Practice Works:</h3>
        
        <ul className="instructions-list">
          <li>
            <div className="instruction-number">1</div>
            <div className="instruction-text">
              You'll see a task prompt to read and understand
            </div>
          </li>
          <li>
            <div className="instruction-number">2</div>
            <div className="instruction-text">
              Click "Record" to begin recording your answer
            </div>
          </li>
          <li>
            <div className="instruction-number">3</div>
            <div className="instruction-text">
              Click "Stop Recording" when you're finished speaking
            </div>
          </li>
          <li>
            <div className="instruction-number">4</div>
            <div className="instruction-text">
              Complete all tasks to receive detailed AI feedback
            </div>
          </li>
        </ul>
        
        <div className="text-center mt-6">
          <Button 
            className="start-button"
            onClick={handleStartTest}
          >
            <span className="material-icons mr-2">mic</span>
            Start Speaking Test
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ToeflSpeakingInstructions; 