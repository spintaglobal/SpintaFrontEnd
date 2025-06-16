import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Headphones, 
  Clock, 
  ArrowLeft,
  RefreshCw,
  Wrench,
  Mail
} from 'lucide-react';

const ListeningMaintenancePage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header with back button */}
      <header className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={handleBack}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Skills</span>
            </button>
            
            <div className="flex items-center space-x-2">
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          {/* Listening Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Headphones className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Listening Section <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Coming Soon</span>
          </h1>

          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            We're working hard to bring you an amazing listening practice experience. The listening section will be available soon with interactive audio exercises and AI-powered feedback.
          </p>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Wrench className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">In Development</h3>
              <p className="text-white/70 text-sm">Our team is actively working on this feature</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-white/70 text-sm">We'll notify you when it's ready</p>
            </div>
          </div>

          {/* What's Coming */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-12">
            <h3 className="text-2xl font-bold mb-6 text-white">What's Coming</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Headphones className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Audio Practice</h4>
                  <p className="text-white/70 text-sm">Authentic listening passages and exercises</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <RefreshCw className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">AI Feedback</h4>
                  <p className="text-white/70 text-sm">Intelligent analysis of your responses</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-icons text-white text-sm">quiz</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Practice Tests</h4>
                  <p className="text-white/70 text-sm">Full-length listening test simulations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={handleBack}
              className="group bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 text-lg font-semibold flex items-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back to Skills
            </button>
            
            <button 
              onClick={handleRefresh}
              className="group bg-white/10 backdrop-blur-lg border border-white/20 text-white px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 text-lg font-semibold flex items-center"
            >
              <RefreshCw className="mr-2 w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Check Again
            </button>
          </div>

          {/* Contact Info */}
          <div className="text-center">
            <p className="text-white/60 text-sm mb-4">
              Have questions? We'd love to hear from you!
            </p>
            <a 
              href="mailto:support@spinta.com" 
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Loading Animation */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
          </div>
          <span className="text-white/70 text-sm ml-3">Working on listening features...</span>
        </div>
      </div>
    </div>
  );
};

export default ListeningMaintenancePage; 