import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  AlertCircle, 
  BookOpen, 
  Headphones, 
  MessageSquare, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight, 
  Menu, 
  X,
  Star,
  Clock,
  BarChart,
  Gamepad,
  Target,
  Trophy,
  Globe,
  Zap,
  Users,
  GraduationCap
} from 'lucide-react';
import LogoutSuccessExperience from './ui/LogoutSuccessExperience.jsx';

// Simple Alert components implementation
const Alert = ({ className, children }) => {
  return (
    <div className={`p-4 rounded-lg border flex items-start gap-3 ${className}`}>
      {children}
    </div>
  );
};

const AlertTitle = ({ className, children }) => {
  return <h5 className={`font-medium ${className}`}>{children}</h5>;
};

const AlertDescription = ({ className, children }) => {
  return <div className={`text-sm ${className}`}>{children}</div>;
};

const SpintaLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const navigate = useNavigate();

  // Check for logout success message
  useEffect(() => {
    const hasLoggedOut = sessionStorage.getItem('showLogoutSuccess');
    
    if (hasLoggedOut === 'true') {
      setShowLogoutSuccess(true);
      
      // Clear the session storage flag
      sessionStorage.removeItem('showLogoutSuccess');
      
      // The LogoutSuccessExperience component handles its own timing
    }
  }, []);

  const handleLogin = () => {
    navigate('/login?tab=signin');
  };

  const handleGetStarted = () => {
    navigate('/login?tab=signup');
  };

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://spinta.ai/#organization",
        "name": "SPINTA",
        "url": "https://spinta.ai",
        "logo": {
          "@type": "ImageObject",
          "url": "https://spinta.ai/logo.ico",
          "width": 512,
          "height": 512
        },
        "description": "AI-powered online IELTS and TOEFL test preparation platform with real-time feedback, practice tests, and interactive games",
        "sameAs": []
      },
      {
        "@type": "WebSite",
        "@id": "https://spinta.ai/#website",
        "url": "https://spinta.ai",
        "name": "SPINTA - AI-Powered IELTS & TOEFL Test Preparation",
        "description": "Free online IELTS and TOEFL practice tests with AI feedback. Prepare for English proficiency exams with real-time simulation, speaking practice, and interactive learning games.",
        "publisher": {
          "@id": "https://spinta.ai/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://spinta.ai/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Course",
        "name": "IELTS Online Test Preparation Course",
        "description": "Comprehensive IELTS preparation with AI-powered feedback for all four skills: Listening, Reading, Writing, and Speaking. Get instant scoring and personalized improvement tips.",
        "provider": {
          "@id": "https://spinta.ai/#organization"
        },
        "courseMode": "online",
        "educationalLevel": "intermediate",
        "teaches": ["IELTS Listening", "IELTS Reading", "IELTS Writing", "IELTS Speaking"],
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": "online",
          "courseWorkload": "PT20H"
        }
      },
      {
        "@type": "Course",
        "name": "TOEFL iBT Online Test Preparation Course",
        "description": "Complete TOEFL iBT preparation with real-time AI feedback. Practice all sections: Reading, Listening, Speaking, and Writing with authentic test simulations.",
        "provider": {
          "@id": "https://spinta.ai/#organization"
        },
        "courseMode": "online",
        "educationalLevel": "intermediate",
        "teaches": ["TOEFL Reading", "TOEFL Listening", "TOEFL Speaking", "TOEFL Writing"],
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": "online",
          "courseWorkload": "PT20H"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is SPINTA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SPINTA is an AI-powered online platform for IELTS and TOEFL test preparation. It offers real-time exam simulations, instant AI feedback, progress tracking, and interactive learning games for all four language skills."
            }
          },
          {
            "@type": "Question",
            "name": "How much does SPINTA cost?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SPINTA offers 2 free practice tests upon registration. After that, various subscription plans are available for continued access to unlimited practice tests and features."
            }
          },
          {
            "@type": "Question",
            "name": "Can I practice IELTS speaking online?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, SPINTA provides AI-powered IELTS speaking practice with real-time feedback on pronunciation, fluency, grammar, and vocabulary usage."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
      <Helmet>
        <title>SPINTA - Free IELTS & TOEFL Practice Tests Online | AI-Powered Test Prep</title>
        <meta name="description" content="Prepare for IELTS and TOEFL with free online practice tests. Get instant AI feedback on Speaking, Writing, Reading & Listening. Start with 2 free tests. Real exam simulation." />
        <meta name="keywords" content="IELTS online practice, TOEFL test preparation, free IELTS test, TOEFL practice online, IELTS speaking practice, TOEFL listening practice, English test preparation, IELTS simulation test, TOEFL iBT practice, Cambridge English test prep, PTE preparation online, AI IELTS preparation, real-time IELTS feedback, online English exam preparation" />
        <meta property="og:title" content="SPINTA - AI-Powered IELTS & TOEFL Test Preparation" />
        <meta property="og:description" content="Master IELTS and TOEFL with AI-powered practice tests. Get instant feedback and track your progress. Start free today!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://spinta.ai" />
        <meta property="og:image" content="https://spinta.ai/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SPINTA - Free IELTS & TOEFL Practice Tests" />
        <meta name="twitter:description" content="AI-powered English test preparation with real-time feedback. Start with 2 free tests!" />
        <link rel="canonical" href="https://spinta.ai" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Modern Logout Success Experience */}
      <LogoutSuccessExperience 
        isVisible={showLogoutSuccess} 
        onClose={() => setShowLogoutSuccess(false)} 
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate('/skills')}
              className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img 
                  src="/logo.ico" 
                  alt="SPINTA Logo - AI IELTS TOEFL Test Preparation" 
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
            
            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className="flex space-x-8">
                <li><a href="#features" className="text-white/80 hover:text-white transition duration-200">Features</a></li>
                <li><a href="#exams" className="text-white/80 hover:text-white transition duration-200">Practice Tests</a></li>
                <li><a href="#games" className="text-white/80 hover:text-white transition duration-200">Learning Games</a></li>
              </ul>
            </nav>
            
            <div className="hidden md:block">
              <button 
                onClick={handleLogin}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition duration-200 font-medium shadow-lg"
              >
                Login
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-cyan-300 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/20 backdrop-blur-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className="block px-3 py-2 text-white hover:text-cyan-300">Features</a>
              <a href="#exams" className="block px-3 py-2 text-white hover:text-cyan-300">Practice Tests</a>
              <a href="#games" className="block px-3 py-2 text-white hover:text-cyan-300">Learning Games</a>
              <button 
                onClick={handleLogin}
                className="mt-2 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 mb-6">
                  <Zap className="w-4 h-4 text-cyan-400 mr-2" />
                  <span className="text-sm font-medium">AI-Powered IELTS & TOEFL Online Test Preparation</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Master <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">IELTS & TOEFL Tests</span> with AI-Powered Real-Time Feedback
              </h1>
              
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
                Experience authentic IELTS and TOEFL test preparation online. Practice Speaking, Listening, Reading & Writing with instant AI feedback, progress tracking, and interactive games. Join thousands preparing for English proficiency exams.
              </p>
              
              {/* Free Tests Offer */}
              <div className="mb-12">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-lg rounded-full border border-emerald-400/30 mb-4">
                  <Trophy className="w-5 h-5 text-emerald-400 mr-3" />
                  <span className="text-emerald-300 font-semibold text-lg">🎉 Get 2 Free IELTS/TOEFL Practice Tests Upon Registration!</span>
                </div>
                <p className="text-white/70 text-sm text-center">
                  Start your IELTS and TOEFL preparation journey with two complete practice tests at no cost
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button 
                  onClick={handleGetStarted}
                  className="group bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 text-lg font-semibold flex items-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Start Free IELTS/TOEFL Practice
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="flex items-center space-x-4 text-white/60">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    <span>Trusted by IELTS/TOEFL students</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-400" />
                    <span>4.9/5 Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Test Platforms Section */}
        <section id="exams" className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Choose Your <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Online Test Platform</span>
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Practice with authentic IELTS and TOEFL test formats online and get instant AI-powered feedback on all four skills
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* IELTS Card */}
              <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">IELTS Online Practice</h3>
                        <p className="text-white/60">International English Language Testing System</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-400">4 Skills</div>
                      <div className="text-sm text-white/60">Complete IELTS Training</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <Headphones className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <div className="text-sm font-medium">IELTS Listening</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <BookOpen className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                      <div className="text-sm font-medium">IELTS Reading</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.6 9.45c-1.95 2.7-4.5 5.25-7.2 7.2" />
                        <path d="M22 2 11 13" />
                        <path d="M9 11c-2.7 1.95-5.25 4.5-7.2 7.2" />
                      </svg>
                      <div className="text-sm font-medium">IELTS Writing</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <MessageSquare className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-sm font-medium">IELTS Speaking</div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center">
                    Start IELTS Online Practice
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* TOEFL Card */}
              <div className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">TOEFL iBT Practice</h3>
                        <p className="text-white/60">Test of English as a Foreign Language</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">4 Skills</div>
                      <div className="text-sm text-white/60">Complete TOEFL Training</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <Headphones className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <div className="text-sm font-medium">TOEFL Listening</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <BookOpen className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                      <div className="text-sm font-medium">TOEFL Reading</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.6 9.45c-1.95 2.7-4.5 5.25-7.2 7.2" />
                        <path d="M22 2 11 13" />
                        <path d="M9 11c-2.7 1.95-5.25 4.5-7.2 7.2" />
                      </svg>
                      <div className="text-sm font-medium">TOEFL Writing</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <MessageSquare className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-sm font-medium">TOEFL Speaking</div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center">
                    Start TOEFL Online Practice
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Coming Soon */}
            <div className="text-center mt-12">
              <div className="inline-flex items-center px-6 py-3 bg-white/5 backdrop-blur-lg rounded-full border border-white/20">
                <Clock className="w-5 h-5 text-cyan-400 mr-3" />
                <span className="text-white/80">Cambridge English, PTE Academic, and more English proficiency tests coming soon!</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why Choose <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">SPINTA for IELTS & TOEFL?</span>
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Experience the future of online English test preparation with our cutting-edge AI technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* AI Feedback */}
              <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Real-Time AI Feedback</h3>
                <p className="text-white/70">
                  Get instant, detailed feedback on your IELTS & TOEFL responses just like having a personal examiner available 24/7
                </p>
              </div>
              
              {/* Progress Tracking */}
              <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <BarChart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Smart Analytics & Progress</h3>
                <p className="text-white/70">
                  Track your IELTS/TOEFL band score progress with advanced analytics and personalized improvement insights
                </p>
              </div>
              
              {/* Gamification */}
              <div className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Gamepad className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Interactive Learning Games</h3>
                <p className="text-white/70">
                  Master IELTS & TOEFL vocabulary and grammar through engaging games that make test prep fun
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Games Section */}
        <section id="games" className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center lg:space-x-16">
              <div className="lg:w-1/2 mb-12 lg:mb-0">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Play & Learn</span> Your Way to IELTS/TOEFL Success
                </h2>
                <p className="text-xl text-white/80 mb-8 leading-relaxed">
                  Transform your IELTS and TOEFL preparation into an adventure with our interactive games designed to boost your English vocabulary, grammar, and test confidence.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/90">IELTS/TOEFL vocabulary building through interactive challenges</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/90">Grammar mastery for English proficiency tests</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/90">Real-time score tracking and achievement system</span>
                  </div>
                </div>
                
                <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 font-semibold flex items-center">
                  Explore IELTS/TOEFL Games
                  <Gamepad className="ml-3 w-5 h-5" />
                </button>
              </div>
              
              <div className="lg:w-1/2">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { name: "WordTile", desc: "IELTS/TOEFL sentence building", color: "from-blue-500 to-indigo-500" },
                    { name: "DragZilla", desc: "Grammar for English tests", color: "from-emerald-500 to-teal-500" },
                    { name: "TalkToMe", desc: "Speaking test practice", color: "from-purple-500 to-pink-500" }
                  ].map((game, index) => (
                    <div key={index} className="group bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                      <div className={`w-12 h-12 bg-gradient-to-r ${game.color} rounded-lg mb-4 group-hover:scale-110 transition-transform`}></div>
                      <h3 className="text-lg font-bold mb-2">{game.name}</h3>
                      <p className="text-white/60 text-sm">{game.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Ready to Start Your <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">IELTS/TOEFL Success Journey?</span>
              </h2>
              <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
                Join thousands of students who've achieved their target IELTS and TOEFL scores with SPINTA's AI-powered online test preparation platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button 
                  onClick={handleGetStarted}
                  className="group bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-10 py-4 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 text-lg font-semibold flex items-center shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Get Started with Free Tests
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={handleLogin}
                  className="group bg-white/10 backdrop-blur-lg border border-white/20 text-white px-10 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 text-lg font-semibold"
                >
                  Sign In
                </button>
              </div>
              
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 justify-center max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">Trusted</div>
                  <div className="text-white/60">by IELTS/TOEFL Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">95%</div>
                  <div className="text-white/60">Test Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">4.9★</div>
                  <div className="text-white/60">Student Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 bg-black/20 backdrop-blur-lg py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img src="/logo.ico" alt="SPINTA - IELTS TOEFL Online Practice" className="w-8 h-8 rounded-lg" />
                </div>
                <span className="text-xl font-bold text-white drop-shadow-lg">SPINTA</span>
              </div>
              <p className="text-white/60 mb-4">AI-powered online IELTS and TOEFL test preparation platform with real-time feedback and interactive learning.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">English Tests</h3>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition">IELTS Online Practice</a></li>
                <li><a href="#" className="hover:text-white transition">TOEFL iBT Practice</a></li>
                <li><a href="#" className="hover:text-white transition">Cambridge & PTE (Coming Soon)</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Test Prep Features</h3>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition">AI-Powered Feedback</a></li>
                <li><a href="#" className="hover:text-white transition">Progress Analytics</a></li>
                <li><a href="#" className="hover:text-white transition">Interactive Games</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition">About SPINTA</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-12 pt-8 text-center">
            <p className="text-white/60">© {new Date().getFullYear()} SPINTA - Online IELTS & TOEFL Test Preparation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SpintaLandingPage;