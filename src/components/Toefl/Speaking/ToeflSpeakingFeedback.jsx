import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { useToeflSpeakingContext } from './ToeflSpeakingContext';
import './ToeflSpeaking.css';

const ToeflSpeakingFeedback = () => {
  const {
    feedback, 
    feedbackLoading, 
    resetTest,
    testData
  } = useToeflSpeakingContext();
  
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(-1); // Default to Overall tab
  const [loadingStage, setLoadingStage] = useState(1);
  
  // Staged loading animation
  useEffect(() => {
    if (feedbackLoading) {
      // Progress through stages while loading
      const stageTimer1 = setTimeout(() => setLoadingStage(2), 2000);
      const stageTimer2 = setTimeout(() => setLoadingStage(3), 4000);
      
      return () => {
        clearTimeout(stageTimer1);
        clearTimeout(stageTimer2);
      };
    }
  }, [feedbackLoading]);
  
  // Format text by converting text between double asterisks to bold
  const formatText = (text) => {
    if (!text) return '';
    
    // Split by double asterisks and map even/odd indices differently
    const parts = text.split(/\*\*/);
    return parts.map((part, index) => (
      index % 2 === 0 ? part : <strong key={index}>{part}</strong>
    ));
  };
  
  // Render loading stages
  const renderLoadingStages = () => {
    const stages = [
      { id: 1, name: "Analyzing Response" },
      { id: 2, name: "Evaluating Speaking Skills" },
      { id: 3, name: "Preparing Detailed Feedback" }
    ];
    
    return (
      <div className="loading-stages">
        {stages.map((stage) => (
          <div 
            key={stage.id} 
            className={`loading-stage ${loadingStage >= stage.id ? 'active' : ''} ${loadingStage === stage.id ? 'current' : ''}`}
          >
            <div className="stage-indicator">
              <span className="stage-number">{stage.id}</span>
              <div className="stage-progress"></div>
            </div>
            <div className="stage-name">{stage.name}</div>
          </div>
        ))}
      </div>
    );
  };
  
  if (feedbackLoading) {
    return (
      <div className="speaking-feedback-container">
        <div className="feedback-header">
          <h1 className="speaking-title">Analyzing Your Responses</h1>
          <p className="speaking-subtitle">
            Please wait while we evaluate your speaking performance
          </p>
        </div>
        
        <div className="feedback-loading">
          {renderLoadingStages()}
          <div className="feedback-spinner"></div>
          <p className="text-xl font-medium text-gray-700 mt-6">
            {loadingStage === 1 ? "Analyzing your speaking response..." : 
            loadingStage === 2 ? "Evaluating your delivery, language use, and topic development..." :
            "Preparing your personalized feedback and recommendations..."}
          </p>
        </div>
      </div>
    );
  }
  
  if (!feedback) {
    return (
      <div className="speaking-feedback-container">
        <div className="feedback-header">
          <h1 className="speaking-title">Feedback Not Available</h1>
          <p className="speaking-subtitle">
            We couldn't generate feedback for your responses
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-6">
            <span className="material-icons text-yellow-600 text-2xl">warning</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Feedback Available</h2>
          <p className="text-gray-600 mb-8 text-lg">
            We couldn't generate feedback for your speaking responses. This might be due to an error
            processing your recordings or insufficient data to provide meaningful feedback.
          </p>
          <Button onClick={resetTest} className="bg-blue-600 hover:bg-blue-700 text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // Convert the overall score to the new 0-5 scale
  const overallScore = feedback.overall_score || 0;
  const scaledScore = Math.round((overallScore / 30) * 5 * 10) / 10; // Convert to 0-5 scale with one decimal
  const scorePercentage = Math.round((overallScore / 30) * 100);
  
  // Get the task scores
  const taskScores = feedback.task_scores || [];
  
  // Helper function to get task score text color based on score
  const getScoreColor = (score) => {
    if (score >= 3.5) return 'text-green-600';
    if (score >= 2.5) return 'text-blue-600';
    if (score >= 1.5) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Helper function to get the score band description (updated to match the new criteria)
  const getScoreBand = (score) => {
    const scaledScore = (score / 30) * 5; // Convert to 0-5 scale
    
    if (scaledScore >= 4.5) return { band: "Excellent", description: "Your speaking performance demonstrates relevant, well-elaborated content with consistent facility in language use, effective word choice, and varied sentence structures." };
    if (scaledScore >= 3.5) return { band: "Very Good", description: "Your speaking performance shows relevant content with adequate elaboration and few lexical or grammatical errors." };
    if (scaledScore >= 2.5) return { band: "Good", description: "Your speaking performance is mostly relevant with some elaboration but may have noticeable language errors that occasionally obscure meaning." };
    if (scaledScore >= 1.5) return { band: "Limited", description: "Your speaking has partially relevant content with poor elaboration and significant language difficulties." };
    if (scaledScore >= 0.5) return { band: "Very Limited", description: "Your speaking contains minimal relevant content with severely limited language control." };
    return { band: "Insufficient", description: "Your speaking performance needs substantial improvement in all areas." };
  };
  
  const scoreBand = getScoreBand(overallScore);
  
  // Get the currently selected task
  const selectedTask = selectedTaskIndex >= 0 ? taskScores[selectedTaskIndex] : null;

  // Render the task-specific feedback content
  const renderTaskFeedback = (task) => {
    if (!task) return null;
    
    return (
      <div className="task-feedback-content">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Task {task.task_number} Details
          </h2>
          <p className="text-gray-600 text-base">
            {testData?.tasks?.find(t => t.taskNumber === task.task_number)?.taskType.replace(/_/g, ' ')}
          </p>
        </div>
        
        {/* Performance Categories */}
        <div className="space-y-6 mb-6">
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2 text-lg">General Performance</h3>
            <p className="text-gray-700 text-base leading-relaxed">{formatText(task.general_description)}</p>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2 text-lg">Delivery</h3>
            <p className="text-gray-700 text-base leading-relaxed">{formatText(task.delivery)}</p>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2 text-lg">Language Use</h3>
            <p className="text-gray-700 text-base leading-relaxed">{formatText(task.language_use)}</p>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2 text-lg">Topic Development</h3>
            <p className="text-gray-700 text-base leading-relaxed">{formatText(task.topic_development)}</p>
          </div>
        </div>
        
        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <span className="flex items-center justify-center bg-green-100 text-green-700 w-8 h-8 rounded-full mr-2 shadow-sm border border-green-200">
                <span className="material-icons text-base">check_circle</span>
              </span>
              Strengths
            </h3>
            <ul className="space-y-3">
              {feedback.strengths && feedback.strengths.map((strength, index) => (
                <li key={index} className="text-base text-gray-700 flex items-start bg-white p-2 rounded-md shadow-sm border-l-2 border-green-300">
                  <span className="text-green-500 material-icons text-base mr-2 flex-shrink-0">check_circle</span>
                  <span>{formatText(strength)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-yellow-700 mb-3 flex items-center pb-2 border-b-2 border-yellow-100">
              <span className="flex items-center justify-center bg-yellow-100 text-yellow-700 w-8 h-8 rounded-full mr-2 shadow-sm border border-yellow-200">
                <span className="material-icons text-base">priority_high</span>
              </span>
              Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {feedback.areas_for_improvement && feedback.areas_for_improvement.map((area, index) => (
                <li key={index} className="text-base text-gray-700 flex items-start bg-white p-2 rounded-md shadow-sm border-l-2 border-yellow-300">
                  <span className="text-yellow-500 material-icons text-base mr-2 flex-shrink-0">priority_high</span>
                  <span>{formatText(area)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Recommendations Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommendations for Improvement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedback.recommendations && feedback.recommendations.map((recommendation, index) => (
              <div 
                key={index}
                className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500"
              >
                <div className="flex items-start">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                    <span className="material-icons text-sm">lightbulb</span>
                  </span>
                  <p className="text-gray-700 text-base leading-relaxed">{formatText(recommendation)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render the Overall tab content
  const renderOverallTab = () => {
    return (
      <div className="overall-feedback-content">
        <div className="overall-metrics-grid">
          {/* Main Score Card */}
          <div className="overall-score-card">
            <h2 className="overall-metrics-title">Overall Performance</h2>
            <div className="score-visualization">
              <div className="score-ring-container">
                {/* Main circular score visualization */}
                <svg className="score-ring" viewBox="0 0 100 100" style={{ overflow: "visible" }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <circle 
                    className="score-ring-bg" 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none"
                    strokeWidth="8"
                  />
                  <circle 
                    className="score-ring-progress" 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none"
                    strokeWidth="8"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (282.7 * scorePercentage / 100)}
                    transform="rotate(-90 50 50)"
                  />
                  <foreignObject x="15" y="30" width="70" height="40" style={{ overflow: "visible" }}>
                    <div xmlns="http://www.w3.org/1999/xhtml" style={{ textAlign: "left", transform: "rotate(-270deg)" }}>
                      <div style={{ fontSize: "28px", fontWeight: "700", color: "#1e40af" }}>
                        {scaledScore.toFixed(1)}
                      </div>
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>
                        out of 5.0
                      </div>
                    </div>
                  </foreignObject>
                </svg>
              </div>
              
              {/* Score band display */}
              <div className="score-band-container">
                <div className="score-band-label">
                  {scoreBand.band}
                </div>
                <p className="score-band-description">
                  {scoreBand.description}
                </p>
              </div>
            </div>
          </div>
          
          {/* Category Scores Card */}
          <div className="category-scores-card">
            <h2 className="overall-metrics-title">Performance Categories</h2>
            
            {/* Calculate average scores for each category */}
            {(() => {
              // Calculate average scores for delivery, language use, and topic development
              const deliveryScore = Math.round((taskScores.reduce((sum, task) => sum + ((task.relevance_elaboration_score || 0) * 10), 0) / taskScores.length)) / 10;
              const languageScore = Math.round((taskScores.reduce((sum, task) => sum + ((task.language_use_score || 0) * 10), 0) / taskScores.length)) / 10;
              const topicScore = deliveryScore; // Typically these are the same or similar
              
              return (
                <>
                  {/* Delivery Score */}
                  <div className="category-score-item">
                    <div className="category-score-header">
                      <div className="category-icon content-icon">
                        <span className="material-icons">record_voice_over</span>
                      </div>
                      <div className="category-info">
                        <h3 className="category-title">Delivery</h3>
                        <p className="category-description">Fluency, pronunciation, and pace</p>
                      </div>
                      <div className="category-value content-value">
                        {deliveryScore.toFixed(1)}
                      </div>
                    </div>
                    <div className="category-progress-container">
                      <div 
                        className="category-progress content-progress" 
                        style={{width: `${deliveryScore * 20}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Topic Development Score */}
                  <div className="category-score-item">
                    <div className="category-score-header">
                      <div className="category-icon organization-icon">
                        <span className="material-icons">developer_board</span>
                      </div>
                      <div className="category-info">
                        <h3 className="category-title">Topic Development</h3>
                        <p className="category-description">Relevance, coherence, and elaboration</p>
                      </div>
                      <div className="category-value organization-value">
                        {topicScore.toFixed(1)}
                      </div>
                    </div>
                    <div className="category-progress-container">
                      <div 
                        className="category-progress organization-progress" 
                        style={{width: `${topicScore * 20}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Language Use Score */}
                  <div className="category-score-item">
                    <div className="category-score-header">
                      <div className="category-icon language-icon">
                        <span className="material-icons">translate</span>
                      </div>
                      <div className="category-info">
                        <h3 className="category-title">Language Use</h3>
                        <p className="category-description">Grammar, vocabulary, and sentence structure</p>
                      </div>
                      <div className="category-value language-value">
                        {languageScore.toFixed(1)}
                      </div>
                    </div>
                    <div className="category-progress-container">
                      <div 
                        className="category-progress language-progress" 
                        style={{width: `${languageScore * 20}%`}}
                      ></div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          
          {/* Task Comparison Card */}
          <div className="task-comparison-card">
            <h2 className="overall-metrics-title">Task Performance Comparison</h2>
            <div className="task-comparison-chart">
              {taskScores.map((task, index) => (
                <div key={index} className="task-chart-item">
                  <div className="task-chart-label">Task {task.task_number}</div>
                  <div className="task-chart-bar-container">
                    <div 
                      className="task-chart-bar"
                      style={{height: `${task.score * 25}%`}}
                    >
                      <span className="task-chart-value">{task.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="task-chart-legend">
              <div className="chart-scale-line" style={{bottom: '0%', display: 'none'}}><span>0</span></div>
              <div className="chart-scale-line" style={{bottom: '25%', display: 'none'}}><span>1</span></div>
              <div className="chart-scale-line" style={{bottom: '50%', display: 'none'}}><span>2</span></div>
              <div className="chart-scale-line" style={{bottom: '75%', display: 'none'}}><span>3</span></div>
              <div className="chart-scale-line" style={{bottom: '100%', display: 'none'}}><span>4</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="speaking-feedback-container">
      <div className="feedback-header">
        <h1 className="speaking-title">Your TOEFL Speaking Feedback</h1>
        <p className="speaking-subtitle">
          Review your detailed feedback and recommendations to improve your TOEFL speaking skills
        </p>
      </div>
      
      <div className="task-tabs">
        <button
          className={`task-tab ${selectedTaskIndex === -1 ? 'active' : ''}`}
          onClick={() => setSelectedTaskIndex(-1)}
        >
          Overall
        </button>
        {taskScores.map((task, index) => (
          <button
            key={task.task_number}
            className={`task-tab ${selectedTaskIndex === index ? 'active' : ''}`}
            onClick={() => setSelectedTaskIndex(index)}
          >
            Task {task.task_number}
          </button>
        ))}
      </div>
      
      {/* Conditional rendering based on selected tab */}
      {selectedTaskIndex === -1 ? renderOverallTab() : renderTaskFeedback(selectedTask)}
      
      {/* Action Buttons */}
      <div className="flex justify-center mt-10 space-x-4">
        <Button 
          onClick={resetTest}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg shadow-sm flex items-center text-base"
        >
          <span className="material-icons mr-2">replay</span>
          Take Test Again
        </Button>
      </div>
    </div>
  );
};

export default ToeflSpeakingFeedback; 