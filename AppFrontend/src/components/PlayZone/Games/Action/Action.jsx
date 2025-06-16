import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

// Audio feedback utility
const playAudio = (type) => {
  try {
    const audio = new Audio();
    if (type === 'correct') {
      // Generate a pleasant success sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else if (type === 'incorrect') {
      // Generate a gentle error sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime); // F4
      oscillator.frequency.setValueAtTime(293.66, audioContext.currentTime + 0.15); // D4
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    }
  } catch (error) {
    console.warn('Audio feedback not supported:', error);
  }
};

// Custom hook for Intersection Observer (lazy loading)
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [ref, isIntersecting];
};

// Image optimization utility
const optimizeImageUrl = (originalUrl, width = 400, height = 400, quality = 80) => {
  if (!originalUrl) return originalUrl;
  
  // If it's an S3 URL, we can add query parameters for optimization
  if (originalUrl.includes('amazonaws.com')) {
    // For AWS S3, we can use CloudFront or add resize parameters if available
    // For now, we'll use a simple approach with query parameters
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}w=${width}&h=${height}&q=${quality}&f=webp`;
  }
  
  return originalUrl;
};

// Image preloader utility
const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Bulk image preloader with compression
const preloadImages = async (imageUrls, onProgress) => {
  const optimizedUrls = imageUrls.map(url => optimizeImageUrl(url, 400, 400, 75)); // Lower quality for faster loading
  const totalImages = optimizedUrls.length;
  let loadedCount = 0;
  
  // Process images in batches of 3 for better performance
  const batchSize = 3;
  const batches = [];
  
  for (let i = 0; i < optimizedUrls.length; i += batchSize) {
    batches.push(optimizedUrls.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    const batchPromises = batch.map(async (url) => {
      try {
        await preloadImage(url);
        loadedCount++;
        if (onProgress) onProgress(loadedCount, totalImages);
        return { url, success: true };
      } catch (error) {
        loadedCount++;
        if (onProgress) onProgress(loadedCount, totalImages);
        console.warn(`Failed to preload image: ${url}`, error);
        return { url, success: false };
      }
    });
    
    await Promise.allSettled(batchPromises);
  }
  
  return { loadedCount, totalImages };
};

// Available topics for the Action game
const availableTopics = [
  {
    id: 'at_home_activities',
    title: 'At Home Activities',
    description: 'Learn verbs related to daily activities around the house',
    icon: 'home',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'classroom_actions',
    title: 'Classroom Actions',
    description: 'Practice verbs commonly used in educational settings',
    icon: 'school',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'communication',
    title: 'Communication',
    description: 'Master verbs related to speaking and communication',
    icon: 'chat',
    color: 'from-purple-500 to-violet-500'
  },
  {
    id: 'daily_morning_routine',
    title: 'Daily Morning Routine',
    description: 'Learn action words for morning activities',
    icon: 'wb_sunny',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'evening_activities',
    title: 'Evening Activities',
    description: 'Practice verbs for evening and night routines',
    icon: 'nights_stay',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'health_and_body_care',
    title: 'Health and Body Care',
    description: 'Understand verbs related to health and personal care',
    icon: 'health_and_safety',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'hobbies_and_free_time',
    title: 'Hobbies and Free Time',
    description: 'Explore action words for leisure activities',
    icon: 'sports_tennis',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'in_the_kitchen',
    title: 'In the Kitchen',
    description: 'Learn cooking and kitchen-related action verbs',
    icon: 'kitchen',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'playing_and_sports',
    title: 'Playing and Sports',
    description: 'Master sports and recreational activity verbs',
    icon: 'sports_soccer',
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 'shopping_and_errands',
    title: 'Shopping and Errands',
    description: 'Practice verbs for shopping and daily errands',
    icon: 'shopping_cart',
    color: 'from-amber-500 to-yellow-500'
  },
  {
    id: 'travel_and_transport',
    title: 'Travel and Transport',
    description: 'Learn action words related to travel and transportation',
    icon: 'airplanemode_active',
    color: 'from-sky-500 to-blue-500'
  },
  {
    id: 'using_technology',
    title: 'Using Technology',
    description: 'Understand verbs for technology and digital activities',
    icon: 'computer',
    color: 'from-slate-500 to-gray-600'
  },
  {
    id: 'weather_and_seasons_actions',
    title: 'Weather and Seasons Actions',
    description: 'Explore verbs related to weather and seasonal activities',
    icon: 'wb_cloudy',
    color: 'from-blue-400 to-sky-500'
  },
  {
    id: 'weekend_activities',
    title: 'Weekend Activities',
    description: 'Practice action words for weekend fun and relaxation',
    icon: 'weekend',
    color: 'from-violet-500 to-purple-500'
  }
];

// API Service
const fetchTopicQuestions = async (topicName) => {
  try {
    const response = await fetch(`https://llf5fa83b8.execute-api.us-east-1.amazonaws.com/prod/lesson/${topicName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${topicName} questions`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// Topic Selection Screen Component
const TopicSelectionScreen = ({ onTopicSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center"
  >
    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full mb-8 shadow-xl">
      <span className="material-icons text-white text-4xl">category</span>
    </div>
    
    <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-6">
      Action Game
    </h1>
    
    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
      Choose a topic to practice action verbs. Type the correct verb to complete sentences!
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {availableTopics.map((topic, index) => (
        <motion.div
          key={topic.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTopicSelect(topic)}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
        >
          <div className={`h-3 bg-gradient-to-r ${topic.color}`}></div>
          <div className="p-6">
            <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${topic.color} rounded-xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <span className="material-icons text-white text-xl">{topic.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{topic.title}</h3>
            <p className="text-gray-600 text-sm">{topic.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Instructions Screen Component
const InstructionsScreen = ({ selectedTopic, onStartGame, isDataReady, onBackToTopics }) => {
  const [exampleAnswer, setExampleAnswer] = useState('');
  const [exampleState, setExampleState] = useState('typing'); // 'typing', 'correct', 'incorrect'
  
  // Animated example effect
  useEffect(() => {
    const sequence = async () => {
      // Reset
      setExampleAnswer('');
      setExampleState('typing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Type "washing" (correct)
      const correctAnswer = 'washing';
      for (let i = 0; i <= correctAnswer.length; i++) {
        setExampleAnswer(correctAnswer.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      setExampleState('correct');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear and type "wash" (incorrect)
      setExampleAnswer('');
      setExampleState('typing');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const incorrectAnswer = 'wash';
      for (let i = 0; i <= incorrectAnswer.length; i++) {
        setExampleAnswer(incorrectAnswer.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      setExampleState('incorrect');
      await new Promise(resolve => setTimeout(resolve, 2000));
    };
    
    const interval = setInterval(sequence, 8000);
    sequence(); // Start immediately
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-6xl mx-auto"
    >
      {/* Compact Hero Section */}
      <div className="relative mb-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${selectedTopic.color} rounded-full mb-4 shadow-xl relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
          <span className="material-icons text-white text-3xl relative z-10">{selectedTopic.icon}</span>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
          {selectedTopic.title}
        </h1>
        
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          {selectedTopic.description}
        </p>
      </div>

      {/* Compact Instructions and Example in Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Instructions */}
        <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-xl p-6 border border-blue-100">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 text-center">
            🎮 How to Play
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border-l-4 border-emerald-400">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <h3 className="font-bold text-emerald-800">👀 Study the Image</h3>
                <p className="text-sm text-emerald-700">Look at the picture carefully</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-l-4 border-cyan-400">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <h3 className="font-bold text-cyan-800">📝 Complete Sentence</h3>
                <p className="text-sm text-cyan-700">Type the action verb in the box</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-400">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <h3 className="font-bold text-purple-800">⌨️ Type or Click</h3>
                <p className="text-sm text-purple-700">Use options or type your own</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border-l-4 border-rose-400">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">4</span>
              </div>
              <div>
                <h3 className="font-bold text-rose-800">🎵 Get Feedback</h3>
                <p className="text-sm text-rose-700">Hear sounds and see results</p>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Example */}
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-2xl border-2 border-orange-200 shadow-xl p-6">
          <h3 className="text-2xl font-bold text-orange-800 mb-4 text-center flex items-center justify-center gap-2">
            <span className="text-2xl">📝</span>
            Example Question
            <span className="text-2xl">✨</span>
          </h3>
          
          <div className="text-center space-y-4">
            <div className="text-xl text-gray-800 font-medium">
              A person{' '}
              <span className="inline-block min-w-[120px] px-3 py-2 bg-white border-2 border-dashed border-orange-400 rounded-lg shadow-inner relative">
                <span className="text-orange-600 font-bold">
                  {exampleAnswer || 'type here...'}
                </span>
                {exampleState === 'correct' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <span className="material-icons text-white text-sm">check</span>
                  </motion.span>
                )}
                {exampleState === 'incorrect' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <span className="material-icons text-white text-sm">close</span>
                  </motion.span>
                )}
              </span>{' '}
              the dishes
            </div>
            
            <div className="flex justify-center gap-3">
              <span className="px-3 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full font-semibold text-sm shadow-md border border-blue-300">
                washing
              </span>
              <span className="px-3 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full font-semibold text-sm shadow-md border border-green-300">
                cleaning
              </span>
              <span className="px-3 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full font-semibold text-sm shadow-md border border-purple-300">
                scrubbing
              </span>
            </div>
            
            <div className="text-sm">
              {exampleState === 'correct' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-700 font-semibold"
                >
                  ✅ "washing" is correct!
                </motion.p>
              )}
              {exampleState === 'incorrect' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-700 font-semibold"
                >
                  ❌ "wash" is incorrect. Try "washing"!
                </motion.p>
              )}
              {exampleState === 'typing' && (
                <p className="text-orange-700 font-medium">
                  💡 Watch the example in action!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Start Section */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Start Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartGame}
          disabled={!isDataReady}
          className={`text-xl font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
            isDataReady 
              ? `bg-gradient-to-r ${selectedTopic.color} text-white` 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isDataReady ? (
            <span className="flex items-center gap-3">
              <span className="material-icons">play_arrow</span>
              Start
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
              Preparing...
            </span>
          )}
        </motion.button>

        {/* Back to Topics */}
        <button
          onClick={onBackToTopics}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center gap-2 group"
        >
          <span className="material-icons group-hover:-translate-x-1 transition-transform duration-200">arrow_back</span>
          Choose Different Topic
        </button>
      </div>
    </motion.div>
  );
};

// Question Card Component with Text Input
const QuestionCard = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  selectedAnswer, 
  onAnswerSelect, 
  onNext, 
  onFinish, 
  isAnswered,
  isCorrect 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageRef, isImageVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const inputRef = useRef(null);
  
  const optimizedImageUrl = optimizeImageUrl(question.imageUrl, 400, 400, 85);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current && !isAnswered) {
      inputRef.current.focus();
    }
  }, [isAnswered]);

  // Handle input submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() && !isAnswered) {
      const answer = userInput.trim().toLowerCase();
      onAnswerSelect(answer);
      setShowFeedback(true);
      
      // Play audio feedback
      const correct = answer === question.correctAnswerVerb.toLowerCase();
      playAudio(correct ? 'correct' : 'incorrect');
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto"
    >
      {/* Progress Bar */}
      <div className="bg-gray-100 h-2">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-500"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>
      
      {/* Question Header */}
      <div className="p-8 pb-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-emerald-600 font-semibold text-xl">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < questionNumber - 1 ? 'bg-emerald-500' : 
                  i === questionNumber - 1 ? 'bg-cyan-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="px-8 pb-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Image Section */}
          <div className="relative" ref={imageRef}>
            <div className="w-full max-w-md mx-auto aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
              {!imageLoaded && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {(isImageVisible || imageLoaded) && (
                <img
                  src={optimizedImageUrl}
                  alt={question.originalActivityText || "Action scene"}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    if (e.target.src !== question.imageUrl) {
                      e.target.src = question.imageUrl;
                    } else {
                      setImageLoaded(true);
                    }
                  }}
                  loading="eager"
                  decoding="async"
                  style={{
                    imageRendering: 'auto',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)'
                  }}
                />
              )}
            </div>
          </div>
          
          {/* Question and Input Section */}
          <div className="space-y-6">
            {/* Question Text */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 leading-relaxed">
                {question.questionTextPrefix}{' '}
                <span className="inline-block min-w-[160px] relative">
                  {!isAnswered ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="type here..."
                      className="w-full px-4 py-2 text-center text-2xl font-bold text-emerald-600 bg-white border-2 border-dashed border-emerald-400 rounded-lg focus:border-emerald-600 focus:outline-none transition-colors duration-200 shadow-inner"
                      disabled={isAnswered}
                    />
                  ) : (
                    <span className="inline-block w-full px-4 py-2 text-center text-2xl font-bold text-emerald-600 bg-emerald-50 border-2 border-emerald-400 rounded-lg shadow-inner">
                      {selectedAnswer}
                    </span>
                  )}
                </span>{' '}
                {question.questionTextSuffix}
              </h2>
            </div>
            
            {/* Options Display */}
            {question.options && question.options.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 text-center">
                  💡 Choose from these options:
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {question.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => !isAnswered && setUserInput(option)}
                      disabled={isAnswered}
                      className={`px-6 py-3 rounded-full font-semibold shadow-lg border-2 transition-all duration-200 ${
                        userInput.toLowerCase() === option.toLowerCase()
                          ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white border-emerald-500 shadow-xl'
                          : isAnswered
                          ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 border-blue-200 hover:border-blue-400 hover:shadow-xl cursor-pointer'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Click an option to fill it in, or type your own answer
                </p>
              </div>
            )}
            
            {/* Submit Button */}
            {!isAnswered && (
              <div className="pt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!userInput.trim()}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </motion.button>
              </div>
            )}
            
            {/* Feedback */}
            <AnimatePresence>
              {isAnswered && showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-xl ${
                    isCorrect 
                      ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-700' 
                      : 'bg-red-50 border-2 border-red-200 text-red-700'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-icons text-2xl">
                      {isCorrect ? 'check_circle' : 'cancel'}
                    </span>
                    <span className="text-xl font-bold">
                      {isCorrect ? 'Excellent!' : 'Not quite right!'}
                    </span>
                  </div>
                  
                  {!isCorrect && (
                    <div className="text-lg">
                      <p>Your answer: <span className="font-semibold">{selectedAnswer}</span></p>
                      <p>Correct answer: <span className="font-semibold">{question.correctAnswerVerb}</span></p>
                    </div>
                  )}
                  
                  {isCorrect && (
                    <p className="text-lg">Perfect! You got it right!</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Next Button */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={questionNumber === totalQuestions ? onFinish : onNext}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {questionNumber === totalQuestions ? 'Finish Game' : 'Next Question'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Results Screen Component
const ResultsScreen = ({ score, totalQuestions, onPlayAgain, onBackToGames, onBackToTopics, selectedTopic, answers }) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const getPerformanceMessage = () => {
    if (percentage >= 90) return "Outstanding! You're an action word expert! 🌟";
    if (percentage >= 70) return "Great job! You have a good understanding of verbs! 👏";
    if (percentage >= 50) return "Well done! Keep practicing to improve further! 💪";
    return "Good effort! Practice makes perfect! 🎯";
  };

  const getStars = () => {
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center max-w-2xl mx-auto"
    >
      {percentage >= 70 && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}
      
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            {Array.from({ length: getStars() }, (_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                className="text-yellow-400 text-4xl"
              >
                ⭐
              </motion.span>
            ))}
          </div>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            {selectedTopic.title} Complete!
          </h2>
          
          <div className="text-6xl font-bold text-emerald-600 mb-4">
            {score}<span className="text-3xl text-gray-500">/{totalQuestions}</span>
          </div>
          
          <div className="text-2xl font-semibold text-gray-600 mb-4">
            {percentage}% Correct
          </div>
          
          <p className="text-lg text-gray-600 mb-6">
            {getPerformanceMessage()}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
            className={`bg-gradient-to-r ${selectedTopic.color} text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            Play Again
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToTopics}
            className="bg-blue-100 text-blue-700 font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-200 transition-all duration-300"
          >
            Choose Topic
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToGames}
            className="bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-200 transition-all duration-300"
          >
            Back to Games
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Error Screen Component
const ErrorScreen = ({ error, onRetry, onBackToTopics }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center"
  >
    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-8 shadow-xl">
      <span className="material-icons text-red-600 text-4xl">error</span>
    </div>
    
    <h2 className="text-4xl font-bold text-red-600 mb-4">
      Oops! Something went wrong
    </h2>
    
    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
      {error?.message || 'Failed to load the questions. Please try again.'}
    </p>
    
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="bg-red-500 text-white text-xl font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Try Again
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBackToTopics}
        className="bg-gray-100 text-gray-700 text-xl font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-200 transition-all duration-300"
      >
        Choose Different Topic
      </motion.button>
    </div>
  </motion.div>
);

// Main Action Game Component with Background Loading
const Action = ({ onBackToGames }) => {
  const [gameState, setGameState] = useState('topics'); // 'topics', 'instructions', 'playing', 'results', 'error'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [isDataReady, setIsDataReady] = useState(false);

  const handleTopicSelect = async (topic) => {
    setSelectedTopic(topic);
    setGameState('instructions');
    setError(null);
    setIsDataReady(false);

    // Start fetching data in background while showing instructions
    try {
      // Step 1: Fetch questions from API
      const fetchedQuestions = await fetchTopicQuestions(topic.id);
      
      // Step 2: Shuffle questions for replayability
      const shuffledQuestions = [...fetchedQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);
      
      // Step 3: Extract image URLs for preloading
      const imageUrls = shuffledQuestions.map(q => q.imageUrl).filter(Boolean);
      
      // Step 4: Preload all images in background
      if (imageUrls.length > 0) {
        await preloadImages(imageUrls, () => {}); // Silent preloading
      }
      
      // Step 5: Data is ready
      setIsDataReady(true);
      
    } catch (err) {
      setError(err);
      setGameState('error');
    }
  };

  const handleStartGame = () => {
    if (isDataReady) {
      setGameState('playing');
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setAnswers([]);
    }
  };

  const handleAnswerSelect = (answer) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer.toLowerCase() === currentQuestion.correctAnswerVerb.toLowerCase();
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setAnswers(prev => [...prev, {
      question: currentQuestion,
      selectedAnswer: answer,
      isCorrect
    }]);
  };

  const handleNext = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleFinish = () => {
    setGameState('results');
  };

  const handlePlayAgain = () => {
    // Go back to instructions with data already ready
    setGameState('instructions');
    setIsDataReady(true);
  };

  const handleBackToTopics = () => {
    setGameState('topics');
    setSelectedTopic(null);
    setQuestions([]);
    setError(null);
    setIsDataReady(false);
  };

  const handleRetry = () => {
    if (selectedTopic) {
      handleTopicSelect(selectedTopic);
    } else {
      handleBackToTopics();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer?.toLowerCase() === currentQuestion?.correctAnswerVerb?.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToGames}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <span className="material-icons">arrow_back</span>
            <span className="font-medium">Back to Games</span>
          </motion.button>
          
          {gameState === 'playing' && (
            <div className="text-emerald-600 font-semibold text-lg">
              Score: {score}/{questions.length}
            </div>
          )}
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {gameState === 'topics' && (
            <TopicSelectionScreen key="topics" onTopicSelect={handleTopicSelect} />
          )}
          
          {gameState === 'instructions' && selectedTopic && (
            <InstructionsScreen 
              key="instructions" 
              selectedTopic={selectedTopic}
              onStartGame={handleStartGame}
              isDataReady={isDataReady}
              onBackToTopics={handleBackToTopics}
            />
          )}
          
          {gameState === 'error' && (
            <ErrorScreen key="error" error={error} onRetry={handleRetry} onBackToTopics={handleBackToTopics} />
          )}
          
          {gameState === 'playing' && currentQuestion && (
            <QuestionCard
              key={currentQuestionIndex}
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
              onNext={handleNext}
              onFinish={handleFinish}
              isAnswered={isAnswered}
              isCorrect={isCorrect}
            />
          )}
          
          {gameState === 'results' && selectedTopic && (
            <ResultsScreen
              key="results"
              score={score}
              totalQuestions={questions.length}
              onPlayAgain={handlePlayAgain}
              onBackToGames={onBackToGames}
              onBackToTopics={handleBackToTopics}
              selectedTopic={selectedTopic}
              answers={answers}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Action; 