import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ChevronRight, ChevronLeft, RotateCcw, Home, Book, Award, Sparkles, Lightbulb, Brain, Zap, CheckCircle, ArrowRight, Users, Globe, BookOpen, Target, Star, TrendingUp } from 'lucide-react';
import genAIService from '../../services/genAIService.js';


// Enhanced suggestion topics organized by categories
const SUGGESTION_CATEGORIES = [
  {
    title: "IELTS Essentials",
    icon: Target,
    color: "from-cyan-500 to-blue-500",
    topics: ["IELTS Speaking Part 1", "IELTS Writing Task 1", "IELTS Academic Vocabulary", "IELTS Band 7+ Words", "IELTS Linking Words"]
  },
  {
    title: "Grammar Mastery",
    icon: BookOpen,
    color: "from-purple-500 to-indigo-500",
    topics: ["Complex Conditionals", "Advanced Tenses", "Modal Verbs", "Passive Voice", "Reported Speech"]
  },
  {
    title: "Vocabulary Building",
    icon: Brain,
    color: "from-emerald-500 to-teal-500",
    topics: ["Academic Collocations", "Business English", "Scientific Terms", "Environmental Vocabulary", "Technology Vocabulary"]
  },
  {
    title: "Speaking & Fluency",
    icon: Users,
    color: "from-pink-500 to-rose-500",
    topics: ["Conversation Starters", "Opinion Expressions", "Debate Vocabulary", "Presentation Skills", "Informal vs Formal Speech"]
  },
  {
    title: "Writing Excellence",
    icon: Star,
    color: "from-amber-500 to-orange-500",
    topics: ["Essay Transitions", "Argumentative Phrases", "Academic Writing Style", "Coherence & Cohesion", "Task 2 Structures"]
  },
  {
    title: "Test Strategies",
    icon: TrendingUp,
    color: "from-violet-500 to-purple-500",
    topics: ["Reading Techniques", "Listening Strategies", "Time Management", "Error Analysis", "Exam Confidence"]
  }
];

// Flashcards will be generated using genAIService

const FlashCards = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [currentTopic, setCurrentTopic] = useState("");
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [cardColors] = useState(() => {
    const colors = [
      'from-cyan-500 to-blue-500',
      'from-blue-500 to-indigo-500',
      'from-emerald-500 to-teal-500',
      'from-purple-500 to-violet-500',
      'from-pink-500 to-rose-500',
      'from-amber-500 to-yellow-500',
      'from-teal-500 to-emerald-500',
      'from-fuchsia-500 to-purple-500',
      'from-blue-500 to-cyan-500',
      'from-indigo-500 to-purple-500'
    ];
    return [...colors].sort(() => Math.random() - 0.5);
  });

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      // Simulate logout process
      setTimeout(() => {
        alert('Logged out successfully!');
        setIsLoggingOut(false);
      }, 2000);
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleTopicChange = (e) => {
    const words = e.target.value.split(' ').filter(word => word.trim() !== '');
    if (words.length <= 10) {
      setTopic(e.target.value);
    }
  };

  const addSuggestion = (suggestion) => {
    setTopic(suggestion);
  };

  const handleSubmit = async () => {
    if (!topic.trim()) return;
    
    setIsLoading(true);
    
    try {
      const cards = await genAIService.generateFlashCards(topic);
      setFlashcards(cards);
      setCurrentTopic(topic);
      setShowFlashcards(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setIsComplete(true);
      }
    }, 300);
  };
  
  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex - 1);
      }, 300);
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  };

  const handleBackToHome = () => {
    setShowFlashcards(false);
    setTopic("");
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Enhanced custom styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .perspective-1000 {
        perspective: 1000px;
      }
      
      .rotate-y-180 {
        transform: rotateY(180deg);
      }
      
      .backface-hidden {
        backface-visibility: hidden;
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      .floating {
        animation: float 3s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
        70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
      
      .pulsing {
        animation: pulse 2s infinite;
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
      }
      
      .bouncing {
        animation: bounce 2s ease infinite;
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      .shimmer {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
      
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .slide-up {
        animation: slideUp 0.6s ease-out;
      }
      
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      
      .scale-in {
        animation: scaleIn 0.4s ease-out;
      }
      
      .glass-morphism {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .category-card:hover .category-icon {
        transform: scale(1.1) rotate(5deg);
      }
      
      .category-icon {
        transition: transform 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const currentCardColor = cardColors[currentCardIndex % cardColors.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse floating"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-10 right-10 w-4 h-4 bg-cyan-400/30 rounded-full floating delay-500"></div>
        <div className="absolute top-1/3 left-10 w-6 h-6 bg-purple-400/30 rotate-45 floating delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-pink-400/30 rounded-full floating delay-1500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass-morphism border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <button 
              onClick={() => navigate('/skills')}
              className="flex items-center space-x-2 slide-up hover:scale-105 transition-transform duration-300"
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
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/play-zone')}
                className="text-white/80 hover:text-white transition duration-300 flex items-center space-x-1 hover:scale-105 transform"
              >
                <span className="material-icons text-sm">arrow_back</span>
                <span>Play Zone</span>
              </button>
              <div className="text-white/60">|</div>
              <span className="text-white/80 font-medium relative">
                Flash Cards
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
              </span>
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="group flex items-center space-x-2 glass-morphism text-white/80 px-4 py-2 rounded-lg hover:bg-white/20 hover:text-white transition-all duration-300 transform hover:scale-105"
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
                    <span className="text-sm font-medium">Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-12 pt-8">
        <div className="max-w-7xl mx-auto">
          {!showFlashcards ? (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 slide-up">
                <div className="inline-block mb-6 relative">
                  <div className="absolute -top-12 -right-12 w-24 h-24 text-cyan-400 floating">
                    <Lightbulb size={64} />
                  </div>
                  <div className="absolute -top-8 -left-8 w-16 h-16 text-purple-400/50 floating delay-1000">
                    <Sparkles size={32} />
                  </div>
                  <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4">
                    Create Your Study Cards
                  </h1>
                </div>
                <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                  Generate custom flashcards powered by AI for IELTS, TOEFL, and Cambridge exams to boost your learning experience
                </p>
              </div>
              
              <div className="glass-morphism rounded-3xl shadow-2xl p-8 mb-12 transform hover:shadow-3xl border border-white/20 scale-in">
                <div className="relative mb-10">
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-2xl flex items-center justify-center border-4 border-white/20 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Zap className="text-cyan-400" size={32} />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={topic}
                      onChange={handleTopicChange}
                      placeholder="Enter a topic to study (e.g., IELTS Speaking Part 2, Academic Vocabulary)"
                      className="w-full px-8 py-5 pr-20 rounded-2xl border-2 border-white/20 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/30 focus:outline-none shadow-xl text-lg glass-morphism text-white placeholder-white/50 transition-all duration-300 hover:shadow-2xl"
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && topic.trim()) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={!topic.trim() || isLoading}
                      className={`absolute right-4 top-4 p-4 rounded-xl ${
                        !topic.trim() 
                          ? 'bg-gray-400/50 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 pulsing hover:scale-110'
                      } text-white transition-all duration-300 shadow-lg`}
                    >
                      <Send size={24} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-2xl font-bold text-white/90 flex items-center">
                      <Globe className="mr-3 text-cyan-400" size={28} />
                      Study Categories
                    </p>
                    <div className="flex space-x-2">
                      {SUGGESTION_CATEGORIES.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedCategory(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            selectedCategory === index 
                              ? 'bg-cyan-400 scale-125' 
                              : 'bg-white/30 hover:bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {SUGGESTION_CATEGORIES.map((category, categoryIndex) => {
                      const IconComponent = category.icon;
                      return (
                        <div
                          key={categoryIndex}
                          className={`category-card glass-morphism rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                            selectedCategory === categoryIndex ? 'ring-2 ring-cyan-400/50' : ''
                          }`}
                          onMouseEnter={() => setHoveredCategory(categoryIndex)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          onClick={() => setSelectedCategory(categoryIndex)}
                        >
                          <div className="flex items-center mb-4">
                            <div className={`category-icon w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center shadow-lg mr-4`}>
                              <IconComponent size={24} className="text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white">{category.title}</h3>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {category.topics.slice(0, selectedCategory === categoryIndex ? category.topics.length : 3).map((topic, topicIndex) => (
                              <button
                                key={topicIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addSuggestion(topic);
                                }}
                                className="text-left glass-morphism border border-white/10 rounded-lg px-3 py-2 text-sm hover:bg-white/20 hover:border-cyan-300/50 transition-all duration-300 transform hover:scale-102 group"
                              >
                                <span className="text-white/80 font-medium group-hover:text-white flex items-center">
                                  <span className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mr-2"></span>
                                  {topic}
                                </span>
                              </button>
                            ))}
                            {selectedCategory !== categoryIndex && category.topics.length > 3 && (
                              <button
                                onClick={() => setSelectedCategory(categoryIndex)}
                                className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors flex items-center"
                              >
                                <span>+{category.topics.length - 3} more</span>
                                <ChevronRight size={16} className="ml-1" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {isLoading && (
                <div className="flex flex-col items-center justify-center p-16 glass-morphism rounded-3xl shadow-2xl border border-white/20 scale-in">
                  <div className="w-48 h-48 relative mb-8">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse"></div>
                    <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-500/30 animate-pulse delay-300"></div>
                    <div className="absolute inset-8 rounded-full bg-gradient-to-r from-cyan-500/40 to-blue-500/40 animate-pulse delay-500"></div>
                    <svg className="animate-spin w-full h-full text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 glass-morphism rounded-full flex items-center justify-center shadow-2xl">
                        <span role="img" aria-label="brain" className="text-5xl floating">🧠</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-bold mb-3">Creating Your Flashcards...</p>
                  <p className="text-white/70 text-lg">Our AI is crafting personalized learning materials</p>
                  <div className="mt-6 flex space-x-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}

              <div className="glass-morphism rounded-3xl shadow-2xl p-10 mt-12 border border-white/20 relative overflow-hidden slide-up">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-bl-full opacity-70"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-pink-500/20 rounded-tr-full opacity-70"></div>
                
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center relative z-10">
                  <Book size={32} className="mr-4 text-cyan-400" /> How It Works
                </h2>
                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-6">
                    <div className="flex items-start glass-morphism p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 group">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-2xl flex items-center justify-center mr-6 shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-cyan-400 font-bold text-xl">1</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-cyan-400 mb-2 text-lg">Choose Your Topic</h3>
                        <p className="text-white/70 leading-relaxed">Select from our curated categories or enter your own topic for IELTS, TOEFL, or Cambridge preparation</p>
                      </div>
                    </div>
                    <div className="flex items-start glass-morphism p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 group">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-2xl flex items-center justify-center mr-6 shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-cyan-400 font-bold text-xl">2</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-cyan-400 mb-2 text-lg">Generate Cards</h3>
                        <p className="text-white/70 leading-relaxed">Our AI creates personalized flashcards tailored to your learning needs and exam requirements</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start glass-morphism p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 group">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-2xl flex items-center justify-center mr-6 shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-cyan-400 font-bold text-xl">3</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-cyan-400 mb-2 text-lg">Study & Memorize</h3>
                        <p className="text-white/70 leading-relaxed">Interactive flashcards with smooth animations make learning engaging and effective</p>
                      </div>
                    </div>
                    <div className="flex items-start glass-morphism p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 group">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-2xl flex items-center justify-center mr-6 shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-cyan-400 font-bold text-xl">4</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-cyan-400 mb-2 text-lg">Master & Progress</h3>
                        <p className="text-white/70 leading-relaxed">Track your progress and achieve your target scores with confidence!</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 text-center relative z-10">
                  <div className="inline-flex items-center text-cyan-400 font-bold px-8 py-4 rounded-2xl glass-morphism shadow-lg">
                    <Sparkles size={20} className="mr-3" />
                    Perfect for IELTS, TOEFL & Cambridge exam preparation!
                    <Target size={20} className="ml-3" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="glass-morphism rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
                <div className="flex justify-between items-center mb-8">
                  <button 
                    onClick={handleBackToHome}
                    className="flex items-center text-cyan-400 hover:text-cyan-300 transition-all duration-300 glass-morphism hover:bg-cyan-400/20 px-6 py-3 rounded-xl shadow-lg transform hover:scale-105"
                  >
                    <Home size={20} className="mr-2" /> Back to Topics
                  </button>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text flex items-center">
                    <Target size={28} className="mr-3 text-cyan-400" />
                    {currentTopic}
                  </h2>
                  <div className="w-32"></div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center">
                  {!isComplete ? (
                    <div className="w-full">
                      <div className="mb-8 flex justify-between items-center">
                        <div className="glass-morphism px-6 py-3 rounded-xl flex items-center border border-cyan-400/20 shadow-lg">
                          <span className="text-xl text-cyan-400 font-bold">
                            Card {currentCardIndex + 1} of {flashcards.length}
                          </span>
                        </div>
                        {isFlipped && (
                          <div className="flex items-center glass-morphism px-6 py-3 rounded-xl border border-emerald-400/20 shadow-lg animate-pulse">
                            <Award className="text-emerald-400 mr-2" size={20} />
                            <span className="text-white/80 font-medium">Tap to continue</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full flex justify-center mb-6">
                        <div className="flex items-center justify-center space-x-2 w-full max-w-md glass-morphism p-3 rounded-xl">
                          {flashcards.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-2 rounded-full transition-all duration-500 ${
                                idx < currentCardIndex
                                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 flex-grow shadow-lg'
                                  : idx === currentCardIndex
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 flex-grow-[2] pulsing shadow-lg'
                                  : 'bg-white/30 flex-grow'
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="perspective-1000 w-full h-[550px] mb-10">
                        <div 
                          className={`relative w-full h-full transform transition-transform duration-700 cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                          onClick={flipCard}
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          <div 
                            className={`absolute inset-0 w-full h-full bg-gradient-to-br ${currentCardColor} rounded-3xl shadow-2xl p-10 flex flex-col items-center justify-center backface-hidden hover:shadow-3xl transition-shadow duration-300`}
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <div className="absolute top-8 left-8 bg-white bg-opacity-20 rounded-2xl h-16 w-16 flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-2xl">{currentCardIndex + 1}</span>
                            </div>
                            
                            <div className="absolute top-8 right-8 bg-white bg-opacity-20 rounded-xl h-12 w-12 flex items-center justify-center shadow-lg">
                              <span className="text-white text-lg font-bold">Q</span>
                            </div>
                            
                            <div className="absolute -bottom-4 -right-4 w-32 h-32 text-white text-opacity-10 transform rotate-12">
                              <Brain size={128} />
                            </div>
                            
                            <h3 className="text-4xl font-bold text-white mb-6 flex items-center">
                              <Lightbulb className="mr-3" size={36} /> Question
                            </h3>
                            <div className="bg-white bg-opacity-95 rounded-2xl p-10 w-full max-w-3xl shadow-2xl border-4 border-white border-opacity-20">
                              <p className="text-center text-gray-800 text-2xl font-medium leading-relaxed">
                                {flashcards[currentCardIndex].front}
                              </p>
                            </div>
                            <p className="text-white text-opacity-90 mt-10 text-xl flex items-center font-medium">
                              <ArrowRight className="mr-3 bouncing" size={24} /> Tap to reveal answer
                            </p>
                          </div>
                          
                          <div 
                            className={`absolute inset-0 w-full h-full bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center justify-center backface-hidden rotate-y-180 hover:shadow-3xl transition-shadow duration-300`}
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                          >
                            <div className="absolute top-8 left-8 bg-gray-100 rounded-2xl h-16 w-16 flex items-center justify-center shadow-lg">
                              <span className={`font-bold text-2xl bg-gradient-to-br ${currentCardColor} text-transparent bg-clip-text`}>
                                {currentCardIndex + 1}
                              </span>
                            </div>
                            
                            <div className="absolute top-8 right-8 bg-gray-100 rounded-xl h-12 w-12 flex items-center justify-center shadow-lg">
                              <span className={`bg-gradient-to-br ${currentCardColor} text-transparent bg-clip-text text-lg font-bold`}>A</span>
                            </div>
                            
                            <div className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-100 transform rotate-12">
                              <CheckCircle size={128} />
                            </div>
                            
                            <h3 className={`text-4xl font-bold mb-6 bg-gradient-to-br ${currentCardColor} text-transparent bg-clip-text flex items-center`}>
                              <Award className="mr-3" size={36} /> Answer
                            </h3>
                            <div className={`border-4 border-gray-200 rounded-2xl p-10 w-full max-w-3xl shadow-2xl bg-gradient-to-br from-gray-50 to-white`}>
                              <p className="text-center text-gray-800 text-2xl leading-relaxed font-medium">
                                {flashcards[currentCardIndex].back}
                              </p>
                            </div>
                            <p className="text-gray-400 mt-10 text-xl flex items-center font-medium">
                              <ArrowRight className="mr-3 bouncing" size={24} /> Tap to flip back
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center w-full max-w-3xl mx-auto">
                        <button
                          onClick={handlePrevCard}
                          disabled={currentCardIndex === 0}
                          className={`flex items-center py-4 px-8 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                            currentCardIndex === 0 
                              ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                              : 'glass-morphism hover:bg-white/30 text-white border border-white/20 hover:shadow-2xl'
                          }`}
                        >
                          <ChevronLeft size={24} className="mr-2" /> Previous
                        </button>
                        
                        <button
                          onClick={handleNextCard}
                          className="flex items-center py-4 px-8 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white hover:shadow-2xl"
                        >
                          Next <ChevronRight size={24} className="ml-2" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-3xl text-center scale-in">
                      <div className="glass-morphism rounded-3xl shadow-2xl p-16 mb-10 border border-white/20">
                        <div className="w-40 h-40 mx-auto mb-8 relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full animate-pulse"></div>
                          <div className="absolute inset-4 bg-gradient-to-r from-cyan-400/50 to-blue-500/50 rounded-full animate-pulse delay-300"></div>
                          <div className="absolute inset-8 bg-gradient-to-r from-cyan-400/70 to-blue-500/70 rounded-full animate-pulse delay-500"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Award className="text-cyan-400" size={80} />
                          </div>
                        </div>
                        <h3 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text mb-6">Congratulations! 🎉</h3>
                        <p className="text-2xl text-white/80 mb-10 leading-relaxed">
                          You've mastered all flashcards for: <br />
                          <span className="font-bold text-cyan-400 text-3xl">{currentTopic}</span>
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                          <button
                            onClick={handleRestart}
                            className="flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 px-10 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                          >
                            <RotateCcw size={24} className="mr-3" /> Study Again
                          </button>
                          <button
                            onClick={handleBackToHome}
                            className="flex items-center justify-center glass-morphism hover:bg-white/30 text-white py-4 px-10 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 border border-white/20 hover:shadow-2xl"
                          >
                            <Home size={24} className="mr-3" /> New Topic
                          </button>
                        </div>
                      </div>
                      
                      <div className="glass-morphism rounded-2xl p-8 shadow-xl border border-white/20">
                        <h4 className="text-2xl font-bold text-cyan-400 mb-4">
                          Excellent Progress! 🚀
                        </h4>
                        <p className="text-white/70 text-lg leading-relaxed">
                          Regular practice with flashcards is one of the most effective ways to prepare for your IELTS, TOEFL, or Cambridge exam. Keep up the momentum!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="relative z-10 border-t border-white/20 glass-morphism py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-cyan-400 font-bold text-lg mb-4 md:mb-0 flex items-center">
              <Sparkles size={20} className="mr-2" />
              Designed for focused exam preparation
            </p>
            <div className="flex space-x-8">
              <span className="text-white/60 flex items-center hover:text-white/80 transition-colors">
                <Brain size={18} className="mr-2" /> Learn
              </span>
              <span className="text-white/60 flex items-center hover:text-white/80 transition-colors">
                <Award size={18} className="mr-2" /> Practice
              </span>
              <span className="text-white/60 flex items-center hover:text-white/80 transition-colors">
                <CheckCircle size={18} className="mr-2" /> Master
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FlashCards;
