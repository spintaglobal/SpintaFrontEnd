import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  GraduationCap,
  Mail,
  Twitter,
  Globe
} from 'lucide-react';

const MaintenancePage = () => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        {/* Logo */}
        <button 
          onClick={() => navigate('/skills')}
          className="flex items-center justify-center space-x-3 mb-12 hover:scale-105 transition-transform duration-300"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center">
            <img 
              src="/logo.ico" 
              alt="SPINTA Logo" 
              className="w-16 h-16 rounded-2xl object-contain" 
              style={{
                imageRendering: 'crisp-edges',
                filter: 'contrast(1.1) brightness(1.05)',
                WebkitFilter: 'contrast(1.1) brightness(1.05)'
              }} 
            />
          </div>
          <span className="text-4xl font-bold text-white drop-shadow-lg">SPINTA</span>
        </button>

        {/* Maintenance Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Wrench className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          We're Under <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Maintenance</span>
        </h1>

        <p className="text-xl text-white/80 mb-8 leading-relaxed">
          We're working hard to improve your experience. Our AI-powered IELTS and TOEFL preparation platform will be back online shortly.
        </p>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Expected Duration</h3>
            <p className="text-white/70 text-sm">We'll be back online soon</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <AlertCircle className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your Data is Safe</h3>
            <p className="text-white/70 text-sm">All your progress is secure</p>
          </div>
        </div>

        {/* What We're Improving */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-12">
          <h3 className="text-2xl font-bold mb-6 text-white">What We're Improving</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Performance</h4>
                <p className="text-white/70 text-sm">Faster loading times and smoother experience</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">AI Features</h4>
                <p className="text-white/70 text-sm">Enhanced AI feedback and analysis</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">New Content</h4>
                <p className="text-white/70 text-sm">Fresh practice tests and exercises</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button 
            onClick={handleRefresh}
            className="group bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 text-lg font-semibold flex items-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            <RefreshCw className="mr-2 w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Check Again
          </button>
          
          <a 
            href="mailto:support@spinta.com" 
            className="group bg-white/10 backdrop-blur-lg border border-white/20 text-white px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 text-lg font-semibold flex items-center"
          >
            <Mail className="mr-2 w-5 h-5" />
            Contact Support
          </a>
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-white/60 text-sm mb-4">
            Stay updated on our progress
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-white/60 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/60 hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
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
          <span className="text-white/70 text-sm ml-3">Working on improvements...</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage; 