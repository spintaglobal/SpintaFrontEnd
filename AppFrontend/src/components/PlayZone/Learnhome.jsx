import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';

const LearnHome = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTopics, setFilteredTopics] = useState([]);
  
  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      
      // Store logout intent in sessionStorage
      sessionStorage.setItem('showLogoutSuccess', 'true');
      
      // Sign out and immediately navigate
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };
  
  const grammarTopics = [
    {
      name: "Subject-Verb Agreement",
      icon: "rule",
      color: "from-cyan-500 to-blue-500"
    },
    {
      name: "Verb Tenses (Basic)",
      icon: "schedule",
      color: "from-blue-500 to-indigo-500"
    },
    {
      name: "Verb Tenses (Advanced)",
      icon: "update",
      color: "from-indigo-500 to-purple-500"
    },
    {
      name: "Pronoun Agreement and Case",
      icon: "person",
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Articles (a, an, the)",
      icon: "text_fields",
      color: "from-pink-500 to-rose-500"
    },
    {
      name: "Punctuation",
      icon: "more_horiz",
      color: "from-rose-500 to-red-500"
    },
    {
      name: "Sentence Structure (Clauses and Phrases)",
      icon: "sort",
      color: "from-emerald-500 to-teal-500"
    },
    {
      name: "Sentence Structure (Sentence Types)",
      icon: "sort_by_alpha",
      color: "from-teal-500 to-cyan-500"
    },
    {
      name: "Modifiers (Adjectives and Adverbs)",
      icon: "design_services",
      color: "from-amber-500 to-orange-500"
    },
    {
      name: "Prepositions and Prepositional Phrases",
      icon: "arrow_right_alt",
      color: "from-orange-500 to-red-500"
    },
    {
      name: "Conjunctions",
      icon: "link",
      color: "from-violet-500 to-purple-500"
    },
    {
      name: "Word Order (Syntax)",
      icon: "reorder",
      color: "from-lime-500 to-green-500"
    },
    {
      name: "Active and Passive Voice",
      icon: "sync_alt",
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Gerunds and Infinitives",
      icon: "line_style",
      color: "from-sky-500 to-blue-500"
    },
    {
      name: "Participles",
      icon: "short_text",
      color: "from-fuchsia-500 to-pink-500"
    },
    {
      name: "Countable and Uncountable Nouns",
      icon: "pin",
      color: "from-slate-500 to-gray-500"
    },
    {
      name: "Determiners",
      icon: "straighten",
      color: "from-yellow-500 to-amber-500"
    },
    {
      name: "Modal Verbs",
      icon: "event_available",
      color: "from-emerald-400 to-teal-400"
    },
    {
      name: "Reported Speech (Indirect Speech)",
      icon: "record_voice_over",
      color: "from-blue-400 to-indigo-400"
    },
    {
      name: "Conditional Sentences (If-Clauses)",
      icon: "call_split",
      color: "from-purple-400 to-violet-400"
    },
    {
      name: "Phrasal Verbs",
      icon: "fork_right",
      color: "from-pink-400 to-rose-400"
    }
  ];
  
  useEffect(() => {
    setFilteredTopics(grammarTopics);
  }, []);
  
  useEffect(() => {
    if (searchTerm) {
      const filtered = grammarTopics.filter(topic => 
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTopics(filtered);
    } else {
      setFilteredTopics(grammarTopics);
    }
  }, [searchTerm]);
  
  const handleTopicClick = (topic) => {
    const topicIndex = grammarTopics.findIndex(t => t.name === topic.name) + 1;
    navigate(`/play-zone/learn/${topicIndex}`);
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
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
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/play-zone')}
                className="text-white/80 hover:text-white transition duration-200 flex items-center space-x-1"
              >
                <span className="material-icons text-sm">arrow_back</span>
                <span>Play Zone</span>
              </button>
              <div className="text-white/60">|</div>
              <span className="text-white/80 font-medium">Learn</span>
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center space-x-4">
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
                    <span className="text-sm font-medium">Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-12 pt-8">
        <div className="max-w-6xl mx-auto">{selectedTopic ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-8" style={{background: `linear-gradient(135deg, ${selectedTopic.color.replace('from-', '').split(' to-')[0]}/20, ${selectedTopic.color.replace('to-', '').split(' ')[1]}/20)`}}>
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg"
                  style={{background: `linear-gradient(135deg, ${selectedTopic.color.replace('from-', '').split(' to-')[0]}/40, ${selectedTopic.color.replace('to-', '').split(' ')[1]}/40)`}}
                >
                  <span className="material-icons text-white text-3xl">
                    {selectedTopic.icon}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-center text-white mb-4">
                  {selectedTopic.name}
                </h3>
              </div>
              
              <div className="p-8">
                <p className="text-white/70 mb-6 text-center">
                  Content for {selectedTopic.name} will be added soon. Check back later for lessons, exercises, and examples.
                </p>
                
                <div className="bg-cyan-400/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-cyan-400/20">
                  <div className="flex items-center mb-3">
                    <span className="material-icons text-cyan-400 mr-2">info</span>
                    <h4 className="text-lg font-semibold text-cyan-400">About This Topic</h4>
                  </div>
                  <p className="text-white/70">This section will include comprehensive lessons, practice exercises, and examples to help you master {selectedTopic.name} for IELTS success.</p>
                </div>
                
                <div className="text-center">
                  <button 
                    onClick={() => setSelectedTopic(null)}
                    className={`inline-flex items-center bg-gradient-to-r ${selectedTopic.color} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                  >
                    <span className="material-icons mr-2">arrow_back</span>
                    Back to Topics
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-6 shadow-xl">
                  <span className="material-icons text-white text-3xl">auto_stories</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Grammar Topics
                  </span>
                </h1>
                <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                  Master essential grammar concepts with interactive lessons designed for IELTS success.
                </p>
              </div>

              {/* Search Box */}
              <div className="max-w-md mx-auto mb-12">
                <div className="relative">
                  <span className="material-icons absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 text-xl">search</span>
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-white/20 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 focus:outline-none shadow-sm text-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/50 transition-all duration-300"
                  />
                  {searchTerm && (
                    <button 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                      onClick={() => setSearchTerm('')}
                    >
                      <span className="material-icons">close</span>
                    </button>
                  )}
                </div>
              </div>
            
              {/* Grammar Topics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map((topic, index) => (
                  <button 
                    key={index}
                    className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 text-left transform hover:scale-105 hover:shadow-xl"
                    onClick={() => handleTopicClick(topic)}
                    style={{animationDelay: `${0.05 * (index % 10)}s`}}
                  >
                    <div className="flex items-center mb-4">
                      <div 
                        className={`w-12 h-12 bg-gradient-to-br ${topic.color} rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <span className="material-icons text-white text-xl">
                          {topic.icon}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-white flex-1">
                        {topic.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/60 group-hover:text-white/80">
                      <span>Click to learn</span>
                      <span className="material-icons text-lg group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {filteredTopics.length === 0 && (
                <div className="text-center p-12 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
                  <span className="material-icons text-white/40 text-6xl mb-4 block">search_off</span>
                  <p className="text-xl text-white/80 mb-6">No topics found matching "{searchTerm}"</p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <footer className="relative z-10 border-t border-white/20 bg-black/20 backdrop-blur-lg py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-cyan-400 font-medium mb-4 md:mb-0">Designed for focused IELTS preparation</p>
            <div className="flex space-x-4">
              <span className="text-white/60 flex items-center">
                <span className="material-icons text-lg mr-1">auto_stories</span>
                Learn
              </span>
              <span className="text-white/60 flex items-center">
                <span className="material-icons text-lg mr-1">quiz</span>
                Practice
              </span>
              <span className="text-white/60 flex items-center">
                <span className="material-icons text-lg mr-1">school</span>
                Master
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LearnHome;
