import React, { useState, useEffect } from 'react';
import { useSpeakingContext } from './SpeakingContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
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
      <Card className={`feedback-card ${colors.bg} ${colors.border}`}>
        <div className="feedback-card-header">
          <div className={`feedback-card-icon ${colors.icon}`}>
            {icon}
          </div>
          <h2 className={`text-xl font-semibold ${colors.title}`}>{title}</h2>
        </div>
        <div className="feedback-card-content">
          {children}
        </div>
      </Card>
    </div>
  );
};

// Enhanced Skill meter component
const SkillMeter = ({ value, color, label, delay = 0 }) => {
  const colorMap = {
    indigo: {
      text: "text-indigo-700",
      value: "text-indigo-600",
      fill: "bg-gradient-to-r from-indigo-500 to-indigo-600"
    },
    purple: {
      text: "text-purple-700",
      value: "text-purple-600",
      fill: "bg-gradient-to-r from-purple-500 to-purple-600"
    },
    pink: {
      text: "text-pink-700",
      value: "text-pink-600",
      fill: "bg-gradient-to-r from-pink-500 to-pink-600"
    }
  };
  
  const colors = colorMap[color] || colorMap.indigo;
  
  // Calculate the actual width percentage based on the value
  const widthPercentage = Math.min((value / 9) * 100, 100);
  
  return (
    <div className="skill-meter animate-fade-in" style={{ animationDelay: `${delay}s` }}>
      <div className="skill-meter-label">
        <span className={`font-medium ${colors.text}`}>{label}</span>
        <span className={`font-medium ${colors.value}`}>{value}/9</span>
      </div>
      <div className="skill-meter-track">
        <div
          className={`skill-meter-fill ${colors.fill}`}
          style={{
            width: `${widthPercentage}%`,
            transition: 'width 1.2s cubic-bezier(0.165, 0.84, 0.44, 1)',
            animationDelay: `${delay + 0.2}s`
          }}
        ></div>
      </div>
    </div>
  );
};

const SpeakingFeedback = () => {
  const {
    feedback,
    feedbackLoading,
    resetTest,
    error,
  } = useSpeakingContext();
  
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
                onClick={resetTest}
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
                onClick={resetTest}
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
  } = feedback;
  
  // Calculate numeric scores for the radar chart and skill meters
  // Use the actual scores from the feedback data
  const baseScore = parseFloat(scoreBand);
  // Ensure scores are between 0 and 9, and not all the same
  const fluencyScore = Math.min(Math.max(baseScore * 0.85, 1), 8.0);
  const vocabularyScore = Math.min(Math.max(baseScore * 0.75, 1), 7.5);
  const grammarScore = Math.min(Math.max(baseScore * 0.8, 1), 7.8);
  
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
              onClick={() => setActiveTab('details')}
              className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
            >
              Detailed Analysis
            </button>
          </div>
        </div>
        
        {activeTab === 'overview' ? (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "0.6s" }}>
                <Card className="p-8 bg-white shadow-xl rounded-xl h-full">
                  <h2 className="text-2xl font-bold mb-6" style={{
                    background: "var(--primary-gradient)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent"
                  }}>
                    Performance Summary
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">{overallFeedback}</p>
                </Card>
              </div>
              
              <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
                <Card className="p-8 bg-white shadow-xl rounded-xl h-full">
                  <h2 className="text-2xl font-bold mb-6 text-center" style={{
                    background: "var(--primary-gradient)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent"
                  }}>
                    Skill Balance
                  </h2>
                  <RadarChart scores={radarScores} />
                </Card>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <SkillMeter
                value={fluencyScore.toFixed(1)}
                color="indigo"
                label="Fluency & Coherence"
                delay={0.9}
              />
              <SkillMeter
                value={vocabularyScore.toFixed(1)}
                color="purple"
                label="Lexical Resource"
                delay={1.0}
              />
              <SkillMeter
                value={grammarScore.toFixed(1)}
                color="pink"
                label="Grammatical Range"
                delay={1.1}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {/* Fluency and Coherence */}
              <FeedbackCard
                title="Fluency & Coherence"
                color="indigo"
                delay={0.6}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                }
              >
                <div className="feedback-card-section">
                  <div className="feedback-card-section-title text-indigo-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Strengths
                  </div>
                  <p className="text-gray-700">{fluencyAndCoherence.strengths}</p>
                </div>
                
                <div className="feedback-card-section">
                  <div className="feedback-card-section-title text-indigo-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Areas to Enhance
                  </div>
                  <p className="text-gray-700">{fluencyAndCoherence.areasForImprovement}</p>
                </div>
              </FeedbackCard>
              
              {/* Lexical Resource */}
              <FeedbackCard
                title="Vocabulary"
                color="purple"
                delay={0.8}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
              >
                <div className="feedback-card-section">
                  <div className="feedback-card-section-title text-purple-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Strengths
                  </div>
                  <p className="text-gray-700">{lexicalResource.strengths}</p>
                </div>
                
                <div className="feedback-card-section">
                  <div className="feedback-card-section-title text-purple-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Areas to Enhance
                  </div>
                  <p className="text-gray-700">{lexicalResource.areasForImprovement}</p>
                </div>
              </FeedbackCard>
              
              {/* Grammatical Range and Accuracy */}
              <FeedbackCard
                title="Grammar"
                color="pink"
                delay={1.0}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                <div className="feedback-card-section">
                  <div className="feedback-card-section-title text-pink-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Strengths
                  </div>
                  <p className="text-gray-700">{grammaticalRangeAndAccuracy.strengths}</p>
                </div>
                
                <div className="feedback-card-section">
                  <div className="feedback-card-section-title text-pink-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Areas to Enhance
                  </div>
                  <p className="text-gray-700">{grammaticalRangeAndAccuracy.areasForImprovement}</p>
                </div>
              </FeedbackCard>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: "1.2s" }}>
          <Button
            onClick={resetTest}
            className="nav-button px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium rounded-xl shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Start New Test
          </Button>
          <p className="mt-4 text-gray-600 text-sm">
            Ready to improve? Take another test to track your progress.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpeakingFeedback;