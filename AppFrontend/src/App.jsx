// Import global logger configuration FIRST to override console methods
import './utils/globalLogger.js';
import { logger } from './utils/globalLogger.js';

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Navigate } from 'react-router-dom';

import './App.css';
import LandingPage from './components/LandingPage.jsx';
import LoginPage from './components/Auth/LoginPage.jsx';
import MaintenancePage from './components/Maintenance/MaintenancePage.jsx';
import ListeningMaintenancePage from './components/Maintenance/ListeningMaintenancePage.jsx';
// Import other sections
import WritingHome from './components/IELTS/Writing/WritingHome.jsx';
import ReadingFeedback from './components/IELTS/Reading/ReadingFeedback';

// Import Auth context
import { AuthProvider, useAuth } from './components/Auth/AuthContext.jsx';

// Import Speaking section
import SpeakingHome from './components/IELTS/Speaking/SpeakingHome.jsx';
// Import Reading Section
import ReadingHome from './components/IELTS/Reading/ReadingHome.jsx';
import ReadingExam from './components/IELTS/Reading/ReadingExam.jsx';

// Import Listening Section
import ListeningHome from './components/IELTS/Listening/ListeningHome.jsx';
import ListeningInstructions from './components/IELTS/Listening/ListeningInstructions.jsx';
import ListeningExam from './components/IELTS/Listening/ListeningExam.jsx';
import ListeningFeedback from './components/IELTS/Listening/ListeningFeedback.jsx';

// Import new IELTS components
import IELTSTypeSelection from './components/IELTS/IELTSTypeSelection.jsx';
import IELTSSkillsPage from './components/IELTS/IELTSSkillsPage.jsx';
import QuestionTypesPage from './components/IELTS/Byparts/QuestionTypesPage.jsx';

// Import Form Completion components
import FormCompletionInstructions from './components/IELTS/Byparts/FormCompletion/FormCompletionInstructions.jsx';
import FormCompletionTest from './components/IELTS/Byparts/FormCompletion/FormCompletionTest.jsx';

// Import Short Answer components
import ShortAnswerInstructions from './components/IELTS/Byparts/ShortAnswer/ShortAnswerInstructions.jsx';
import ShortAnswerTest from './components/IELTS/Byparts/ShortAnswer/ShortAnswerTest.jsx';

// Import Matching components
import MatchingInstructions from './components/IELTS/Byparts/Matching/MatchingInstructions.jsx';
import MatchingTest from './components/IELTS/Byparts/Matching/MatchingTest.jsx';

// Import MapLabeling components
import MapLabelingInstructions from './components/IELTS/Byparts/MapLabeling/MapLabelingInstructions.jsx';
import MapLabelingTest from './components/IELTS/Byparts/MapLabeling/MapLabelingTest.jsx';

// Import MultipleChoice components
import MultipleChoiceInstructions from './components/IELTS/Byparts/MultipleChoice/MultipleChoiceInstructions.jsx';
import MultipleChoiceTest from './components/IELTS/Byparts/MultipleChoice/MultipleChoiceTest.jsx';

// Import MultipleChoiceMultiple components
import MultipleChoiceMultipleInstructions from './components/IELTS/Byparts/MultipleChoiceMultiple/MultipleChoiceMultipleInstructions.jsx';
import MultipleChoiceMultipleTest from './components/IELTS/Byparts/MultipleChoiceMultiple/MultipleChoiceMultipleTest.jsx';

// Import SentenceCompletion components
import SentenceCompletionInstructions from './components/IELTS/Byparts/SentenceCompletion/SentenceCompletionInstructions.jsx';
import SentenceCompletionTest from './components/IELTS/Byparts/SentenceCompletion/SentenceCompletionTest.jsx';

// Import TableCompletion components
import TableCompletionInstructions from './components/IELTS/Byparts/TableCompletion/TableCompletionInstructions.jsx';
import TableCompletionTest from './components/IELTS/Byparts/TableCompletion/TableCompletionTest.jsx';

// Import FlowchartCompletion components
import FlowchartCompletionInstructions from './components/IELTS/Byparts/FlowchartCompletion/FlowchartCompletionInstructions.jsx';
import FlowchartCompletionTest from './components/IELTS/Byparts/FlowchartCompletion/FlowchartCompletionTest.jsx';

// Import Toefl UnderConstruction component
import UnderConstructionPage from './components/Toefl/UnderConstructionPage.jsx';
// Import Toefl Writing component
import ToeflWritingHome from './components/Toefl/Writing/WritingHome.jsx';
// Import Toefl Speaking component
import ToeflSpeakingHome from './components/Toefl/Speaking/ToeflSpeakingHome.jsx';
// Import Toefl Reading component
import ToeflReadingHome from './components/Toefl/Reading/ToeflReadingHome.jsx';

// Import Cambridge components
import CambridgeHome from './components/Cambdrige/CambridgeHome.jsx';
import CambridgeWritingHome from './components/Cambdrige/Writing/CambridgeWritingHome.jsx';
import CambridgeWritingExam from './components/Cambdrige/Writing/CambridgeWritingExam.jsx';
import CambridgeWritingFeedback from './components/Cambdrige/Writing/CambridgeWritingFeedback.jsx';
// Import Cambridge Listening components
import CambridgeListeningHome from './components/Cambdrige/Listening/ListeningHome.jsx';
import CambridgeListeningInstructions from './components/Cambdrige/Listening/ListeningInstructions.jsx';
import CambridgeListeningExam from './components/Cambdrige/Listening/ListeningExam.jsx';
import CambridgeListeningFeedback from './components/Cambdrige/Listening/ListeningFeedback.jsx';
// Import Cambridge Reading components
import CambridgeReadingHome from './components/Cambdrige/Reading/ReadingHome.jsx';
import CambridgeReadingInstructions from './components/Cambdrige/Reading/ReadingInstructions.jsx';
import CambridgeReadingTest from './components/Cambdrige/Reading/ReadingTest.jsx';
import CambridgeReadingResults from './components/Cambdrige/Reading/ReadingResults.jsx';

// Import Timer context
import { TimerProvider, useTimer } from './lib/TimerContext.jsx';
import TimerDisplay from './components/ui/TimerDisplay.jsx';

import LearnHome from './components/PlayZone/Learnhome.jsx';
import GamesHome from './components/PlayZone/Gameshome.jsx';
import LearnTopics from './components/PlayZone/learntopics.jsx';
import FlashCards from './components/PlayZone/FlashCards.jsx';

import MaterialIcon from './components/common/MaterialIcon';

// ExamTypePage component for selecting exam type
const ExamTypePage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hoveredExam, setHoveredExam] = useState(null);
  
  const handleExamSelection = (examType) => {
    navigate(`/${examType.toLowerCase()}-skills`);
  };
  
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
      logger.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const examTypes = [
    {
      id: 'ielts',
      name: 'IELTS',
      fullName: 'International English Language Testing System',
      icon: 'school',
      description: 'Globally recognized English proficiency test',
      color: 'from-cyan-500 to-cyan-700',
      iconBg: 'bg-cyan-600',
      delay: '0.1s',
      features: ['Academic & General', '4 Skills Assessment', 'Band Score 0-9']
    },
    {
      id: 'toefl',
      name: 'TOEFL',
      fullName: 'Test of English as a Foreign Language',
      icon: 'language',
      description: 'Premier test for academic English assessment',
      color: 'from-blue-500 to-purple-700',
      iconBg: 'bg-blue-600',
      delay: '0.2s',
      features: ['Academic Focus', 'iBT Format', 'Score 0-120']
    },
    {
      id: 'cambridge',
      name: 'Cambridge',
      fullName: 'Cambridge English Qualifications',
      icon: 'workspace_premium',
      description: 'Internationally recognized English qualifications',
      color: 'from-red-500 to-orange-700',
      iconBg: 'bg-red-600',
      delay: '0.3s',
      features: ['5 Levels Available', 'A2 Key to C2 Proficiency', 'Real-world Tasks']
    }
  ];

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
        <div className="container mx-auto px-4">
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
              <span className="text-white/80 font-medium">Choose Your Test</span>
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
                    <MaterialIcon name="logout" className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
                    <span className="text-sm font-medium">Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl mb-8 shadow-2xl">
              <MaterialIcon name="school" className="text-white text-4xl" />
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                English
              </span>
              <br />
              <span className="text-white/90">Proficiency Hub</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Choose your path to English proficiency success. Master the world's most trusted 
              English language assessments with our AI-powered practice platform.
            </p>
            
            {/* Key Features */}
            <div className="flex justify-center mb-12 space-x-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">3</div>
                <div className="text-sm text-white/60">Tests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">AI</div>
                <div className="text-sm text-white/60">Powered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">∞</div>
                <div className="text-sm text-white/60">Practice</div>
              </div>
            </div>
          </div>

          {/* Play Zone Button */}
          <div className="text-center mb-16">
            <button 
              onClick={() => navigate('/play-zone')}
              className="group inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <MaterialIcon name="sports_esports" className="text-2xl group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-lg font-semibold">Play Zone</span>
              <MaterialIcon name="arrow_forward" className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Exam Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {examTypes.map((exam) => (
              <div
                key={exam.id}
                className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
                onClick={() => handleExamSelection(exam.id)}
                onMouseEnter={() => setHoveredExam(exam.id)}
                onMouseLeave={() => setHoveredExam(null)}
                style={{animationDelay: exam.delay}}
              >
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 transition-all duration-500 group-hover:shadow-2xl group-hover:bg-white/20 h-full">
                  {/* Floating icon */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 ${exam.iconBg} rounded-2xl mb-6 shadow-lg transform transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-xl`}>
                    <MaterialIcon name={exam.icon} className="text-white text-3xl" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-white">
                    {exam.name}
                  </h3>
                  <h4 className="text-lg font-medium text-white/70 mb-4 group-hover:text-white/80">
                    {exam.fullName}
                  </h4>
                  <p className="text-white/70 mb-6 leading-relaxed group-hover:text-white/80">
                    {exam.description}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {exam.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-white/70">
                        <MaterialIcon name="check_circle" className="text-green-400 text-lg mr-3" />
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action indicator */}
                  <div className="flex items-center justify-between text-sm text-white/60 pt-4 border-t border-white/20">
                    <span className="font-medium">Choose {exam.name}</span>
                    <MaterialIcon name="arrow_forward" className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  
                  {/* Progress bar simulation */}
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mt-4">
                    <div 
                      className={`h-full bg-gradient-to-r ${exam.color} rounded-full transition-all duration-1000 ${hoveredExam === exam.id ? 'w-full' : 'w-0'}`}
                    ></div>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Call to action */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-lg text-white/70 px-8 py-4 rounded-full border border-white/20">
              <MaterialIcon name="bolt" className="text-blue-400" />
              <span className="font-medium">Ready to start your English proficiency journey?</span>
              <MaterialIcon name="star" className="text-green-400 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// HomePage component for the skills selection page (now specific to exam type)
const SkillsPage = ({ examType }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { resetTimer } = useTimer();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  
  const handleSkillSelection = (skill) => {
    resetTimer();
    navigate(`/${examType}/${skill.toLowerCase()}`);
  };
  
  const handleBack = () => {
    navigate('/skills');
  };
  
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
      logger.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };
  
  const examName = examType === 'ielts' ? 'IELTS' : 'TOEFL';
  
  const skills = [
    {
      id: 'reading',
      name: 'Reading',
      icon: 'menu_book',
      description: 'Master reading comprehension skills',
      color: 'from-cyan-500 to-cyan-700',
      bgColor: 'bg-cyan-50',
      hoverColor: 'group-hover:bg-cyan-100',
      iconBg: 'bg-cyan-600',
      delay: '0.1s',
      stats: examType === 'toefl' ? '2-3 passages • 35 minutes' : '3 passages • 60 minutes'
    },
    {
      id: 'writing',
      name: 'Writing',
      icon: 'edit_note',
      description: 'Craft compelling essays and responses',
      color: 'from-emerald-500 to-emerald-700',
      bgColor: 'bg-emerald-50',
      hoverColor: 'group-hover:bg-emerald-100',
      iconBg: 'bg-emerald-600',
      delay: '0.2s',
      stats: examType === 'toefl' ? '2 tasks • 50 minutes' : '2 tasks • 60 minutes'
    },
    {
      id: 'listening',
      name: 'Listening',
      icon: 'headphones',
      description: 'Enhance your listening comprehension',
      color: 'from-blue-500 to-blue-700',
      bgColor: 'bg-blue-50',
      hoverColor: 'group-hover:bg-blue-100',
      iconBg: 'bg-blue-600',
      delay: '0.3s',
      stats: examType === 'toefl' ? '3-4 lectures • 41-57 minutes' : '4 sections • 30 minutes'
    },
    {
      id: 'speaking',
      name: 'Speaking',
      icon: 'record_voice_over',
      description: 'Build confidence through practice',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      hoverColor: 'group-hover:bg-purple-100',
      iconBg: 'bg-purple-600',
      delay: '0.4s',
      stats: examType === 'toefl' ? '4 tasks • 17 minutes' : '3 parts • 11-14 minutes'
    }
  ];
  
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
                onClick={handleBack}
                className="text-white/80 hover:text-white transition duration-200 flex items-center space-x-1"
              >
                <MaterialIcon name="arrow_back" className="text-sm" />
                <span>Home</span>
              </button>
              <div className="text-white/60">|</div>
              <span className="text-white/80 font-medium">{examName} Practice</span>
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
                    <MaterialIcon name="logout" className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
                    <span className="text-sm font-medium">Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mb-6 shadow-xl">
              <MaterialIcon name="school" className="text-white text-3xl" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {examName}
              </span>
              <br />
              <span className="text-white/90">Practice Hub</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Master all four essential skills with our AI-powered practice platform. 
              Choose your skill below and start your journey to exam success.
            </p>
            
            {/* Progress indicators */}
            <div className="flex justify-center mt-8 space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">4</div>
                <div className="text-sm text-white/60">Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">AI</div>
                <div className="text-sm text-white/60">Powered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">∞</div>
                <div className="text-sm text-white/60">Practice</div>
              </div>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
                onClick={() => handleSkillSelection(skill.id)}
                onMouseEnter={() => setHoveredSkill(skill.id)}
                onMouseLeave={() => setHoveredSkill(null)}
                style={{animationDelay: skill.delay}}
              >
                <div className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 transition-all duration-500 group-hover:bg-white/20 group-hover:shadow-2xl min-h-[280px] flex flex-col`}>
                  {/* Floating icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${skill.iconBg} rounded-2xl mb-6 shadow-lg transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl`}>
                    <MaterialIcon name={skill.icon} className="text-white text-2xl" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow flex flex-col">
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white">
                      {skill.name}
                    </h3>
                    <p className="text-white/70 mb-4 leading-relaxed group-hover:text-white/80 flex-grow">
                      {skill.description}
                    </p>
                    <div className="text-sm text-white/50 group-hover:text-white/60 mt-auto">
                      {skill.stats}
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

// IELTS Skills Page
const IELTSMainPage = () => <IELTSTypeSelection />;

// TOEFL Skills Page
const TOEFLSkillsPage = () => <SkillsPage examType="toefl" />;

const CambridgeSkillsPage = () => <CambridgeHome />;

// Placeholder for Listening section
const ListeningPlaceholder = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Listening Section</h1>
      <p className="text-xl text-gray-600 mb-8">
        The Listening section is currently under maintenance.
      </p>
      <button onClick={() => navigate(-1)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        Go Back
      </button>
    </div>
  );
};

// Placeholder for Play Zone section
const PlayZonePlaceholder = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
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
      logger.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const playZoneOptions = [
    {
      id: 'learn',
      name: 'Learn',
      icon: 'school',
      description: 'Master grammar and vocabulary with interactive lessons',
      color: 'from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-600',
      delay: '0.1s',
      path: '/play-zone/learn'
    },
    {
      id: 'games',
      name: 'Play Games',
      icon: 'videogame_asset',
      description: 'Fun and engaging games to boost your English skills',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-600',
      delay: '0.2s',
      path: '/play-zone/games'
    },
    {
      id: 'flashcards',
      name: 'Flash Cards',
      icon: 'style',
      description: 'Quick vocabulary and grammar review sessions',
      color: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-600',
      delay: '0.3s',
      path: '/play-zone/flashcards'
    }
  ];
  
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
                onClick={() => navigate('/skills')}
                className="text-white/80 hover:text-white transition duration-200 flex items-center space-x-1"
              >
                <MaterialIcon name="arrow_back" className="text-sm" />
                <span>Home</span>
              </button>
              <div className="text-white/60">|</div>
              <span className="text-white/80 font-medium">Play Zone</span>
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
                    <MaterialIcon name="logout" className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
                    <span className="text-sm font-medium">Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl mb-8 shadow-2xl">
              <MaterialIcon name="school" className="text-white text-4xl" />
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Play Zone
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed mb-8">
              Make learning fun with interactive games, flashcards, and engaging activities. 
              Enhance your English skills through play-based learning experiences.
            </p>
            
            {/* Key Features */}
            <div className="flex justify-center mb-12 space-x-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">Fun</div>
                <div className="text-sm text-white/60">Learning</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">Interactive</div>
                <div className="text-sm text-white/60">Games</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">Progress</div>
                <div className="text-sm text-white/60">Tracking</div>
              </div>
            </div>
          </div>

          {/* Play Zone Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playZoneOptions.map((option) => (
              <div
                key={option.id}
                className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
                onClick={() => navigate(option.path)}
                style={{animationDelay: option.delay}}
              >
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 transition-all duration-500 group-hover:shadow-2xl group-hover:bg-white/20 h-full">
                  {/* Floating icon */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 ${option.iconBg} rounded-2xl mb-6 shadow-lg transform transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-xl`}>
                    <MaterialIcon name={option.icon} className="text-white text-3xl" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-white">
                    {option.name}
                  </h3>
                  <p className="text-white/70 mb-6 leading-relaxed group-hover:text-white/80">
                    {option.description}
                  </p>
                  
                  {/* Action indicator */}
                  <div className="flex items-center justify-between text-sm text-white/60 pt-4 border-t border-white/20">
                    <span className="font-medium">Explore {option.name}</span>
                    <MaterialIcon name="arrow_forward" className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  
                  {/* Progress bar simulation */}
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mt-4">
                    <div className={`h-full bg-gradient-to-r ${option.color} rounded-full transition-all duration-1000 group-hover:w-full w-0`}></div>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Call to action */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-lg text-white/70 px-8 py-4 rounded-full border border-white/20">
              <MaterialIcon name="star" className="text-emerald-400" />
              <span className="font-medium">Ready to make learning fun and interactive?</span>
              <MaterialIcon name="gamepad" className="text-cyan-400 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  // Check if the site is enabled via environment variable
  const siteEnabled = import.meta.env.VITE_SITE_ENABLED;
  
  // If site is disabled, show maintenance page
  if (siteEnabled === 'false') {
    return <MaintenancePage />;
  }
  
  return (
    <AuthProvider>
      <TimerProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/skills" element={<ExamTypePage />} />
            <Route path="/ielts-skills" element={<IELTSMainPage />} />
            <Route path="/toefl-skills" element={<TOEFLSkillsPage />} />
            <Route path="/cambridge-skills" element={<CambridgeSkillsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/listening-maintenance" element={<ListeningMaintenancePage />} />
            
            {/* IELTS Routes */}
            {/* New IELTS type-specific routes */}
            <Route path="/ielts/:type/skills" element={<IELTSSkillsPage />} />
            <Route path="/ielts/practice-by-types" element={<QuestionTypesPage />} />
            
            {/* Form Completion Routes */}
            <Route path="/ielts/form-completion/instructions" element={<FormCompletionInstructions />} />
            <Route path="/ielts/form-completion/test" element={<FormCompletionTest />} />
            
            {/* Short Answer Routes */}
            <Route path="/ielts/short-answer/instructions" element={<ShortAnswerInstructions />} />
            <Route path="/ielts/short-answer/test" element={<ShortAnswerTest />} />
            
            {/* Matching Routes */}
            <Route path="/ielts/matching/instructions" element={<MatchingInstructions />} />
            <Route path="/ielts/matching/test" element={<MatchingTest />} />
            
            {/* Map Labeling Routes */}
            <Route path="/ielts/map-labeling/instructions" element={<MapLabelingInstructions />} />
            <Route path="/ielts/map-labeling/test" element={<MapLabelingTest />} />
            
            {/* Multiple Choice Routes */}
            <Route path="/ielts/multiple-choice/instructions" element={<MultipleChoiceInstructions />} />
            <Route path="/ielts/multiple-choice/test" element={<MultipleChoiceTest />} />
            
            {/* Multiple Choice Multiple Routes */}
            <Route path="/ielts/multiple-choice-multiple/instructions" element={<MultipleChoiceMultipleInstructions />} />
            <Route path="/ielts/multiple-choice-multiple/test" element={<MultipleChoiceMultipleTest />} />
            
            {/* Sentence Completion Routes */}
            <Route path="/ielts/sentence-completion/instructions" element={<SentenceCompletionInstructions />} />
            <Route path="/ielts/sentence-completion/test" element={<SentenceCompletionTest />} />
            
            {/* Table Completion Routes */}
            <Route path="/ielts/table-completion/instructions" element={<TableCompletionInstructions />} />
            <Route path="/ielts/table-completion/test" element={<TableCompletionTest />} />
            
            {/* Flowchart Completion Routes */}
            <Route path="/ielts/flowchart-completion/instructions" element={<FlowchartCompletionInstructions />} />
            <Route path="/ielts/flowchart-completion/test" element={<FlowchartCompletionTest />} />

            <Route path="/ielts/:type/writing" element={<WritingHome />} />
            <Route path="/ielts/:type/speaking" element={<SpeakingHome />} />
            <Route path="/ielts/:type/listening" element={<ListeningInstructions />} />
            <Route path="/ielts/:type/listening/exam" element={<ListeningExam />} />
            <Route path="/ielts/:type/listening/feedback" element={<ListeningFeedback />} />
            <Route path="/ielts/:type/reading" element={<ReadingHome />} />
            <Route path="/ielts/:type/reading/exam" element={<ReadingExam />} />
            <Route path="/ielts/:type/reading/feedback" element={<ReadingFeedback />} />
            
            {/* Legacy IELTS Routes (for backward compatibility) */}
            <Route path="/ielts/writing" element={<WritingHome />} />
            <Route path="/ielts/speaking" element={<SpeakingHome />} />
            <Route path="/ielts/listening" element={<ListeningInstructions />} />
            <Route path="/ielts/listening/exam" element={<ListeningExam />} />
            <Route path="/ielts/listening/feedback" element={<ListeningFeedback />} />
            <Route path="/ielts/reading" element={<ReadingHome />} />
            <Route path="/ielts/reading/exam" element={<ReadingExam />} />
            <Route path="/ielts/reading/feedback" element={<ReadingFeedback />} />
            
            {/* TOEFL Routes */}
            <Route path="/toefl/writing" element={<ToeflWritingHome />} />
            <Route path="/toefl/speaking" element={<ToeflSpeakingHome />} />
            <Route path="/toefl/reading" element={<ToeflReadingHome />} />
            <Route path="/toefl/listening" element={<UnderConstructionPage examType="Listening" />} />
            <Route path="/toefl/reading/exam" element={<ToeflReadingHome />} />
            
            {/* Cambridge Routes */}
            <Route path="/cambridge/writing" element={<CambridgeWritingHome />} />
            <Route path="/cambridge/writing/exam" element={<CambridgeWritingExam />} />
            <Route path="/cambridge/writing/feedback" element={<CambridgeWritingFeedback />} />
            
            {/* Cambridge Listening Routes */}
            <Route path="/cambridge/listening" element={<CambridgeListeningHome />} />
            <Route path="/cambridge/listening/instructions" element={<CambridgeListeningInstructions />} />
            <Route path="/cambridge/listening/exam" element={<CambridgeListeningExam />} />
            <Route path="/cambridge/listening/feedback" element={<CambridgeListeningFeedback />} />
            
            {/* Cambridge Reading Routes */}
            <Route path="/cambridge/reading" element={<CambridgeReadingHome />} />
            <Route path="/cambridge/reading/instructions" element={<CambridgeReadingInstructions />} />
            <Route path="/cambridge/reading/test" element={<CambridgeReadingTest />} />
            <Route path="/cambridge/reading/results" element={<CambridgeReadingResults />} />
            
            {/* Play Zone Routes (common for both exam types) */}
            <Route path="/play-zone" element={<PlayZonePlaceholder />} />
            <Route path="/play-zone/learn" element={<LearnHome />} />
            <Route path="/play-zone/learn/:topicId" element={<LearnTopics />} />
            <Route path="/play-zone/games" element={<GamesHome />} />
            <Route path="/play-zone/flashcards" element={<FlashCards />} />
          </Routes>
        </div>
      </TimerProvider>
    </AuthProvider>
  );
}

export default App;
