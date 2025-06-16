import React from 'react';
import { Button } from '../../ui/button';
import { useToeflReadingContext } from './ToeflReadingContext';
import './ToeflReading.css';

const ToeflReadingInstructions = () => {
  const { startTest, usingFallback, showCountdown, countdownNumber } = useToeflReadingContext();
  
  const handleStartTest = () => {
    startTest();
  };
  
  // Show countdown animation when starting test
  if (showCountdown) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              TOEFL iBT
            </span>
            <br />
            <span className="text-white/90">Reading Practice</span>
          </h1>
        </div>
        
        <div className="flex flex-col justify-center items-center h-[600px] text-center">
          {/* Main heading with enhanced styling */}
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-12">
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
          
          <div className="text-white/70 text-lg mt-8" style={{ animationDelay: '0.3s' }}>
            {countdownNumber > 0 
              ? "Preparing your reading test..."
              : "Your test is ready - good luck!"
            }
          </div>
          
          {/* Breathing guide animation */}
          <div className="breathing-guide mt-8">
            <div className="breathing-circle" style={{ 
              animationDuration: `${countdownNumber > 0 ? '4s' : '0s'}`
            }}></div>
            <p className="text-white/60 text-sm mt-4">
              {countdownNumber > 0 ? "Breathe in... and out..." : "Focus on your reading"}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mb-6 shadow-xl">
              <span className="material-icons text-white text-3xl">article</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                TOEFL iBT
              </span>
              <br />
              <span className="text-white/90">Reading Practice</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Enhance your reading comprehension skills with authentic TOEFL iBT passages
            </p>
            {usingFallback && (
              <div className="mt-4 inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/30 px-4 py-2 rounded-xl backdrop-blur-sm">
                <span className="material-icons text-amber-400 text-sm">info</span>
                <span className="text-amber-200 text-sm font-medium">Using offline test data</span>
              </div>
            )}
          </div>
          
          {/* Instructions Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Test Instructions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-icons text-cyan-400">article</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Test Structure</h3>
                <p className="text-white/70 text-sm leading-relaxed">Read <strong className="text-white">2 passages</strong> and answer <strong className="text-white">10 questions each</strong> (20 total).</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-icons text-blue-400">schedule</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Time Management</h3>
                <p className="text-white/70 text-sm leading-relaxed"><strong className="text-white">35 minutes</strong> total. Manage your time carefully.</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-icons text-purple-400">navigation</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Navigation</h3>
                <p className="text-white/70 text-sm leading-relaxed">Navigate <strong className="text-white">back and forth</strong> through questions.</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-icons text-emerald-400">quiz</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Question Types</h3>
                <p className="text-white/70 text-sm leading-relaxed"><strong className="text-white">Multiple-choice</strong> with various formats.</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-icons text-pink-400">rate_review</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Review Feature</h3>
                <p className="text-white/70 text-sm leading-relaxed">Click <strong className="text-white">"Review"</strong> to check answers.</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-icons text-orange-400">score</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Scoring</h3>
                <p className="text-white/70 text-sm leading-relaxed">Receive <strong className="text-white">immediate feedback</strong> after completion.</p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={handleStartTest}
              className="group inline-flex items-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold text-lg"
            >
              <span className="material-icons text-2xl group-hover:scale-110 transition-transform duration-300">play_arrow</span>
              <span>Start Reading Test</span>
              <span className="material-icons text-lg group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToeflReadingInstructions; 