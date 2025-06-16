import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Game data
const exercises = [
  {
    id: 1,
    instruction: "Mark all the ADJECTIVES in this sentence:",
    text: "The quick brown fox jumped over the lazy dog.",
    correctWords: ["quick", "brown", "lazy"],
    explanation: "Adjectives describe nouns: 'quick', 'brown', and 'lazy' describe the fox and dog."
  },
  {
    id: 2,
    instruction: "Mark all the VERBS in this sentence:",
    text: "She carefully walked across the room and quietly opened the door.",
    correctWords: ["walked", "opened"],
    explanation: "Verbs show action: 'walked' and 'opened' are actions performed by 'she'."
  },
  {
    id: 3,
    instruction: "Mark all the ADVERBS in this sentence:",
    text: "The student eagerly raised her hand and answered correctly.",
    correctWords: ["eagerly", "correctly"],
    explanation: "Adverbs modify verbs: 'eagerly' describes how she raised her hand, and 'correctly' describes how she answered."
  },
  {
    id: 4,
    instruction: "Mark all the PREPOSITIONS in this sentence:",
    text: "The book on the shelf belongs to my friend from school.",
    correctWords: ["on", "to", "from"],
    explanation: "Prepositions show relationships between words: 'on' relates book and shelf, 'to' relates belongs and friend, 'from' relates friend and school."
  },
  {
    id: 5,
    instruction: "Mark all the NOUNS in this sentence:",
    text: "My brother bought a computer from the store yesterday.",
    correctWords: ["brother", "computer", "store", "yesterday"],
    explanation: "Nouns are people, places, things, or times: 'brother', 'computer', 'store', and 'yesterday' are all nouns."
  }
];

const MarkTheWords = ({ onBackToGames }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentExercise = exercises[currentExerciseIndex];
  
  // Simulating loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Reset state when moving to new exercise
    setSelectedWords([]);
    setFeedback(null);
    setShowExplanation(false);
  }, [currentExerciseIndex]);
  
  const toggleWordSelection = useCallback((word) => {
    if (feedback) return; // Don't allow changes after submission
    
    setSelectedWords(prev => {
      if (prev.includes(word)) {
        return prev.filter(w => w !== word);
      } else {
        return [...prev, word];
      }
    });
  }, [feedback]);
  
  const handleSubmit = useCallback(() => {
    const { correctWords } = currentExercise;
    
    // Calculate score: +1 for each correct word, -1 for each incorrect word
    let exerciseScore = 0;
    const allWords = currentExercise.text.split(/\s+/).map(w => w.replace(/[^a-zA-Z]/g, '').toLowerCase());
    
    // Check correct words selected
    let correctSelected = 0;
    correctWords.forEach(word => {
      if (selectedWords.includes(word.toLowerCase())) {
        correctSelected++;
        exerciseScore++;
      }
    });
    
    // Check incorrect words selected
    selectedWords.forEach(word => {
      if (!correctWords.includes(word) && allWords.includes(word.toLowerCase())) {
        exerciseScore--;
      }
    });
    
    // Ensure score doesn't go below 0 for this exercise
    exerciseScore = Math.max(0, exerciseScore);
    setScore(prev => prev + exerciseScore);
    
    // Calculate accuracy
    const accuracy = (correctSelected / correctWords.length) * 100;
    
    if (accuracy === 100 && selectedWords.length === correctWords.length) {
      setFeedback({
        type: 'success',
        message: 'Perfect! You identified all the correct words.'
      });
    } else if (accuracy >= 50) {
      setFeedback({
        type: 'partial',
        message: `Good try! You found ${correctSelected} out of ${correctWords.length} correct words.`
      });
    } else {
      setFeedback({
        type: 'error',
        message: `Try again. You only found ${correctSelected} out of ${correctWords.length} correct words.`
      });
    }
  }, [currentExercise, selectedWords]);
  
  const handleNextExercise = useCallback(() => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      setGameComplete(true);
    }
  }, [currentExerciseIndex]);
  
  const handleRestart = useCallback(() => {
    setCurrentExerciseIndex(0);
    setScore(0);
    setGameComplete(false);
    setSelectedWords([]);
    setFeedback(null);
    setShowExplanation(false);
  }, []);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-400 to-blue-500 text-white">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-xl font-semibold">Loading Mark The Words...</div>
      </div>
    );
  }
  
  // Game complete screen
  if (gameComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold mb-8"
        >
          🎉 Challenge Complete! 🎉
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl mb-4 text-center"
        >
          You've completed all the word marking exercises!
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.5 }}}
          className="text-2xl font-bold mb-8"
        >
          Your Score: {score} / {exercises.length * 3}
        </motion.div>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRestart}
            className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-bold shadow-lg
                     hover:bg-emerald-50 transition-colors duration-200"
          >
            Play Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToGames}
            className="bg-emerald-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg
                     hover:bg-emerald-700 transition-colors duration-200"
          >
            Back to Games
          </motion.button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative">
        <button
          onClick={onBackToGames}
          className="absolute top-0 left-0 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors text-emerald-700 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        
        <div className="text-center flex-grow">
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold text-emerald-600"
          >
            Mark The Words
          </motion.h2>
          <div className="flex justify-center gap-3 items-center mt-2">
            <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </div>
            <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
              Score: {score}
            </div>
          </div>
        </div>
      </div>
      
      {/* Game Instructions */}
      <div className="text-center text-md text-emerald-800 font-semibold mb-6 bg-emerald-50 p-4 rounded-lg shadow-sm border border-emerald-100">
        {currentExercise.instruction}
      </div>
      
      {/* Exercise Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-8"
      >
        <div className="text-lg leading-loose">
          {currentExercise.text.split(/\s+/).map((word, index) => {
            // Extract the pure word without punctuation for selection
            const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
            // Keep the punctuation for display
            const punctuation = word.replace(/[a-zA-Z]/g, '');
            
            return (
              <React.Fragment key={index}>
                <span 
                  className={`cursor-pointer px-1 py-0.5 rounded-md mx-0.5 transition-colors
                    ${selectedWords.includes(cleanWord) ? 
                      'bg-emerald-500 text-white' : 
                      'hover:bg-emerald-100'}`}
                  onClick={() => toggleWordSelection(cleanWord)}
                >
                  {word.replace(punctuation, '')}
                </span>
                {punctuation}
                {' '}
              </React.Fragment>
            );
          })}
        </div>
      </motion.div>
      
      {/* Feedback Area */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg shadow-md mb-6 text-center
              ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 
                feedback.type === 'partial' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'}`}
          >
            <p className="font-semibold">{feedback.message}</p>
            
            {showExplanation ? (
              <div className="mt-3 p-3 bg-white rounded-md text-gray-700 text-sm">
                <p><strong>Correct words:</strong> {currentExercise.correctWords.join(', ')}</p>
                <p className="mt-2">{currentExercise.explanation}</p>
              </div>
            ) : (
              <button 
                onClick={() => setShowExplanation(true)} 
                className="mt-2 text-sm underline"
              >
                Show explanation
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        {!feedback ? (
          <button
            onClick={handleSubmit}
            disabled={selectedWords.length === 0}
            className={`px-6 py-3 rounded-lg font-bold shadow-lg transition-colors duration-200
                      ${selectedWords.length > 0 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            Check Answers
          </button>
        ) : (
          <button
            onClick={handleNextExercise}
            className="px-6 py-3 rounded-lg font-bold shadow-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors duration-200"
          >
            Next Exercise →
          </button>
        )}
      </div>
    </div>
  );
};

export default MarkTheWords;