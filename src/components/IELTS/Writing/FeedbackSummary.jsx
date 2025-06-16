import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, TabletSmartphone, ArrowUpRight, LayoutGrid, Layers, PieChart, BookOpen, Fingerprint, BrainCircuit, Award, Target, Sparkles, TrendingUp, Zap, AlertTriangle } from 'lucide-react';

// Enhanced color scheme for scores - moved outside component for global use
const getScoreColor = (score) => {
  if (score >= 8) return { 
    color: "#0d9488", 
    gradient: "from-teal-400 to-teal-600", 
    bg: "bg-gradient-to-r from-teal-500 to-teal-600", 
    text: "bg-teal-600" 
  }; // Teal for excellent (8-9)
  if (score >= 7) return { 
    color: "#0891b2", 
    gradient: "from-cyan-400 to-cyan-600",
    bg: "bg-gradient-to-r from-cyan-500 to-cyan-600", 
    text: "bg-cyan-600"
  }; // Cyan for very good (7-7.9)
  if (score >= 6) return { 
    color: "#2563eb", 
    gradient: "from-blue-400 to-blue-600",
    bg: "bg-gradient-to-r from-blue-500 to-blue-600", 
    text: "bg-blue-600"
  }; // Blue for good (6-6.9)
  if (score >= 5) return { 
    color: "#7c3aed", 
    gradient: "from-violet-400 to-violet-600",
    bg: "bg-gradient-to-r from-violet-500 to-violet-600", 
    text: "bg-violet-600"
  }; // Violet for moderate (5-5.9)
  if (score >= 4) return { 
    color: "#d97706", 
    gradient: "from-amber-400 to-amber-600",
    bg: "bg-gradient-to-r from-amber-500 to-amber-600", 
    text: "bg-amber-600"
  }; // Amber for borderline (4-4.9)
  return { 
    color: "#dc2626", 
    gradient: "from-red-400 to-red-600",
    bg: "bg-gradient-to-r from-red-500 to-red-600", 
    text: "bg-red-600"
  }; // Red for weak (0-3.9)
};

// Component for the score display with circular progress indicator
const ScoreCircle = ({ score, label, size = "md", animate = false }) => {
  // Calculate the circumference and stroke-dasharray based on the score
  const radius = size === "lg" ? 40 : size === "md" ? 30 : 20;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 9) * circumference;
  
  const sizeClasses = {
    lg: "w-28 h-28 text-4xl",
    md: "w-20 h-20 text-2xl",
    sm: "w-16 h-16 text-xl"
  };

  const scoreColorInfo = getScoreColor(score);
  
  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        <svg className="w-full h-full" viewBox={`0 0 ${radius * 2 + 10} ${radius * 2 + 10}`}>
          <circle
            cx={radius + 5}
            cy={radius + 5}
            r={radius}
            fill="none"
            stroke="#e6e6e6"
            strokeWidth="5"
          />
          <circle
            cx={radius + 5}
            cy={radius + 5}
            r={radius}
            fill="none"
            stroke={`url(#scoreGradient-${size}-${score.toString().replace('.', '-')})`}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform={`rotate(-90 ${radius + 5} ${radius + 5})`}
            strokeLinecap="round"
            className={animate ? "animate-circle-fill" : ""}
          />
          {/* Define the gradient */}
          <defs>
            <linearGradient id={`scoreGradient-${size}-${score.toString().replace('.', '-')}`} gradientTransform="rotate(90)">
              <stop offset="0%" stopColor={scoreColorInfo.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={scoreColorInfo.color} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute font-bold" style={{ color: scoreColorInfo.color }}>{score.toFixed(1)}</div>
      </div>
      {label && <p className="mt-2 text-center text-sm font-medium text-gray-700">{label}</p>}
    </div>
  );
};

// Component for category feedback with score bar and comments
const CategoryFeedback = ({ title, score, percentage, comments, expanded, onToggle, icon }) => {
  const scoreColorInfo = getScoreColor(score);
  
  return (
    <div className="category-box transition-all duration-300 hover:shadow-md bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          {icon && <span className="mr-2 text-indigo-600">{icon}</span>}
          <h4 className="font-medium text-gray-800">{title}</h4>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-white font-bold px-3 py-1 rounded-md shadow-sm text-xs sm:text-sm ${scoreColorInfo.text}`}>
            {score.toFixed(1)}
          </span>
          <button
            onClick={onToggle}
            className="p-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex items-center"
            aria-label={expanded ? "Hide details" : "Show details"}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${scoreColorInfo.bg} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {expanded && (
        <div className="bg-gray-50 p-4 mt-3 rounded-md border border-gray-200 shadow-sm animate-fadeIn">
          <ul className="space-y-3 text-sm">
            {comments.map((comment, idx) => (
              <li key={idx} className="flex items-start feedback-comment">
                <span className="mr-3 flex-shrink-0 mt-0.5">
                  {comment.includes("improvement") || comment.includes("could") || comment.includes("should") || comment.includes("need") ?
                    <AlertCircle size={16} className="text-amber-500" /> :
                    <CheckCircle size={16} className="text-green-600" />
                  }
                </span>
                <span className="text-gray-700 font-medium">{comment}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Component for feedback items in a card layout
const FeedbackCard = ({ item, type, icon }) => {
  const isStrength = type === 'strength';
  
  // Enhanced styling for feedback cards
  const styles = isStrength 
    ? { 
        bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
        border: 'border-teal-200',
        shadow: 'shadow-sm hover:shadow-teal-100',
        text: 'text-teal-800',
        icon: 'text-teal-600'
      }
    : {
        bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50',
        border: 'border-amber-200',
        shadow: 'shadow-sm hover:shadow-amber-100',
        text: 'text-amber-800',
        icon: 'text-amber-600'
      };
  
  return (
    <div className={`relative p-4 rounded-lg ${styles.shadow} ${styles.bg} border ${styles.border} hover:shadow-md transition-all duration-300 feedback-card overflow-hidden`}>
      {/* Add decorative elements */}
      <div className="absolute top-0 right-0 w-12 h-12 opacity-10 rounded-bl-full bg-current"></div>
      
      <div className="flex items-start relative z-10">
        <span className={`mr-3 flex-shrink-0 mt-1 ${styles.icon}`}>
          {icon || (isStrength ? <CheckCircle size={18} /> : <AlertCircle size={18} />)}
        </span>
        <p className={`${styles.text} font-medium`}>{item}</p>
      </div>
    </div>
  );
};

// Strength and improvement icons
const strengthIcons = [<Award size={18} />, <TrendingUp size={18} />, <Sparkles size={18} />, <Zap size={18} />];
const improvementIcons = [<Target size={18} />, <AlertTriangle size={18} />];

const FeedbackSummary = ({ feedback, onBack }) => {
  // State for active task tab
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState({
    task1Achievement: false,
    task1Coherence: false,
    task1Lexical: false,
    task1Grammar: false,
    task2Achievement: false,
    task2Coherence: false,
    task2Lexical: false,
    task2Grammar: false
  });
  
  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Category icons
  const categoryIcons = {
    taskAchievement: <Fingerprint size={18} />,
    coherenceCohesion: <Layers size={18} />,
    lexicalResource: <BookOpen size={18} />,
    grammaticalRange: <BrainCircuit size={18} />
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Button onClick={onBack} className="back-button mb-6">
        <ArrowUpRight size={16} className="mr-2" /> Back to Home
      </Button>
      
      {/* Tabs navigation */}
      <div className="feedback-tab-container mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`feedback-tab ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <PieChart size={16} className="inline-block mr-2" />
          Assessment Overview
        </button>
        <button
          onClick={() => setActiveTab('task1')}
          className={`feedback-tab ${activeTab === 'task1' ? 'active' : ''}`}
        >
          <LayoutGrid size={16} className="inline-block mr-2" />
          Task 1 Feedback
        </button>
        <button
          onClick={() => setActiveTab('task2')}
          className={`feedback-tab ${activeTab === 'task2' ? 'active' : ''}`}
        >
          <TabletSmartphone size={16} className="inline-block mr-2" />
          Task 2 Feedback
        </button>
      </div>
      
      {/* Overview tab content */}
      {activeTab === 'overview' && (
     <div className="fade-in">
          <div className="feedback-content">
            <div className="feedback-header">
              <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between">
                <div className="text-center lg:text-left mb-6 lg:mb-0">
                  <h2 className="text-2xl font-bold text-indigo-700 mb-2">IELTS Writing Assessment</h2>
                  <p className="text-gray-600">Your detailed feedback and scores</p>
                </div>
                <ScoreCircle score={feedback.finalScore} label="Overall Band" size="lg" animate={true} />
              </div>
            </div>
            
            <div className="feedback-body">
              {/* Score summary section */}
              <div className="score-section mb-8">
                <div className="score-item">
                  <div className="score-label">Task 1 Score</div>
                  <div className="score-value font-bold text-gray-800 text-xl">{feedback.task1.overallScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Graph/Chart Description</div>
                </div>
                
                <div className="score-item">
                  <div className="score-label">Overall Band</div>
                  <div className="score-value text-indigo-700 text-2xl font-bold">{feedback.finalScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Final Assessment</div>
                </div>
                
                <div className="score-item">
                  <div className="score-label">Task 2 Score</div>
                  <div className="score-value font-bold text-gray-800 text-xl">{feedback.task2.overallScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Essay Writing</div>
                </div>
              </div>
              
              {/* Overall Assessment */}
              <div className="feedback-summary-box mb-6">
                <h3 className="text-lg font-medium text-indigo-700 mb-3">Overall Assessment</h3>
                <p className="text-gray-700 leading-relaxed">
                  {feedback.overallFeedback}
                </p>
              </div>
            </div>
          </div>
          
          {/* Strengths and Improvements Overview */}
          <div className="feedback-section mb-8">
            {/* Strengths Section */}
            <div className="feedback-content mb-8">
              <div className="feedback-header">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 mr-3">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">Key Strengths</h3>
                </div>
              </div>
              
              <div className="feedback-body">
                <div className="feedback-category">
                  <div className="category-header">
                    <LayoutGrid size={20} />
                    <h4 className="font-medium text-gray-800">Task 1 Strengths</h4>
                  </div>
                  <div className="category-content">
                    {feedback.task1.strengths.map((strength, idx) => (
                      <div className="feedback-badge badge-good" key={idx}>
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="feedback-category">
                  <div className="category-header">
                    <TabletSmartphone size={20} />
                    <h4 className="font-medium text-gray-800">Task 2 Strengths</h4>
                  </div>
                  <div className="category-content">
                    {feedback.task2.strengths.map((strength, idx) => (
                      <div className="feedback-badge badge-good" key={idx}>
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Improvements Section */}
            <div className="feedback-content">
              <div className="feedback-header">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-amber-100 mr-3">
                    <AlertCircle size={20} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">Areas for Improvement</h3>
                </div>
              </div>
              
              <div className="feedback-body">
                <div className="feedback-category">
                  <div className="category-header">
                    <LayoutGrid size={20} />
                    <h4 className="font-medium text-gray-800">Task 1 Improvements</h4>
                  </div>
                  <div className="category-content">
                    {feedback.task1.improvements.map((improvement, idx) => (
                      <div className="feedback-badge badge-improve" key={idx}>
                        {improvement}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="feedback-category">
                  <div className="category-header">
                    <TabletSmartphone size={20} />
                    <h4 className="font-medium text-gray-800">Task 2 Improvements</h4>
                  </div>
                  <div className="category-content">
                    {feedback.task2.improvements.map((improvement, idx) => (
                      <div className="feedback-badge badge-improve" key={idx}>
                        {improvement}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Task 1 tab content */}
      {activeTab === 'task1' && (
        <div className="fade-in">
          <div className="feedback-content">
            <div className="feedback-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-indigo-700">Task 1 Detailed Assessment</h2>
                <ScoreCircle score={feedback.task1.overallScore} size="sm" />
              </div>
              
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <h3 className="text-sm font-medium text-indigo-700 mb-1">Task Description:</h3>
                <p className="text-sm text-gray-700">Graph/Chart Description - Summarize information by selecting and reporting main features, and make comparisons where relevant.</p>
              </div>
            </div>
            
            <div className="feedback-body">
              <h3 className="text-lg font-semibold mb-4">Assessment Categories</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="collapsible-section">
                  <div
                    className="collapsible-header"
                    onClick={() => toggleCategory('task1Achievement')}
                  >
                    <div className="flex items-center">
                      {categoryIcons.taskAchievement}
                      <span className="ml-2 font-medium">Task Achievement</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-white text-sm font-bold rounded-md px-3 py-1 shadow-sm ${getScoreColor(feedback.task1.categories.taskAchievement.score).text}`}>
                        {feedback.task1.categories.taskAchievement.score.toFixed(1)}
                      </span>
                      <button className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none">
                        {expandedCategories.task1Achievement ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className={`collapsed-content ${expandedCategories.task1Achievement ? 'expanded' : ''}`}>
                    <div className="p-4 bg-gray-50 rounded-md mt-2">
                      <div className="h-2 bg-gray-200 rounded-full mb-4">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${getScoreColor(feedback.task1.categories.taskAchievement.score).bg}`}
                          style={{width: `${feedback.task1.categories.taskAchievement.percentage}%`}}
                        ></div>
                      </div>
                      <ul className="space-y-2">
                        {feedback.task1.categories.taskAchievement.comments.map((comment, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2 mt-1">
                              {comment.includes("improvement") || comment.includes("could") ?
                                <AlertCircle size={14} className="text-amber-500" /> :
                                <CheckCircle size={14} className="text-green-600" />
                              }
                            </span>
                            <span className="text-sm">{comment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="collapsible-section">
                  <div
                    className="collapsible-header"
                    onClick={() => toggleCategory('task1Coherence')}
                  >
                    <div className="flex items-center">
                      {categoryIcons.coherenceCohesion}
                      <span className="ml-2 font-medium">Coherence & Cohesion</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-white text-sm font-bold rounded-md px-3 py-1 shadow-sm ${getScoreColor(feedback.task1.categories.coherenceCohesion.score).text}`}>
                        {feedback.task1.categories.coherenceCohesion.score.toFixed(1)}
                      </span>
                      <button className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none">
                        {expandedCategories.task1Coherence ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className={`collapsed-content ${expandedCategories.task1Coherence ? 'expanded' : ''}`}>
                    <div className="p-4 bg-gray-50 rounded-md mt-2">
                      <div className="h-2 bg-gray-200 rounded-full mb-4">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${getScoreColor(feedback.task1.categories.coherenceCohesion.score).bg}`}
                          style={{width: `${feedback.task1.categories.coherenceCohesion.percentage}%`}}
                        ></div>
                      </div>
                      <ul className="space-y-2">
                        {feedback.task1.categories.coherenceCohesion.comments.map((comment, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2 mt-1">
                              {comment.includes("improvement") || comment.includes("could") ?
                                <AlertCircle size={14} className="text-amber-500" /> :
                                <CheckCircle size={14} className="text-green-600" />
                              }
                            </span>
                            <span className="text-sm">{comment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="collapsible-section">
                  <div
                    className="collapsible-header"
                    onClick={() => toggleCategory('task1Lexical')}
                  >
                    <div className="flex items-center">
                      {categoryIcons.lexicalResource}
                      <span className="ml-2 font-medium">Lexical Resource</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-white text-sm font-bold rounded-md px-3 py-1 shadow-sm ${getScoreColor(feedback.task1.categories.lexicalResource.score).text}`}>
                        {feedback.task1.categories.lexicalResource.score.toFixed(1)}
                      </span>
                      <button className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none">
                        {expandedCategories.task1Lexical ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className={`collapsed-content ${expandedCategories.task1Lexical ? 'expanded' : ''}`}>
                    <div className="p-4 bg-gray-50 rounded-md mt-2">
                      <div className="h-2 bg-gray-200 rounded-full mb-4">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${getScoreColor(feedback.task1.categories.lexicalResource.score).bg}`}
                          style={{width: `${feedback.task1.categories.lexicalResource.percentage}%`}}
                        ></div>
                      </div>
                      <ul className="space-y-2">
                        {feedback.task1.categories.lexicalResource.comments.map((comment, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2 mt-1">
                              {comment.includes("improvement") || comment.includes("could") || comment.includes("should") || comment.includes("need") ?
                                <AlertCircle size={14} className="text-amber-500" /> :
                                <CheckCircle size={14} className="text-green-600" />
                              }
                            </span>
                            <span className="text-sm">{comment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="collapsible-section">
                  <div
                    className="collapsible-header"
                    onClick={() => toggleCategory('task1Grammar')}
                  >
                    <div className="flex items-center">
                      {categoryIcons.grammaticalRange}
                      <span className="ml-2 font-medium">Grammatical Range & Accuracy</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-white text-sm font-bold rounded-md px-3 py-1 shadow-sm ${getScoreColor(feedback.task1.categories.grammaticalRange.score).text}`}>
                        {feedback.task1.categories.grammaticalRange.score.toFixed(1)}
                      </span>
                      <button className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none">
                        {expandedCategories.task1Grammar ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className={`collapsed-content ${expandedCategories.task1Grammar ? 'expanded' : ''}`}>
                    <div className="p-4 bg-gray-50 rounded-md mt-2">
                      <div className="h-2 bg-gray-200 rounded-full mb-4">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${getScoreColor(feedback.task1.categories.grammaticalRange.score).bg}`}
                          style={{width: `${feedback.task1.categories.grammaticalRange.percentage}%`}}
                        ></div>
                      </div>
                      <ul className="space-y-2">
                        {feedback.task1.categories.grammaticalRange.comments.map((comment, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2 mt-1">
                              {comment.includes("improvement") || comment.includes("could") || comment.includes("should") || comment.includes("need") ?
                                <AlertCircle size={14} className="text-amber-500" /> :
                                <CheckCircle size={14} className="text-green-600" />
                              }
                            </span>
                            <span className="text-sm">{comment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center mb-3">
                    <div className="p-2 rounded-full bg-green-100 mr-3">
                      <CheckCircle size={18} className="text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-800">Strengths</h4>
                  </div>
                  {feedback.task1.strengths.map((strength, idx) => (
                    <div key={idx} className="feedback-badge badge-good">
                      {strength}
                    </div>
                  ))}
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <div className="flex items-center mb-3">
                    <div className="p-2 rounded-full bg-amber-100 mr-3">
                      <AlertCircle size={18} className="text-amber-600" />
                    </div>
                    <h4 className="font-medium text-gray-800">Areas for Improvement</h4>
                  </div>
                  {feedback.task1.improvements.map((improvement, idx) => (
                    <div key={idx} className="feedback-badge badge-improve">
                      {improvement}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Task 2 tab content */}
      {activeTab === 'task2' && (
        <div className="fade-in">
          <div className="feedback-content">
            <div className="feedback-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-indigo-700">Task 2 Detailed Assessment</h2>
                <ScoreCircle score={feedback.task2.overallScore} size="sm" />
              </div>
              
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <h3 className="text-sm font-medium text-indigo-700 mb-1">Task Description:</h3>
                <p className="text-sm text-gray-700">Essay Writing - Present a written argument or case to an educated reader with no specialist knowledge of the topic.</p>
              </div>
            </div>
            
            <div className="feedback-body">
              <h3 className="text-lg font-semibold mb-4">Assessment Categories</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="collapsible-section">
                  <div
                    className="collapsible-header"
                    onClick={() => toggleCategory('task2Achievement')}
                  >
                    <div className="flex items-center">
                      {categoryIcons.taskAchievement}
                      <span className="ml-2 font-medium">Task Achievement</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-white text-sm font-bold rounded-md px-3 py-1 shadow-sm ${getScoreColor(feedback.task2.categories.taskAchievement.score).text}`}>
                        {feedback.task2.categories.taskAchievement.score.toFixed(1)}
                      </span>
                      <button className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none">
                        {expandedCategories.task2Achievement ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className={`collapsed-content ${expandedCategories.task2Achievement ? 'expanded' : ''}`}>
                    <div className="p-4 bg-gray-50 rounded-md mt-2">
                      <div className="h-2 bg-gray-200 rounded-full mb-4">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${getScoreColor(feedback.task2.categories.taskAchievement.score).bg}`}
                          style={{width: `${feedback.task2.categories.taskAchievement.percentage}%`}}
                        ></div>
                      </div>
                      <ul className="space-y-2">
                        {feedback.task2.categories.taskAchievement.comments.map((comment, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2 mt-1">
                              {comment.includes("improvement") || comment.includes("could") || comment.includes("should") || comment.includes("need") ?
                                <AlertCircle size={14} className="text-amber-500" /> :
                                <CheckCircle size={14} className="text-green-600" />
                              }
                            </span>
                            <span className="text-sm">{comment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="collapsible-section">
                  <div
                    className="collapsible-header"
                    onClick={() => toggleCategory('task2Coherence')}
                  >
                    <div className="flex items-center">
                      {categoryIcons.coherenceCohesion}
                      <span className="ml-2 font-medium">Coherence & Cohesion</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-white text-sm font-bold rounded-md px-3 py-1 shadow-sm ${getScoreColor(feedback.task2.categories.coherenceCohesion.score).text}`}>
                        {feedback.task2.categories.coherenceCohesion.score.toFixed(1)}
                      </span>
                      <button className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none">
                        {expandedCategories.task2Coherence ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className={`collapsed-content ${expandedCategories.task2Coherence ? 'expanded' : ''}`}>
                    <div className="p-4 bg-gray-50 rounded-md mt-2">
                      <div className="h-2 bg-gray-200 rounded-full mb-4">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${getScoreColor(feedback.task2.categories.coherenceCohesion.score).bg}`}
                          style={{width: `${feedback.task2.categories.coherenceCohesion.percentage}%`}}
                        ></div>
                      </div>
                      <ul className="space-y-2">
                        {feedback.task2.categories.coherenceCohesion.comments.map((comment, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2 mt-1">
                              {comment.includes("improvement") || comment.includes("could") || comment.includes("should") || comment.includes("need") ?
                                <AlertCircle size={14} className="text-amber-500" /> :
                                <CheckCircle size={14} className="text-green-600" />
                              }
                            </span>
                            <span className="text-sm">{comment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="collapsible-section">
                  <div
                    className="collapsible-header"
                    onClick={() => toggleCategory('task2Lexical')}
                  >
                    <div className="flex items-center">
                      {categoryIcons.lexicalResource}
                      <span className="ml-2 font-medium">Lexical Resource</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-white text-sm font-bold rounded-md px-3 py-1 shadow-sm ${getScoreColor(feedback.task2.categories.lexicalResource.score).text}`}>
                        {feedback.task2.categories.lexicalResource.score.toFixed(1)}
                      </span>
                      <button className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none">
                        {expandedCategories.task2Lexical ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className={`collapsed-content ${expandedCategories.task2Lexical ? 'expanded' : ''}`}>
                    <div className="p-4 bg-gray-50 rounded-md mt-2">
                      <div className="h-2 bg-gray-200 rounded-full mb-4">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${getScoreColor(feedback.task2.categories.lexicalResource.score).bg}`}
                          style={{width: `${feedback.task2.categories.lexicalResource.percentage}%`}}
                        ></div>
                      </div>
                      <ul className="space-y-2">
                        {feedback.task2.categories.lexicalResource.comments.map((comment, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2 mt-1">
                              {comment.includes("improvement") || comment.includes("could") || comment.includes("should") || comment.includes("need") ?
                                <AlertCircle size={14} className="text-amber-500" /> :
                                <CheckCircle size={14} className="text-green-600" />
                              }
                            </span>
                            <span className="text-sm">{comment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="collapsible-section">
                  <div
                    className="collapsible-header"
                    onClick={() => toggleCategory('task2Grammar')}
                  >
                    <div className="flex items-center">
                      {categoryIcons.grammaticalRange}
                      <span className="ml-2 font-medium">Grammatical Range & Accuracy</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-white text-sm font-bold rounded-md px-3 py-1 shadow-sm ${getScoreColor(feedback.task2.categories.grammaticalRange.score).text}`}>
                        {feedback.task2.categories.grammaticalRange.score.toFixed(1)}
                      </span>
                      <button className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none">
                        {expandedCategories.task2Grammar ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className={`collapsed-content ${expandedCategories.task2Grammar ? 'expanded' : ''}`}>
                    <div className="p-4 bg-gray-50 rounded-md mt-2">
                      <div className="h-2 bg-gray-200 rounded-full mb-4">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${getScoreColor(feedback.task2.categories.grammaticalRange.score).bg}`}
                          style={{width: `${feedback.task2.categories.grammaticalRange.percentage}%`}}
                        ></div>
                      </div>
                      <ul className="space-y-2">
                        {feedback.task2.categories.grammaticalRange.comments.map((comment, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2 mt-1">
                              {comment.includes("improvement") || comment.includes("could") || comment.includes("should") || comment.includes("need") ?
                                <AlertCircle size={14} className="text-amber-500" /> :
                                <CheckCircle size={14} className="text-green-600" />
                              }
                            </span>
                            <span className="text-sm">{comment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center mb-3">
                    <div className="p-2 rounded-full bg-green-100 mr-3">
                      <CheckCircle size={18} className="text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-800">Strengths</h4>
                  </div>
                  {feedback.task2.strengths.map((strength, idx) => (
                    <div key={idx} className="feedback-badge badge-good">
                      {strength}
                    </div>
                  ))}
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <div className="flex items-center mb-3">
                    <div className="p-2 rounded-full bg-amber-100 mr-3">
                      <AlertCircle size={18} className="text-amber-600" />
                    </div>
                    <h4 className="font-medium text-gray-800">Areas for Improvement</h4>
                  </div>
                  {feedback.task2.improvements.map((improvement, idx) => (
                    <div key={idx} className="feedback-badge badge-improve">
                      {improvement}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center mt-8">
        <Button onClick={onBack} className="submit-button">
          Start New Test
        </Button>
      </div>
    </div>
  );
};

export default FeedbackSummary;