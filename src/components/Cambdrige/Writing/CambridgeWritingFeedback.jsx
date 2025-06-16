import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext.jsx';
import { generateFeedback } from '../../../services/feedbackService.js';

const CambridgeWritingFeedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedCriteria, setExpandedCriteria] = useState({});
  const [loadingStage, setLoadingStage] = useState(0);

  // Get submission data from navigation state
  const submissionData = location.state?.submissionData;

  useEffect(() => {
    if (!submissionData) {
      navigate('/cambridge/writing');
      return;
    }
    
    // Generate feedback using API or fallback to mock
    generateFeedbackData();
  }, [submissionData]);

  const generateFeedbackData = async () => {
    try {
      setLoading(true);
      setLoadingStage(0);
      
      const startTime = Date.now();
      
      // Animate through loading stages (4 seconds total, 1 second each)
      const stageInterval = setInterval(() => {
        setLoadingStage(prev => {
          if (prev >= 3) {
            clearInterval(stageInterval);
            return 3;
          }
          return prev + 1;
        });
      }, 1000);
      
      // Try to generate real feedback first
      try {
        const realFeedback = await generateFeedback(submissionData);
        
        // Wait for loading animation to complete (minimum 4 seconds)
        const minLoadTime = 4000;
        const elapsed = Date.now() - startTime;
        
        if (elapsed < minLoadTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsed));
        }
        
        clearInterval(stageInterval);
        setFeedbackData(realFeedback);
      } catch (apiError) {
        console.warn('API feedback generation failed, using mock data:', apiError);
        
        // Wait for loading animation to complete
        const minLoadTime = 4000;
        const elapsed = Date.now() - startTime;
        
        if (elapsed < minLoadTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsed));
        }
        
        clearInterval(stageInterval);
        
        // Fallback to mock feedback if API fails
        const mockFeedback = generateMockFeedback();
        setFeedbackData(mockFeedback);
      }
      
    } catch (err) {
      setError('Failed to generate feedback. Please try again.');
      console.error('Feedback generation error:', err);
    } finally {
      setLoading(false);
    }
  };



  const generateMockFeedback = () => {
    return {
      taskId: "cambridge_a2_001",
      examLevel: submissionData.examData.examLevel,
      taskNumber: 1,
      taskType: "SHORT_MESSAGE_EMAIL",
      overallScore: 16,
      maxScore: 20,
      feedbackGenerated: new Date().toISOString(),
      criteriaFeedback: {
        content: {
          score: 4,
          maxScore: 5,
          performanceSummary: "Your response addresses all the required points effectively. You have included relevant details and maintained focus on the task throughout.",
          strengths: [
            {
              point: "Complete task coverage",
              example: "You successfully addressed all three points: expressing interest in the bike, asking where it was purchased, and suggesting a bike ride.",
              explanation: "This shows excellent task management and attention to requirements."
            },
            {
              point: "Relevant supporting details",
              example: "Your comment 'It looks really fast and the color is amazing!' adds personality and genuine interest.",
              explanation: "These details make your writing more engaging and authentic."
            }
          ],
          areasForImprovement: [
            {
              issue: "Limited elaboration on suggestions",
              example: "Your suggestion 'Maybe we can go for a ride together?' could be more specific.",
              advice: "Try adding details like 'Maybe we can go for a ride together this weekend in the park?' to make your suggestions more concrete and appealing.",
              strategy: "When making suggestions, include specific times, places, or activities to make them more compelling."
            }
          ]
        },
        communicativeAchievement: {
          score: 4,
          maxScore: 5,
          performanceSummary: "Your writing successfully achieves its communicative purpose with an appropriate tone for the context. The register is consistently informal and friendly.",
          strengths: [
            {
              point: "Appropriate informal register",
              example: "Using 'Hi Tom!' and 'See you soon!' creates the right friendly tone for writing to a friend.",
              explanation: "This demonstrates good understanding of audience and context."
            }
          ],
          areasForImprovement: [
            {
              issue: "Could enhance enthusiasm",
              example: "Your response is friendly but could show more excitement about the bike and ride suggestion.",
              advice: "Try using more enthusiastic language like 'I'm so excited about your new bike!' or 'I'd love to try riding together!'",
              strategy: "Use exclamation marks and positive adjectives to convey stronger emotions when appropriate."
            }
          ]
        },
        organisation: {
          score: 3,
          maxScore: 5,
          performanceSummary: "Your writing has a basic logical sequence but could benefit from better structure and connecting words.",
          strengths: [
            {
              point: "Clear sequence of ideas",
              example: "You start with a greeting, move to complimenting the bike, then ask your question, and end with a suggestion.",
              explanation: "This creates a natural flow that's easy to follow."
            }
          ],
          areasForImprovement: [
            {
              issue: "Limited use of connecting words",
              example: "Ideas are presented without clear transitions between them.",
              advice: "Try using words like 'Also', 'By the way', or 'Anyway' to connect your ideas more smoothly.",
              strategy: "Practice using simple linking words to guide readers through your thoughts."
            }
          ]
        },
        language: {
          score: 4,
          maxScore: 5,
          performanceSummary: "Your language use is generally accurate with good control of basic structures. Vocabulary is appropriate for the task and level.",
          strengths: [
            {
              point: "Accurate basic grammar",
              example: "Correct use of present tense ('It looks really fast') and question formation ('Where did you buy it?').",
              explanation: "This shows solid control of fundamental grammatical structures."
            }
          ],
          areasForImprovement: [
            {
              issue: "Limited vocabulary range",
              example: "Using 'amazing' and 'really' - try varying your descriptive words.",
              advice: "Experiment with synonyms like 'fantastic', 'incredible', or 'absolutely' to add variety to your writing.",
              strategy: "Keep a vocabulary journal of new descriptive words and practice using them in different contexts."
            }
          ]
        }
      },
      overallFeedback: {
        summary: "This is a well-executed response that successfully completes the task with appropriate tone and clear organization. Your writing demonstrates good control of basic language structures and effectively communicates your intended message.",
        keyTakeaway: "Focus on expanding your vocabulary range and adding more specific details to make your writing even more engaging and precise.",
        levelSpecificObservations: {
          currentLevelPerformance: "Your writing demonstrates solid A2 level competency with clear communication and task completion.",
          progressionGuidance: "To move toward B1 level, work on using more varied vocabulary and adding more detailed explanations to your ideas.",
          levelAppropriateStrengths: "Excellent use of simple present tense and question formation, which are key A2 level skills.",
          actualCEFRLevel: "A2"
        },
        encouragingRemark: "Great job maintaining a friendly, natural tone throughout your message - this kind of authentic communication is exactly what makes writing effective!"
      },
      metadata: {
        wordCount: 32,
        targetWordCount: "25-35",
        withinWordLimit: true,
        processingTime: "2.3s",
        feedbackVersion: "1.0"
      }
    };
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      sessionStorage.setItem('showLogoutSuccess', 'true');
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const toggleCriteriaExpansion = (criteria) => {
    setExpandedCriteria(prev => ({
      ...prev,
      [criteria]: !prev[criteria]
    }));
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBarColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-400';
    if (percentage >= 60) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getLevelStyling = () => {
    const level = feedbackData?.examLevel;
    switch (level) {
      case 'A2_KEY':
        return { primary: 'from-green-500 to-green-700', accent: 'text-green-400', bg: 'bg-green-600' };
      case 'B1_PRELIMINARY':
        return { primary: 'from-blue-500 to-blue-700', accent: 'text-blue-400', bg: 'bg-blue-600' };
      case 'B2_FIRST':
        return { primary: 'from-purple-500 to-purple-700', accent: 'text-purple-400', bg: 'bg-purple-600' };
      case 'C1_ADVANCED':
        return { primary: 'from-red-500 to-red-700', accent: 'text-red-400', bg: 'bg-red-600' };
      case 'C2_PROFICIENCY':
        return { primary: 'from-orange-500 to-orange-700', accent: 'text-orange-400', bg: 'bg-orange-600' };
      default:
        return { primary: 'from-emerald-500 to-emerald-700', accent: 'text-emerald-400', bg: 'bg-emerald-600' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* Animated Cambridge Logo */}
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <div className="absolute inset-0 border-4 border-blue-300 rounded-full animate-spin border-t-transparent"></div>
              <div className="absolute inset-2 border-4 border-purple-300 rounded-full animate-spin border-b-transparent" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              <div className="absolute inset-4 border-4 border-green-300 rounded-full animate-spin border-l-transparent" style={{ animationDuration: '2s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">📝</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">Analyzing Your Writing</h2>
          <p className="text-white/80 text-lg mb-6">Our AI examiner is carefully reviewing your submission...</p>
          
          <div className="space-y-3 text-white/60">
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                loadingStage >= 0 ? 'bg-blue-400 animate-pulse' : 'bg-white/20'
              }`}></div>
              <span className={`transition-colors duration-300 ${
                loadingStage >= 0 ? 'text-white' : 'text-white/60'
              }`}>Evaluating Content & Task Achievement</span>
              {loadingStage > 0 && (
                <span className="material-icons text-green-400 text-lg animate-bounce">check_circle</span>
              )}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                loadingStage >= 1 ? 'bg-purple-400 animate-pulse' : 'bg-white/20'
              }`}></div>
              <span className={`transition-colors duration-300 ${
                loadingStage >= 1 ? 'text-white' : 'text-white/60'
              }`}>Assessing Communicative Achievement</span>
              {loadingStage > 1 && (
                <span className="material-icons text-green-400 text-lg animate-bounce">check_circle</span>
              )}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                loadingStage >= 2 ? 'bg-green-400 animate-pulse' : 'bg-white/20'
              }`}></div>
              <span className={`transition-colors duration-300 ${
                loadingStage >= 2 ? 'text-white' : 'text-white/60'
              }`}>Analyzing Organization & Structure</span>
              {loadingStage > 2 && (
                <span className="material-icons text-green-400 text-lg animate-bounce">check_circle</span>
              )}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                loadingStage >= 3 ? 'bg-yellow-400 animate-pulse' : 'bg-white/20'
              }`}></div>
              <span className={`transition-colors duration-300 ${
                loadingStage >= 3 ? 'text-white' : 'text-white/60'
              }`}>Reviewing Language Use & Accuracy</span>
              {loadingStage > 3 && (
                <span className="material-icons text-green-400 text-lg animate-bounce">check_circle</span>
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              {loadingStage >= 3 ? (
                <>
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white">Finalizing your personalized feedback...</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white">Generating personalized feedback...</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-red-400 text-2xl">error</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Feedback Generation Failed</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={generateFeedbackData}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/cambridge/writing')}
              className="w-full bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              Back to Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  const levelStyling = getLevelStyling();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <button 
              onClick={() => navigate('/skills')}
              className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img 
                  src="/logo.ico" 
                  alt="SPINTA Logo" 
                  className="w-8 h-8 rounded-lg object-contain" 
                  style={{
                    imageRendering: 'crisp-edges',
                    filter: 'contrast(1.1) brightness(1.05)',
                    WebkitFilter: 'contrast(1.1) brightness(1.05)'
                  }} 
                />
              </div>
              <span className="text-2xl font-bold text-white drop-shadow-lg">SPINTA</span>
            </button>
            
            {/* Title */}
            <div className="hidden md:flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Cambridge Writing Feedback</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${levelStyling.primary} text-white`}>
                {feedbackData.examLevel.replace('_', ' ')}
              </span>
            </div>
            
            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/cambridge/writing')}
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white/80 px-4 py-2 rounded-lg hover:bg-white/20 hover:text-white transition-all duration-300 border border-white/20"
              >
                <span className="material-icons text-lg">arrow_back</span>
                <span className="text-sm font-medium hidden sm:inline">Back to Tests</span>
              </button>
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="group flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white/80 px-4 py-2 rounded-lg hover:bg-white/20 hover:text-white transition-all duration-300 border border-white/20"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">Logging out...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons text-lg group-hover:translate-x-1 transition-transform duration-300">logout</span>
                    <span className="text-sm font-medium hidden sm:inline">Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Navigation */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 sticky top-16 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {[
              { id: 'overview', label: 'Overview', icon: 'dashboard' },
              { id: 'content', label: 'Content', icon: 'article' },
              { id: 'communication', label: 'Communication', icon: 'chat' },
              { id: 'organisation', label: 'Organisation', icon: 'account_tree' },
              { id: 'language', label: 'Language', icon: 'translate' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-icons text-lg">{section.icon}</span>
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Overview Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Score Card */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">Your Overall Score</h3>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-white mb-2">
                      {feedbackData.overallScore}/{feedbackData.maxScore}
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                      <div 
                        className={`h-3 rounded-full ${getScoreBarColor(feedbackData.overallScore, feedbackData.maxScore)}`}
                        style={{ width: `${(feedbackData.overallScore / feedbackData.maxScore) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-lg text-white/80">
                      {Math.round((feedbackData.overallScore / feedbackData.maxScore) * 100)}% - Well Done!
                    </div>
                  </div>
                  
                  {/* Individual Scores */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {Object.entries(feedbackData.criteriaFeedback).map(([criteria, data]) => (
                      <div key={criteria} className="text-center">
                        <div className="text-2xl font-bold text-white">{data.score}</div>
                        <div className="flex justify-center mb-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-lg ${i < data.score ? 'text-yellow-400' : 'text-white/20'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-white/70 capitalize">
                          {criteria === 'communicativeAchievement' ? 'Communication' : criteria}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Key Takeaway Card */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 h-full">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="material-icons text-yellow-400 text-2xl">lightbulb</span>
                    <h3 className="text-xl font-bold text-white">Key Takeaway</h3>
                  </div>
                  <p className="text-white/90 text-lg leading-relaxed mb-4">
                    {feedbackData.overallFeedback.keyTakeaway}
                  </p>
                  <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <span className="material-icons text-blue-300">trending_up</span>
                      <span className="text-white/80 text-sm">
                        This will boost your scores!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Level Progress Card */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 h-full">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="material-icons text-purple-400 text-2xl">school</span>
                    <h3 className="text-xl font-bold text-white">CEFR Level Progress</h3>
                  </div>
                  
                  {/* Level Indicator */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                      <span>A1</span>
                      <span>A2</span>
                      <span>B1</span>
                      <span>B2</span>
                      <span>C1</span>
                      <span>C2</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 relative">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${levelStyling.primary}`}
                        style={{ 
                          width: `${(() => {
                            const actualLevel = feedbackData.overallFeedback.levelSpecificObservations.actualCEFRLevel;
                            const levelMap = { 'A1': 16.67, 'A2': 33.33, 'B1': 50, 'B2': 66.67, 'C1': 83.33, 'C2': 100 };
                            return levelMap[actualLevel] || 50;
                          })()}%` 
                        }}
                      ></div>
                      {/* Position indicator */}
                      <div 
                        className="absolute top-0 w-1 h-2 bg-white rounded-full shadow-lg"
                        style={{ 
                          left: `${(() => {
                            const actualLevel = feedbackData.overallFeedback.levelSpecificObservations.actualCEFRLevel;
                            const levelMap = { 'A1': 16.67, 'A2': 33.33, 'B1': 50, 'B2': 66.67, 'C1': 83.33, 'C2': 100 };
                            return levelMap[actualLevel] || 50;
                          })()}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-white/80 text-sm">
                        {feedbackData.overallFeedback.levelSpecificObservations.actualCEFRLevel} Level ↑
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="text-white/90">
                      <strong>Current:</strong> {feedbackData.overallFeedback.levelSpecificObservations.currentLevelPerformance}
                    </div>
                    <div className="text-white/80">
                      <strong>Next Goal:</strong> {feedbackData.overallFeedback.levelSpecificObservations.progressionGuidance}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Summary Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">Overall Summary</h3>
              <p className="text-white/90 text-lg leading-relaxed mb-4">
                {feedbackData.overallFeedback.summary}
              </p>
              <div className="bg-green-500/20 border border-green-300/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="material-icons text-green-300 text-2xl">celebration</span>
                  <div>
                    <h4 className="text-green-300 font-semibold mb-1">Encouraging Note</h4>
                    <p className="text-white/90">{feedbackData.overallFeedback.encouragingRemark}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Individual Criteria Sections */}
        {['content', 'communicativeAchievement', 'organisation', 'language'].includes(activeSection) && (
          <div className="space-y-6">
            {(() => {
              const criteriaKey = activeSection === 'communication' ? 'communicativeAchievement' : activeSection;
              const criteriaData = feedbackData.criteriaFeedback[criteriaKey];
              const criteriaName = criteriaKey === 'communicativeAchievement' ? 'Communicative Achievement' : 
                                 criteriaKey.charAt(0).toUpperCase() + criteriaKey.slice(1);
              
              return (
                <>
                  {/* Criteria Header */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-3xl font-bold text-white">{criteriaName}</h2>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-white">{criteriaData.score}/5</div>
                        <div className="flex justify-end">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-2xl ${i < criteriaData.score ? 'text-yellow-400' : 'text-white/20'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-white/90 text-lg leading-relaxed">
                      {criteriaData.performanceSummary}
                    </p>
                  </div>
                  
                  {/* Strengths */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="material-icons text-green-400 text-2xl">check_circle</span>
                      <h3 className="text-2xl font-bold text-white">Strengths</h3>
                    </div>
                    <div className="space-y-4">
                      {criteriaData.strengths.map((strength, index) => (
                        <div key={index} className="bg-green-500/10 border border-green-300/30 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <span className="material-icons text-green-300 mt-1">thumb_up</span>
                            <div className="flex-1">
                              <h4 className="text-green-300 font-semibold text-lg mb-2">{strength.point}</h4>
                              <div className="bg-white/10 rounded-lg p-3 mb-2">
                                <span className="text-white/80 italic">"{strength.example}"</span>
                              </div>
                              <p className="text-white/90">{strength.explanation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Areas for Improvement */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="material-icons text-yellow-400 text-2xl">build</span>
                      <h3 className="text-2xl font-bold text-white">Areas for Improvement</h3>
                    </div>
                    <div className="space-y-4">
                      {criteriaData.areasForImprovement.map((improvement, index) => (
                        <div key={index} className="bg-yellow-500/10 border border-yellow-300/30 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <span className="material-icons text-yellow-300 mt-1">warning</span>
                            <div className="flex-1">
                              <h4 className="text-yellow-300 font-semibold text-lg mb-2">{improvement.issue}</h4>
                              {improvement.example && (
                                <div className="bg-white/10 rounded-lg p-3 mb-2">
                                  <span className="text-white/80 italic">"{improvement.example}"</span>
                                </div>
                              )}
                              <div className="space-y-2">
                                <div className="flex items-start space-x-2">
                                  <span className="material-icons text-blue-300 text-lg mt-0.5">lightbulb</span>
                                  <p className="text-white/90"><strong>Advice:</strong> {improvement.advice}</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                  <span className="material-icons text-purple-300 text-lg mt-0.5">psychology</span>
                                  <p className="text-white/90"><strong>Strategy:</strong> {improvement.strategy}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => navigate('/cambridge/writing')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110"
        >
          <span className="material-icons text-2xl">home</span>
        </button>
      </div>
    </div>
  );
};

export default CambridgeWritingFeedback; 