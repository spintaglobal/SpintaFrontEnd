import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Eye, EyeOff, User, Mail, Lock, AlertTriangle, CheckCircle, ArrowRight, GraduationCap } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam === 'signin' ? 'signin' : 'signup');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    code: ''
  });
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [displayError, setDisplayError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Use the auth context
  const { user, loading, error, signIn, signUp, confirmSignUp, resendConfirmationCode, resetPassword, signInWithGoogle } = useAuth();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/skills');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setDisplayError(null);
    
    try {
      await signIn(formData.email, formData.password);
      // Navigation will happen automatically in the useEffect when user state changes
    } catch (error) {
      console.error('Error signing in:', error);
      setDisplayError(error.message);
      if (error.code === 'UserNotConfirmedException') {
        setShowConfirmation(true);
      }
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setDisplayError(null);
    
    if (formData.password !== formData.confirmPassword) {
      setDisplayError('Passwords do not match');
      return;
    }

    try {
      const result = await signUp(formData.email, formData.password, formData.name);
      
      // If sign up requires confirmation, show confirmation form
      if (result && result.nextStep && result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setSuccessMessage('Account created successfully! Please check your email for verification link.');
        setTimeout(() => {
          setShowConfirmation(true);
          setSuccessMessage(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setDisplayError(error.message);
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    setDisplayError(null);
    
    try {
      // For Firebase, we'll just try to sign in to check if email is verified
      await signIn(formData.email, formData.password);
      // Navigation will happen automatically in the useEffect when user state changes
    } catch (error) {
      console.error('Error confirming sign up:', error);
      if (error.code === 'UserNotConfirmedException') {
        setDisplayError('Please check your email and click the verification link, then try signing in again.');
      } else {
        setDisplayError(error.message);
      }
    }
  };

  const handleResendCode = async () => {
    try {
      await resendConfirmationCode(formData.email);
      setSuccessMessage('Verification email resent successfully');
    } catch (error) {
      console.error('Error resending verification email:', error);
      setDisplayError(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setDisplayError('Please enter your email address first');
      return;
    }
    
    try {
      await resetPassword(formData.email);
      setSuccessMessage('Password reset email sent successfully! Check your inbox.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setDisplayError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setDisplayError(null);
    
    try {
      await signInWithGoogle();
      // Navigation will happen automatically in the useEffect when user state changes
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setDisplayError(error.message);
    }
  };

  // Render confirmation form
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/20">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img 
                  src="/logo.ico" 
                  alt="SPINTA Logo" 
                  className="w-10 h-10 rounded-lg object-contain" 
                  style={{
                    imageRendering: 'crisp-edges',
                    filter: 'contrast(1.1) brightness(1.05)',
                    WebkitFilter: 'contrast(1.1) brightness(1.05)'
                  }} 
                />
              </div>
              <span className="text-2xl font-bold text-white drop-shadow-lg">SPINTA</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Verify Your Account
            </h2>
            <p className="mt-3 text-base text-white/70">
              We've sent a verification link to your email. Please click it, then try signing in.
            </p>
          </div>
          
          {successMessage && (
            <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-xl flex items-center shadow-sm animate-fadeIn backdrop-blur-sm" role="alert">
              <CheckCircle size={20} className="text-green-400 mr-3 flex-shrink-0" />
              <span className="text-green-200">{successMessage}</span>
            </div>
          )}
          
          {displayError && (
            <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl flex items-center shadow-sm animate-fadeIn backdrop-blur-sm" role="alert">
              <AlertTriangle size={20} className="text-red-400 mr-3 flex-shrink-0" />
              <span className="text-red-200">{displayError}</span>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleConfirmSignUp}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/50" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 backdrop-blur-sm"
                    placeholder="Your email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/50" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 backdrop-blur-sm"
                    placeholder="Your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleResendCode}
                className="text-blue-300 hover:text-blue-200 inline-flex items-center font-medium text-sm transition duration-150"
              >
                <Mail size={16} className="mr-2" />
                Resend verification email
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-xl transform transition-all duration-150 hover:shadow-2xl hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center">
                  Try Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-purple-900/40"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/20">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img 
                src="/logo.ico" 
                alt="SPINTA Logo" 
                className="w-10 h-10 rounded-lg object-contain" 
                style={{
                  imageRendering: 'crisp-edges',
                  filter: 'contrast(1.1) brightness(1.05)',
                  WebkitFilter: 'contrast(1.1) brightness(1.05)'
                }} 
              />
            </div>
            <span className="text-2xl font-bold text-white drop-shadow-lg">SPINTA</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-3 text-base text-white/70">
            {activeTab === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex rounded-xl border border-white/20 p-1 bg-white/5 backdrop-blur-sm">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium text-sm rounded-lg transition-all duration-200 ${
              activeTab === 'signin'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
            onClick={() => setActiveTab('signin')}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium text-sm rounded-lg transition-all duration-200 ${
              activeTab === 'signup'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
            onClick={() => setActiveTab('signup')}
          >
            Register
          </button>
        </div>

        {successMessage && (
          <div className="mt-6 bg-green-500/20 border border-green-500/30 p-4 rounded-xl flex items-center shadow-sm animate-fadeIn backdrop-blur-sm" role="alert">
            <CheckCircle size={20} className="text-green-400 mr-3 flex-shrink-0" />
            <span className="text-green-200">{successMessage}</span>
          </div>
        )}
        
        {displayError && (
          <div className="mt-6 bg-red-500/20 border border-red-500/30 p-4 rounded-xl flex items-center shadow-sm animate-fadeIn backdrop-blur-sm" role="alert">
            <AlertTriangle size={20} className="text-red-400 mr-3 flex-shrink-0" />
            <span className="text-red-200">{displayError}</span>
          </div>
        )}

        {activeTab === 'signin' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
            <div className="space-y-5">
              <div>
                <label htmlFor="signinEmail" className="block text-sm font-medium text-white/80 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/50" aria-hidden="true" />
                  </div>
                  <input
                    id="signinEmail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 backdrop-blur-sm"
                    placeholder="Your email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="signinPassword" className="block text-sm font-medium text-white/80 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/50" aria-hidden="true" />
                  </div>
                  <input
                    id="signinPassword"
                    name="password"
                    type={showSignInPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full pl-10 pr-10 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 backdrop-blur-sm"
                    placeholder="Your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="text-white/50 hover:text-white/70 focus:outline-none"
                    >
                      {showSignInPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-300 hover:text-blue-200 inline-flex items-center font-medium text-sm transition duration-150"
              >
                Forgot your password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-xl transform transition-all duration-150 hover:shadow-2xl hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </button>

            {/* OR divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/10 text-white/60 rounded-lg backdrop-blur-sm">OR</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-white/20 text-sm font-medium rounded-xl text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 shadow-xl transform transition-all duration-150 hover:shadow-2xl hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </span>
              )}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
            <div className="space-y-5">
              <div>
                <label htmlFor="signupName" className="block text-sm font-medium text-white/80 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-white/50" aria-hidden="true" />
                  </div>
                  <input
                    id="signupName"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 backdrop-blur-sm"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="signupEmail" className="block text-sm font-medium text-white/80 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/50" aria-hidden="true" />
                  </div>
                  <input
                    id="signupEmail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 backdrop-blur-sm"
                    placeholder="Your email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="signupPassword" className="block text-sm font-medium text-white/80 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/50" aria-hidden="true" />
                  </div>
                  <input
                    id="signupPassword"
                    name="password"
                    type={showSignUpPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full pl-10 pr-10 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 backdrop-blur-sm"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="text-white/50 hover:text-white/70 focus:outline-none"
                    >
                      {showSignUpPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-white/50">
                  Password must be at least 8 characters and include lowercase, uppercase, numbers and symbols
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/50" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showSignUpPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 backdrop-blur-sm"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-xl transform transition-all duration-150 hover:shadow-2xl hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center">
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </button>

            {/* OR divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/10 text-white/60 rounded-lg backdrop-blur-sm">OR</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-white/20 text-sm font-medium rounded-xl text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 shadow-xl transform transition-all duration-150 hover:shadow-2xl hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;