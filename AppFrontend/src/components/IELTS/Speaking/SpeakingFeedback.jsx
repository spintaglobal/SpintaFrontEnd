import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { feedbackPrompt } from './prompt.js';
import { useSpeakingContext } from './SpeakingContext';
import './speaking.css';

// Enhanced Radar chart component
const RadarChart = ({ scores }) => {
  const { fluency, vocabulary, grammar } = scores;
  const size = 280;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;
  
  // Convert scores to coordinates
  const getCoordinates = (score, angle) => {
    const radians = angle * (Math.PI / 180);
    const distance = (score / 9) * radius; // Normalize to 0-9 scale
    return {
      x: centerX + distance * Math.cos(radians),
      y: centerY + distance * Math.sin(radians)
    };
  };
  
  const fluencyPoint = getCoordinates(fluency, 0);
  const vocabPoint = getCoordinates(vocabulary, 120);
  const grammarPoint = getCoordinates(grammar, 240);
  
  const polygonPoints = `${fluencyPoint.x},${fluencyPoint.y} ${vocabPoint.x},${vocabPoint.y} ${grammarPoint.x},${grammarPoint.y}`;
  
  return (
    <svg width={size} height={size} className="mx-auto radar-chart-container">
      {/* Background circles */}
      {[0.25, 0.5, 0.75, 1].map((factor, i) => (
        <circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={radius * factor}
          className="radar-chart-circle"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
      
      {/* Axis lines */}
      <line
        x1={centerX}
        y1={centerY}
        x2={centerX + radius}
        y2={centerY}
        className="radar-chart-axis"
      />
      <line
        x1={centerX}
        y1={centerY}
        x2={centerX + radius * Math.cos(120 * (Math.PI / 180))}
        y2={centerY + radius * Math.sin(120 * (Math.PI / 180))}
        className="radar-chart-axis"
      />
      <line
        x1={centerX}
        y1={centerY}
        x2={centerX + radius * Math.cos(240 * (Math.PI / 180))}
        y2={centerY + radius * Math.sin(240 * (Math.PI / 180))}
        className="radar-chart-axis"
      />
      
      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        className="radar-chart-polygon animate-scale-in"
        style={{ animationDelay: "0.3s" }}
      />
      
      {/* Data points */}
      <circle
        cx={fluencyPoint.x}
        cy={fluencyPoint.y}
        r="8"
        className="radar-chart-point animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />
      <circle
        cx={vocabPoint.x}
        cy={vocabPoint.y}
        r="8"
        className="radar-chart-point animate-pulse"
        style={{ fill: "var(--secondary-color)", animationDelay: "0.7s" }}
      />
      <circle
        cx={grammarPoint.x}
        cy={grammarPoint.y}
        r="8"
        className="radar-chart-point animate-pulse"
        style={{ fill: "var(--accent-color)", animationDelay: "0.9s" }}
      />
      
      {/* Labels with background for better visibility */}
      <g>
        {/* Fluency label */}
        <rect
          x={centerX + radius + 10}
          y={centerY - 10}
          width={70}
          height={20}
          rx={5}
          fill="white"
          fillOpacity="0.9"
        />
        <text
          x={centerX + radius + 15}
          y={centerY + 5}
          className="radar-chart-label"
          style={{
            fill: "var(--primary-color)",
            fontWeight: "700"
          }}
        >
          Fluency
        </text>
      </g>
      
      <g>
        {/* Vocabulary label */}
        <rect
          x={centerX + (radius * Math.cos(120 * (Math.PI / 180))) + 10}
          y={centerY + (radius * Math.sin(120 * (Math.PI / 180))) - 10}
          width={90}
          height={20}
          rx={5}
          fill="white"
          fillOpacity="0.9"
        />
        <text
          x={centerX + (radius * Math.cos(120 * (Math.PI / 180))) + 15}
          y={centerY + (radius * Math.sin(120 * (Math.PI / 180))) + 5}
          className="radar-chart-label"
          style={{
            fill: "var(--secondary-color)",
            fontWeight: "700"
          }}
        >
          Vocabulary
        </text>
      </g>
      
      <g>
        {/* Grammar label */}
        <rect
          x={centerX + (radius * Math.cos(240 * (Math.PI / 180))) - 75}
          y={centerY + (radius * Math.sin(240 * (Math.PI / 180))) - 10}
          width={70}
          height={20}
          rx={5}
          fill="white"
          fillOpacity="0.9"
        />
        <text
          x={centerX + (radius * Math.cos(240 * (Math.PI / 180))) - 70}
          y={centerY + (radius * Math.sin(240 * (Math.PI / 180))) + 5}
          className="radar-chart-label"
          style={{
            fill: "var(--accent-color)",
            fontWeight: "700"
          }}
        >
          Grammar
        </text>
      </g>
    </svg>
  );
};

// Enhanced Feedback card component
const FeedbackCard = ({ title, color, icon, children, delay = 0 }) => {
  const colorMap = {
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      icon: "bg-indigo-100 text-indigo-600",
      title: "text-indigo-800"
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "bg-purple-100 text-purple-600",
      title: "text-purple-800"
    },
    pink: {
      bg: "bg-pink-50",
      border: "border-pink-200",
      icon: "bg-pink-100 text-pink-600",
      title: "text-pink-800"
    }
  };
  
  const colors = colorMap[color] || colorMap.indigo;
  
  return (
    <div className="animate-fade-in" style={{ animationDelay: `${delay}s` }}>
      <Card className={`p-8 ${colors.bg} ${colors.border} border-2 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
        <div className="flex items-center mb-6">
          <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center mr-4 shadow-lg`}>
            <span className="material-icons text-xl">{icon}</span>
          </div>
          <h3 className={`text-2xl font-bold ${colors.title}`}>{title}</h3>
        </div>
        <div className="text-gray-700 leading-relaxed">
          {children}
        </div>
      </Card>
    </div>
  );
};

// Enhanced Skill meter component
const SkillMeter = ({ value, color, label, delay = 0 }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, delay * 1000 + 500);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  const percentage = (animatedValue / 9) * 100;
  
  const colorMap = {
    indigo: "from-indigo-500 to-indigo-600",
    purple: "from-purple-500 to-purple-600",
    pink: "from-pink-500 to-pink-600"
  };
  
  return (
    <div className="animate-fade-in" style={{ animationDelay: `${delay}s` }}>
      <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">{label}</h4>
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${percentage * 2.51} 251`}
              className={`text-${color}-500 transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">{animatedValue.toFixed(1)}</span>
          </div>
        </div>
        <div className="text-sm text-gray-600">out of 9.0</div>
      </div>
    </div>
  );
};

const SpeakingFeedback = ({ testData, transcriptions, onBack }) => {
  const { feedback, feedbackLoading, error: contextError } = useSpeakingContext();
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [progressPercentage, setProgressPercentage] = useState(0);
  
  // Set up the progress animation when feedbackLoading changes
  useEffect(() => {
    let progressTimer = null;
    
    if (feedbackLoading) {
      setProgressPercentage(0);
      progressTimer = setInterval(() => {
        setProgressPercentage(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return prev + 1;
        });
      }, 100); // 100ms * 100 steps = 10 seconds
    } else {
      setProgressPercentage(100);
    }
    
    return () => {
      if (progressTimer) {
        clearInterval(progressTimer);
      }
    };
  }, [feedbackLoading]);

  // Set error from context if it exists
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError]);

  if (feedbackLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 p-8">
        <div className="text-center">
          {/* Enhanced loading animation */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-indigo-300 border-opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-purple-500 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
            
            {/* Inner pulsing circle */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-80 animate-pulse"></div>
            
            {/* AI brain icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white animate-bounce" style={{ animationDuration: '2s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <div className="animate-fade-in">
            <h3 className="text-3xl font-bold text-white mb-3">Analyzing Your Performance</h3>
            <p className="text-indigo-200 text-lg mb-4">Please be patient while we fetch your results...</p>
            
            {/* Progress bar */}
            <div className="max-w-md mx-auto bg-indigo-900 bg-opacity-50 rounded-full h-2.5 mb-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-400 to-purple-400 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%`, transition: 'width 0.5s ease-in-out' }}
              ></div>
            </div>
            
            <p className="text-indigo-300 text-sm">
              Connecting to Gemini AI model for detailed feedback
              <span className="inline-block animate-ellipsis-1">.</span>
              <span className="inline-block animate-ellipsis-2">.</span>
              <span className="inline-block animate-ellipsis-3">.</span>
            </p>
            <p className="text-indigo-300 text-xs mt-2 opacity-80">This may take up to 10 seconds</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[80vh]">
        <div className="animate-fade-in max-w-md w-full">
          <Card className="p-8 bg-red-50 border border-red-200 shadow-xl rounded-xl overflow-hidden">
            <div className="text-center text-red-500 mb-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-red-100 rounded-full"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-4 text-center">Error Occurred</h2>
            <p className="text-red-700 mb-8 text-center text-lg">{error}</p>
            <div className="flex justify-center">
              <Button
                onClick={onBack}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 text-lg font-medium"
              >
                Back to Instructions
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[80vh]">
        <div className="animate-fade-in max-w-md w-full">
          <Card className="p-8 bg-amber-50 border border-amber-200 shadow-xl rounded-xl overflow-hidden">
            <div className="text-center text-amber-500 mb-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-amber-100 rounded-full"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-amber-800 mb-4 text-center">No Feedback Available</h2>
            <p className="text-amber-700 mb-8 text-center text-lg">Please complete the speaking test to receive feedback.</p>
            <div className="flex justify-center">
              <Button
                onClick={onBack}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 text-lg font-medium"
              >
                Back to Instructions
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Extract feedback data
  const {
    overallFeedback,
    fluencyAndCoherence,
    lexicalResource,
    grammaticalRangeAndAccuracy,
    scoreBand,
    improvementRecommendations
  } = feedback;
  
  // Calculate numeric scores for the radar chart and skill meters
  // Parse the score band range (e.g., "7.0 to 8.0") or single score
  let baseScore = 6.0; // default
  if (scoreBand) {
    if (scoreBand.includes(' to ')) {
      // Handle range format like "7.0 to 8.0"
      const scores = scoreBand.split(' to ').map(s => parseFloat(s.trim()));
      baseScore = (scores[0] + scores[1]) / 2; // Average of the range
    } else {
      // Handle single score
      baseScore = parseFloat(scoreBand);
    }
  }
  
  // Ensure scores are between 0 and 9, and add some variation
  const fluencyScore = Math.min(Math.max(baseScore + (Math.random() - 0.5) * 0.5, 1), 9);
  const vocabularyScore = Math.min(Math.max(baseScore + (Math.random() - 0.5) * 0.5, 1), 9);
  const grammarScore = Math.min(Math.max(baseScore + (Math.random() - 0.5) * 0.5, 1), 9);
  
  const radarScores = {
    fluency: fluencyScore,
    vocabulary: vocabularyScore,
    grammar: grammarScore
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with score */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-3" style={{
            background: "var(--primary-gradient)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent"
          }}>
            Speaking Assessment Results
          </h1>
          <p className="text-xl text-indigo-600 mb-10 max-w-2xl mx-auto">
            Detailed assessment of your speaking performance
          </p>
          
          <div className="inline-block animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <div className="score-display">
              <h2>Estimated Range</h2>
              <div className="flex items-center justify-center">
                <span className="score-value">{scoreBand}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-10 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="tab-navigation">
            <button
              onClick={() => setActiveTab('overview')}
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`tab-button ${activeTab === 'detailed' ? 'active' : ''}`}
            >
              Detailed Analysis
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Radar Chart and Skill Meters */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
                <h3 className="text-2xl font-bold text-center mb-8 text-indigo-800">Performance Overview</h3>
                <RadarChart scores={radarScores} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <SkillMeter value={fluencyScore} color="indigo" label="Fluency" delay={0.9} />
                <SkillMeter value={vocabularyScore} color="purple" label="Vocabulary" delay={1.1} />
                <SkillMeter value={grammarScore} color="pink" label="Grammar" delay={1.3} />
              </div>
            </div>

            {/* Overall Feedback */}
            <FeedbackCard title="Overall Assessment" color="indigo" icon="assessment" delay={1.5}>
              <p className="text-lg leading-relaxed">{overallFeedback}</p>
            </FeedbackCard>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="space-y-8">
            <FeedbackCard title="Fluency and Coherence" color="indigo" icon="record_voice_over" delay={0.7}>
              {fluencyAndCoherence?.strengths && (
                <div className="mb-4">
                  <h4 className="font-semibold text-green-700 mb-2">✓ Strengths:</h4>
                  <p className="text-lg leading-relaxed text-green-600">{fluencyAndCoherence.strengths}</p>
                </div>
              )}
              {fluencyAndCoherence?.areasForImprovement && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">→ Areas for Improvement:</h4>
                  <p className="text-lg leading-relaxed text-orange-600">{fluencyAndCoherence.areasForImprovement}</p>
                </div>
              )}
              {!fluencyAndCoherence?.strengths && !fluencyAndCoherence?.areasForImprovement && (
                <p className="text-lg leading-relaxed">{fluencyAndCoherence}</p>
              )}
            </FeedbackCard>
            
            <FeedbackCard title="Lexical Resource (Vocabulary)" color="purple" icon="library_books" delay={0.9}>
              {lexicalResource?.strengths && (
                <div className="mb-4">
                  <h4 className="font-semibold text-green-700 mb-2">✓ Strengths:</h4>
                  <p className="text-lg leading-relaxed text-green-600">{lexicalResource.strengths}</p>
                </div>
              )}
              {lexicalResource?.areasForImprovement && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">→ Areas for Improvement:</h4>
                  <p className="text-lg leading-relaxed text-orange-600">{lexicalResource.areasForImprovement}</p>
                </div>
              )}
              {!lexicalResource?.strengths && !lexicalResource?.areasForImprovement && (
                <p className="text-lg leading-relaxed">{lexicalResource}</p>
              )}
            </FeedbackCard>
            
            <FeedbackCard title="Grammatical Range and Accuracy" color="pink" icon="spellcheck" delay={1.1}>
              {grammaticalRangeAndAccuracy?.strengths && (
                <div className="mb-4">
                  <h4 className="font-semibold text-green-700 mb-2">✓ Strengths:</h4>
                  <p className="text-lg leading-relaxed text-green-600">{grammaticalRangeAndAccuracy.strengths}</p>
                </div>
              )}
              {grammaticalRangeAndAccuracy?.areasForImprovement && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">→ Areas for Improvement:</h4>
                  <p className="text-lg leading-relaxed text-orange-600">{grammaticalRangeAndAccuracy.areasForImprovement}</p>
                </div>
              )}
              {!grammaticalRangeAndAccuracy?.strengths && !grammaticalRangeAndAccuracy?.areasForImprovement && (
                <p className="text-lg leading-relaxed">{grammaticalRangeAndAccuracy}</p>
              )}
            </FeedbackCard>

            {improvementRecommendations && (
              <FeedbackCard title="Improvement Recommendations" color="indigo" icon="trending_up" delay={1.3}>
                <p className="text-lg leading-relaxed">{improvementRecommendations}</p>
              </FeedbackCard>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: "1.7s" }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onBack}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 text-lg font-medium"
            >
              Take Another Test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingFeedback;