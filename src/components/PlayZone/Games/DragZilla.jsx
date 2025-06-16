import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import genAIService from '../../../services/genAIService.js';

// Add CSS for the cup animation and enhanced styling
const cupCSS = `
  @keyframes liquid-fill {
    0% { height: 0%; }
    100% { height: var(--fill-level); }
  }
  
  @keyframes cup-shine {
    0% { opacity: 0.4; transform: translateX(-100%); }
    100% { opacity: 0; transform: translateX(100%); }
  }
  
  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(147, 51, 234, 0.3); }
    50% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.6), 0 0 30px rgba(147, 51, 234, 0.4); }
    100% { box-shadow: 0 0 5px rgba(147, 51, 234, 0.3); }
  }
  
  @keyframes pulse-border {
    0% { border-color: rgba(147, 51, 234, 0.3); }
    50% { border-color: rgba(147, 51, 234, 0.8); }
    100% { border-color: rgba(147, 51, 234, 0.3); }
  }
  
  @keyframes wiggle {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(1deg); }
    75% { transform: rotate(-1deg); }
    100% { transform: rotate(0deg); }
  }
  
  .blank-slot {
    position: relative;
    display: inline-block;
    min-width: 120px;
    max-width: 200px;
    margin: 0 8px;
    vertical-align: baseline;
  }
  
  .blank-slot.dragover {
    animation: glow 0.6s ease-in-out infinite, pulse-border 0.8s ease-in-out infinite;
  }
  
  .blank-slot.filled.correct {
    background: linear-gradient(135deg, #10b981, #34d399);
    color: white;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
  }
  
  .blank-slot.filled.incorrect {
    background: linear-gradient(135deg, #ef4444, #f87171);
    color: white;
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
    animation: wiggle 0.5s ease-in-out;
  }
  
  .dragging {
    cursor: grabbing !important;
  }
  
  .question-text {
    line-height: 1.8;
    font-size: 1.25rem;
    word-spacing: 0.1em;
  }
`;

// Sound effects utility
const playSound = (type) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'correct') {
      // Success sound - rising melody
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } else if (type === 'incorrect') {
      // Error sound - descending tone
      oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime); // F4
      oscillator.frequency.setValueAtTime(293.66, audioContext.currentTime + 0.15); // D4
      
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'drop') {
      // Soft drop sound
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'complete') {
      // Game completion sound - celebratory
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
        gain.gain.setValueAtTime(0.15, audioContext.currentTime + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.3);
        
        osc.start(audioContext.currentTime + index * 0.1);
        osc.stop(audioContext.currentTime + index * 0.1 + 0.3);
      });
    }
  } catch (error) {
    console.warn('Audio not supported:', error);
  }
};

// Questions will be generated using genAIService

// Instructions Screen Component
const InstructionsScreen = ({ onStartGame, isDataReady, onBackToGames }) => {
  const [exampleAnswer, setExampleAnswer] = useState('');
  const [exampleState, setExampleState] = useState('typing'); // 'typing', 'correct', 'incorrect'
  
  // Animated example effect
  useEffect(() => {
    const sequence = async () => {
      // Reset
      setExampleAnswer('');
      setExampleState('typing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Type "but" (correct)
      const correctAnswer = 'but';
      for (let i = 0; i <= correctAnswer.length; i++) {
        setExampleAnswer(correctAnswer.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      setExampleState('correct');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear and type "because" (incorrect)
      setExampleAnswer('');
      setExampleState('typing');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const incorrectAnswer = 'because';
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
      {/* Hero Section */}
      <div className="relative mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full mb-4 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
          <span className="text-white text-3xl relative z-10">🐲</span>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Dragzilla
        </h1>
        
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Master English conjunctions by dragging and dropping the right words into sentences!
        </p>
      </div>

      {/* Instructions and Example in Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Instructions */}
        <div className="bg-gradient-to-br from-white via-purple-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-purple-100">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 text-center">
            🎮 How to Play
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-l-4 border-purple-400">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <h3 className="font-bold text-purple-800">👀 Read the Sentence</h3>
                <p className="text-sm text-purple-700">Look at the sentence with the blank</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-l-4 border-indigo-400">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <h3 className="font-bold text-indigo-800">🖱️ Drag and Drop</h3>
                <p className="text-sm text-indigo-700">Drag the correct conjunction to the blank</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-400">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <h3 className="font-bold text-blue-800">✅ Get Feedback</h3>
                <p className="text-sm text-blue-700">See if your answer is correct</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border-l-4 border-emerald-400">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">4</span>
              </div>
              <div>
                <h3 className="font-bold text-emerald-800">🎯 Keep Learning</h3>
                <p className="text-sm text-emerald-700">Continue to the next question</p>
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
              I like pizza{' '}
              <span className="inline-block min-w-[120px] px-3 py-2 bg-white border-2 border-dashed border-orange-400 rounded-lg shadow-inner relative">
                <span className="text-orange-600 font-bold">
                  {exampleAnswer || '______'}
                </span>
                                 {exampleState === 'correct' && (
                   <motion.span
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                   >
                     <span className="text-white text-sm">✓</span>
                   </motion.span>
                 )}
                 {exampleState === 'incorrect' && (
                   <motion.span
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                   >
                     <span className="text-white text-sm">✗</span>
                   </motion.span>
                 )}
              </span>{' '}
              I don't like mushrooms.
            </div>
            
            <div className="flex justify-center gap-3">
              <span className="px-3 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full font-semibold text-sm shadow-md border border-blue-300">
                but
              </span>
              <span className="px-3 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full font-semibold text-sm shadow-md border border-green-300">
                because
              </span>
              <span className="px-3 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full font-semibold text-sm shadow-md border border-purple-300">
                when
              </span>
              <span className="px-3 py-2 bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 rounded-full font-semibold text-sm shadow-md border border-pink-300">
                then
              </span>
            </div>
            
            <div className="text-sm">
              {exampleState === 'correct' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-700 font-semibold"
                >
                  ✅ "but" is correct!
                </motion.p>
              )}
              {exampleState === 'incorrect' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-700 font-semibold"
                >
                  ❌ "because" is incorrect. Try "but"!
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

      {/* Start Section */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Start Button */}
        <motion.button
          whileHover={{ scale: isDataReady ? 1.05 : 1 }}
          whileTap={{ scale: isDataReady ? 0.95 : 1 }}
          onClick={onStartGame}
          disabled={!isDataReady}
          className={`text-xl font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
            isDataReady 
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
                   {isDataReady ? (
             <span className="flex items-center gap-3">
               <span>▶</span>
               Start
             </span>
           ) : (
             <span className="flex items-center gap-3">
               <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
               Preparing...
             </span>
           )}
        </motion.button>

        {/* Back to Games */}
                 <button
           onClick={onBackToGames}
           className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center gap-2 group"
         >
           <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
           Back to Games
         </button>
      </div>
    </motion.div>
  );
};

// Score Cup Component
const ScoreCup = ({ score, totalQuestions, isGlowing = false }) => {
  const fillPercentage = Math.min(100, (score / totalQuestions) * 100);
  
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-14 h-16 mb-1">
        {/* Cup body */}
        <div className="absolute inset-0 rounded-b-full rounded-t-lg bg-gradient-to-r from-purple-200 to-indigo-200 overflow-hidden shadow-md border border-purple-300">
          {/* Cup shine effect */}
          <div className="absolute inset-0 bg-white opacity-0 animate-[cup-shine_2s_ease-in-out_infinite] z-10"></div>
          
          {/* Cup liquid */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 animate-[liquid-fill_1s_ease-out_forwards]"
            style={{
              '--fill-level': `${fillPercentage}%`,
              height: `${fillPercentage}%`,
              transition: 'height 0.5s ease-out'
            }}
          >
            {/* Liquid top shine */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-20"></div>
          </div>
        </div>

        {/* Cup handle */}
        <div className="absolute right-0 top-3 w-3 h-8 border-r-2 border-t-2 border-b-2 rounded-r-full border-purple-300 transform translate-x-1"></div>
        
        {/* Glow effect */}
        <div 
          className={`absolute inset-0 rounded-b-full rounded-t-lg bg-purple-400 filter blur-md -z-10 transition-opacity duration-300 ${
            isGlowing ? 'opacity-50' : 'opacity-0'
          }`}
        ></div>
      </div>
      
      {/* Score text */}
      <div className="font-bold text-lg text-purple-700 relative">
        {score}/{totalQuestions}
        {/* Score text glow */}
        <div 
          className={`absolute inset-0 text-purple-500 filter blur-sm transition-opacity duration-300 ${
            isGlowing ? 'opacity-75' : 'opacity-0'
          }`}
        >
          {score}/{totalQuestions}
        </div>
      </div>
    </div>
  );
};

const ScoreAnimation = ({ score, position }) => (
  <motion.div
    initial={{ opacity: 0, y: 0, scale: 0.5 }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: -50,
      scale: [0.5, 1.2, 1, 0.8]
    }}
    transition={{
      duration: 0.8,
      times: [0, 0.2, 0.8, 1],
      ease: "easeOut"
    }}
    className={`fixed ${
      score > 0 ? 'text-green-600' : 'text-red-600'
    } font-bold text-2xl z-[9999] pointer-events-none`}
    style={{
      left: `${position.x}px`,
      top: `${position.y}px`,
      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}
  >
    {score > 0 ? '+1' : '-1'}
  </motion.div>
);

const ResultScreen = ({ score, totalQuestions, onRetry, highScore }) => {
  const percentage = Math.round(((score / totalQuestions) * 100) * 10) / 10;
  const [showScore, setShowScore] = useState(false);
  const [showPercentage, setShowPercentage] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHighScore, setShowHighScore] = useState(false);
  const isNewHighScore = score > highScore || (highScore === 0 && score > 0);
  
  useEffect(() => {
    // Staggered animations
    setTimeout(() => setShowScore(true), 500);
    setTimeout(() => setShowPercentage(true), 1500);
    setTimeout(() => setShowFeedback(true), 2200);
    setTimeout(() => setShowHighScore(true), 2800);
  }, []);
  
  const getFeedback = () => {
    if (percentage === 100) return "Perfect Score! Outstanding!";
    if (percentage >= 80) return "Excellent Work!";
    if (percentage >= 60) return "Good Job!";
    if (percentage >= 40) return "Keep Practicing!";
    return "Don't Give Up!";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      {isNewHighScore && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={percentage >= 60 ? 500 : 100}
          gravity={0.2}
        />
      )}
      
      <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-8">
        Game Complete!
      </h2>
      
      {isNewHighScore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: [0.8, 1.2, 1] }}
          transition={{ delay: 0.5, duration: 1 }}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold rounded-full px-4 py-1 shadow-lg mb-4 inline-block"
        >
          New High Score! 🏆
        </motion.div>
      )}
      
      <AnimatePresence>
        {showScore && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center gap-6 mb-8"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 10 }}
              className="w-24 h-24"
            >
              <ScoreCup score={score} totalQuestions={totalQuestions} isGlowing={true} />
            </motion.div>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.2, 1] }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-7xl font-bold"
            >
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {score}
              </span>
              <span className="text-4xl text-gray-600">/{totalQuestions}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl text-gray-700 mb-8"
          >
            {getFeedback()}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPercentage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 mb-10"
          >
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className={`h-full ${
                  percentage >= 60 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500'
                }`}
                initial={{ width: "0%" }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className={`text-xl font-bold ${
                percentage >= 60 ? 'text-purple-600' : 'text-orange-600'
              }`}>
                {percentage}%
              </span>
              <span className="text-gray-600 text-lg"> Correct</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showHighScore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col items-center"
          >
            <div className="font-semibold text-gray-600 mb-1">High Score</div>
            <div className={`text-2xl font-bold ${isNewHighScore ? 'text-yellow-600' : 'text-purple-600'}`}>
              {Math.max(highScore, score)}/{totalQuestions}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <button
          onClick={onRetry}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg
            transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
        >
          Try Again
        </button>
      </motion.div>
    </motion.div>
  );
};

const Dragzilla = ({ onBackToGames }) => {
  const [gameState, setGameState] = useState('instructions'); // 'instructions', 'playing', 'results'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [scoreAnimations, setScoreAnimations] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [animateScoreUpdate, setAnimateScoreUpdate] = useState(false);
  const [scoreCupGlow, setScoreCupGlow] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState({}); // Track attempts per question
  const [isRetrying, setIsRetrying] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  // Load high score from localStorage on mount and generate questions
  useEffect(() => {
    const savedHighScore = localStorage.getItem('dragzilla-high-score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    // Start generating questions in background when component mounts
    const loadQuestions = async () => {
      try {
        console.log('Generating questions with AI...');
        const generatedQuestions = await genAIService.generateDragZillaQuestions();
        setQuestions(generatedQuestions);
        setIsDataReady(true);
        console.log('AI questions generated successfully:', generatedQuestions.length);
      } catch (error) {
        console.warn('Failed to generate AI questions, using fallback:', error);
        // genAIService already handles fallback internally
        setQuestions([]);
        setIsDataReady(false);
        setError(error);
      }
    };
    
    loadQuestions();
  }, []);
  
  // Update high score when game is completed
  useEffect(() => {
    if (gameState === 'results' && score > highScore) {
      setHighScore(score);
      localStorage.setItem('dragzilla-high-score', score.toString());
    }
  }, [gameState, score, highScore]);

  useEffect(() => {
    // Add the CSS for cup animations to the document
    const styleElement = document.createElement('style');
    styleElement.textContent = cupCSS;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    if (score > 0) {
      setAnimateScoreUpdate(true);
      const timer = setTimeout(() => setAnimateScoreUpdate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [score]);

  const handleDragStart = (event, choice) => {
    event.dataTransfer.setData("choice", choice);
    event.dataTransfer.effectAllowed = "move";
    
    // Set drag preview text with scale animation
    event.target.style.transform = 'scale(1.05)';
    event.target.style.opacity = "0.6";
    event.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    
    // Add dragging class to body for global cursor change
    document.body.classList.add('dragging');
    setIsDragging(true);
  };

  const handleDragEnd = (event) => {
    // Reset styles with transition
    event.target.style.transition = 'all 0.2s ease-out';
    event.target.style.transform = 'scale(1)';
    event.target.style.opacity = "1";
    event.target.style.boxShadow = 'none';

    // Clean up after transition
    setTimeout(() => {
      event.target.style.transition = '';
    }, 200);
    
    document.body.classList.remove('dragging');
    setIsDragging(false);
    
    // Remove dragover class from all drop zones with fade
    document.querySelectorAll('.droppable-area').forEach(zone => {
      zone.style.transition = 'all 0.2s ease-out';
      zone.classList.remove('dragover');
    });
  };

  const handleDrop = (event) => {
    if (hasAnswered) return;
    
    event.preventDefault();
    const choice = event.dataTransfer.getData("choice");
    const newAnswers = { ...answers };
    newAnswers[currentQuestionIndex] = choice;
    setAnswers(newAnswers);
    
    // Play drop sound
    playSound('drop');
    
    checkAnswer(choice);
    
    // Remove dragover class
    event.currentTarget.classList.remove('dragover');
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    
    // Only add dragover class if we haven't answered yet
    if (!hasAnswered) {
      event.currentTarget.classList.add('dragover');
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
  };

  const checkAnswer = (choice) => {
    const isCorrect = choice === currentQuestion.answer;
    const currentAttempts = attempts[currentQuestionIndex] || 0;
    const newAttempts = { ...attempts, [currentQuestionIndex]: currentAttempts + 1 };
    setAttempts(newAttempts);
    
    // Play sound effect
    setTimeout(() => {
      playSound(isCorrect ? 'correct' : 'incorrect');
    }, 200);
    
    // Create score animation only for correct answers or final attempts
    if (isCorrect || currentAttempts >= 1) {
      const dropArea = document.querySelector('.droppable-area');
      if (dropArea) {
        const rect = dropArea.getBoundingClientRect();
        setScoreAnimations([{
          id: Date.now(),
          score: isCorrect ? 1 : 0,
          position: {
            x: rect.left + (rect.width / 2) - 10,
            y: rect.top - 10
          }
        }]);

        // Clear animation after it completes
        setTimeout(() => setScoreAnimations([]), 1000);
      }
    }

    if (isCorrect) {
      // Correct answer - complete this question
      setHasAnswered(true);
      setScore(prev => prev + 1);
      setScoreCupGlow(true);
      setTimeout(() => setScoreCupGlow(false), 1000);
      setFeedbackMessage('Excellent! Perfect choice! 🎉');
      setShowFeedback(true);
      setIsRetrying(false);
    } else if (currentAttempts === 0) {
      // First wrong attempt - give another chance
      setIsRetrying(true);
      setFeedbackMessage(`Not quite right! Try again - think about the relationship between the two parts of the sentence. 🤔`);
      setShowFeedback(true);
      
      // Clear the answer and allow retry
      const clearedAnswers = { ...answers };
      delete clearedAnswers[currentQuestionIndex];
      setAnswers(clearedAnswers);
      
      // Reset for retry after showing feedback briefly
      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    } else {
      // Second wrong attempt - show correct answer and move on
      setHasAnswered(true);
      setIsRetrying(false);
      setFeedbackMessage(`The correct answer is "${currentQuestion.answer}". Don't worry, keep practicing! 💪`);
      setShowFeedback(true);
    }
  };

  const handleStartGame = () => {
    if (isDataReady) {
      setGameState('playing');
      setCurrentQuestionIndex(0);
      setScore(0);
      setAnswers({});
      setHasAnswered(false);
      setShowFeedback(false);
      setAttempts({});
      setIsRetrying(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      setGameState('results');
      // Play completion sound
      setTimeout(() => playSound('complete'), 500);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setHasAnswered(false);
      setShowFeedback(false);
      setIsRetrying(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setHasAnswered(false);
      setShowFeedback(false);
    }
  };

  const handleRetry = () => {
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers({});
    setScoreAnimations([]);
    setHasAnswered(false);
    setShowFeedback(false);
    setAttempts({});
    setIsRetrying(false);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToGames}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Back to Games</span>
          </motion.button>
          
          {gameState === 'playing' && questions.length > 0 && (
            <div className="text-purple-600 font-semibold text-lg">
              Score: {score}/{questions.length}
            </div>
          )}
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {gameState === 'instructions' && (
            <InstructionsScreen
              key="instructions"
              onStartGame={handleStartGame}
              isDataReady={isDataReady}
              onBackToGames={onBackToGames}
            />
          )}
          
          {gameState === 'results' && (
            <div key="results" className="flex items-center justify-center">
              <div className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl w-full">
                <ResultScreen
                  score={score}
                  totalQuestions={questions.length}
                  onRetry={handleRetry}
                  highScore={highScore}
                />
              </div>
            </div>
          )}
          
          {gameState === 'playing' && currentQuestion && (
            <div key="playing" className="flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl w-full"
              >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Dragzilla
            </h2>
            <p className="text-gray-600 mt-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {highScore > 0 && (
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-500 mb-1">High Score</div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1 text-yellow-700 font-bold flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
                  </svg>
                  {highScore}/{questions.length}
                </div>
              </div>
            )}
            <motion.div 
              className="flex items-center"
              animate={animateScoreUpdate ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <ScoreCup score={score} totalQuestions={questions.length} isGlowing={scoreCupGlow} />
            </motion.div>
          </div>
        </div>

        {/* Score Animations */}
        <AnimatePresence>
          {scoreAnimations.map(animation => (
            <ScoreAnimation
              key={animation.id}
              score={animation.score}
              position={animation.position}
            />
          ))}
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500"
            initial={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Feedback Message */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`mb-6 p-6 rounded-2xl text-center font-bold text-lg shadow-lg border-2 ${
                feedbackMessage.includes('Excellent')
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-300 shadow-green-200/50'
                  : isRetrying
                  ? 'bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-800 border-orange-300 shadow-orange-200/50'
                  : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-300 shadow-red-200/50'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">
                  {feedbackMessage.includes('Excellent') ? '🎉' : isRetrying ? '🤔' : '💪'}
                </span>
                <span>{feedbackMessage}</span>
                <span className="text-2xl">
                  {feedbackMessage.includes('Excellent') ? '✨' : isRetrying ? '🔄' : '🎯'}
                </span>
              </div>
              {feedbackMessage.includes('Excellent') && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 text-sm text-green-600 font-medium"
                >
                  Great job! You're mastering conjunctions! 🌟
                </motion.div>
              )}
              {isRetrying && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 text-sm text-orange-600 font-medium"
                >
                  You have one more chance! Drag another option to try again. 🎯
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question */}
        <div className="bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 border-2 border-purple-200 shadow-lg rounded-xl p-8 mb-8">
          <div className="question-text text-gray-800 font-medium leading-relaxed text-center">
            {currentQuestion.text.split(/_{2,}/).map((part, index, array) => (
              <React.Fragment key={index}>
                <span className="inline-block">{part}</span>
                {index < array.length - 1 && (
                  <span 
                    className={`blank-slot inline-flex items-center justify-center px-4 py-3 rounded-xl font-bold text-center border-2 border-dashed transition-all duration-300 droppable-area ${
                      answers[currentQuestionIndex] 
                        ? `filled ${answers[currentQuestionIndex] === currentQuestion.answer ? 'correct' : 'incorrect'}` 
                        : isRetrying
                        ? 'bg-orange-50 border-orange-400 text-orange-600 hover:border-orange-500 hover:bg-orange-100 hover:shadow-md animate-pulse'
                        : 'bg-white border-purple-300 text-purple-600 hover:border-purple-500 hover:bg-purple-50 hover:shadow-md'
                    } ${isDragging && !hasAnswered ? 'border-purple-500 bg-purple-100 shadow-lg transform scale-105' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <span className="whitespace-nowrap text-lg">
                      {answers[currentQuestionIndex] || (isRetrying ? 'Try Again' : '_____')}
                    </span>
                    {answers[currentQuestionIndex] && (
                      <span className="ml-2 text-sm">
                        {answers[currentQuestionIndex] === currentQuestion.answer ? '✓' : '✗'}
                      </span>
                    )}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Conjunction Choices */}
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-8 rounded-2xl mb-6 shadow-lg border border-purple-100">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-purple-800 mb-2 flex items-center justify-center gap-2">
              <span>{isRetrying ? '🔄' : '🎯'}</span>
              {isRetrying ? 'Try Again! Choose Another Option' : 'Drag the correct conjunction'}
              <span>{isRetrying ? '🔄' : '🎯'}</span>
            </h3>
            <p className="text-sm text-purple-600">
              {isRetrying 
                ? 'Your first choice wasn\'t quite right. Try dragging a different option!' 
                : 'Click and drag one of these options into the blank above'}
            </p>
          </div>
          
          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {currentQuestion.choices.map((choice, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                className="relative group"
              >
                <button
                  className={`relative overflow-hidden ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                  } ${hasAnswered ? 'opacity-50 cursor-not-allowed' : ''}
                  bg-gradient-to-br from-white to-purple-50 text-purple-800 shadow-lg
                  font-bold py-4 px-8 rounded-xl text-lg
                  transition-all duration-300 ease-out transform
                  border-2 border-purple-200
                  ${!hasAnswered ? 'hover:bg-gradient-to-br hover:from-purple-100 hover:to-indigo-100 hover:shadow-xl hover:-translate-y-2 hover:border-purple-300 hover:scale-105 active:translate-y-0 active:scale-95' : ''}
                  ${isDragging ? 'shadow-2xl border-purple-400 bg-gradient-to-br from-purple-100 to-indigo-100' : ''}`}
                  draggable={!hasAnswered}
                  onDragStart={(e) => handleDragStart(e, choice)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Shimmer effect */}
                  {!hasAnswered && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                  )}
                  
                  <span className="relative z-10">{choice}</span>
                  
                  {/* Drag hint */}
                  {!hasAnswered && !isDragging && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-60"></span>
                  )}
                </button>
              </motion.div>
            ))}
          </motion.div>
          
          {!hasAnswered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-6"
            >
              <p className="text-sm text-purple-500 font-medium">
                💡 Tip: Look for context clues in the sentence to choose the right conjunction!
              </p>
            </motion.div>
          )}
        </div>

                {/* Navigation and Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`${
                currentQuestionIndex === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-200'
              } bg-gray-100 text-gray-700 font-medium py-2 px-6 rounded-lg
                transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-1`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Previous
            </button>
            {hasAnswered && !isRetrying && (
              <button
                onClick={handleNextQuestion}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg
                  transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-1"
              >
                {currentQuestionIndex === questions.length - 1 ? "Finish Game" : "Next Question"}
                {currentQuestionIndex !== questions.length - 1 && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}
            {isRetrying && (
              <div className="bg-orange-100 text-orange-800 font-medium py-2 px-6 rounded-lg shadow-sm border border-orange-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                Waiting for your second attempt...
              </div>
            )}
            <button
              onClick={handleRetry}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 px-6 rounded-lg
                transition-colors duration-200 shadow-sm hover:shadow-md border border-indigo-200 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Restart Game
            </button>
          </div>
        </div>
            </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dragzilla;