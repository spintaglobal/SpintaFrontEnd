import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import genAIService from '../../../services/genAIService';

// Add custom styles for drag and drop effects
const customStyles = `
  .dragging {
    opacity: 0.6;
    transform: rotate(5deg) scale(1.1);
    z-index: 1000;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }
  
  .dragover {
    background-color: rgba(147, 51, 234, 0.1) !important;
    border-color: rgba(147, 51, 234, 0.5) !important;
    transform: scale(1.02);
  }
  
  .droppable-area {
    transition: all 0.2s ease-in-out;
  }
  
  .droppable-area:hover {
    transform: scale(1.05);
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = customStyles;
document.head.appendChild(styleSheet);

// Sound Effect Hook
const useSoundEffects = () => {
  const correctSound = useRef(null);
  const incorrectSound = useRef(null);
  const dropSound = useRef(null);
  const successSound = useRef(null);

  useEffect(() => {
    // Create Audio objects for sound effects
    correctSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIbBjiS2fLVgjMFK3nE6d2OQAoUW7Lh77tZF1M=');
    incorrectSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACNiYmJdGNmdJOvpZBjNjNbodDbr2MdBj2Y3PHEcyUFKX/J7d2OSAoUYbnl66lUEApEnt/1wGMbBjaO1u/SfzEGKXjB59iLPAcVXbPl7qlUEApEnt/1wGMbBjaO1u/SfzEGKXjB59iLPAcVXbPl7qlUEApEnt/15gR=');
    dropSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAB+iYmJdGNmdJOvpZBjNjNbodDbr2MdBj2Y3PHEcyUFKX/J7d2OSAoUYbnl66lUEApEnt/1wGMbBjaO1u/SfzEGKXjB59iLPAcVXbPl7qlUEApEnt/1wGMbBjaO1u/SfzEGKXjB59iLPAcVXbPl7qlU15ZA=');
    successSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACRiYmJdGNmdJOvpZBjNjNbodDbr2MdBj2Y3PHEcyUFKX/J7d2OSAoUYbnl66lUEApEnt/1wGMbBjaO1u/SfzEGKXjB59iLPAcVXbPl7qlUEApEnt/1wGMbBjaO1u/SfzEGKXjB59iLPAcVXbPl7qlUEApEnt/1wGMbBjaO1u/SfzEGKXjB59iLPAcVXbPl7r5ZAAA=');
  }, []);

  const playSound = useCallback((type) => {
    try {
      let audio;
      switch (type) {
        case 'correct':
          audio = correctSound.current;
          break;
        case 'incorrect':
          audio = incorrectSound.current;
          break;
        case 'drop':
          audio = dropSound.current;
          break;
        case 'success':
          audio = successSound.current;
          break;
        default:
          return;
      }
      if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors if user hasn't interacted yet
      }
    } catch (error) {
      // Silently handle audio errors
    }
  }, []);

  return { playSound };
};

// Tutorial/Practice Component
const TutorialMode = ({ isContentReady, onStartGame, playSound }) => {
  const [tutorialWords, setTutorialWords] = useState([
    { id: 1, text: 'amazing', isUsed: false },
    { id: 2, text: 'quickly', isUsed: false },
    { id: 3, text: 'book', isUsed: false },
    { id: 4, text: 'garden', isUsed: false }
  ]);

  const [tutorialSentences, setTutorialSentences] = useState([
    {
      id: 1,
      text: "The athlete ran ______ to finish the race first.",
      answer: 'quickly',
      droppedWord: null,
      isCorrect: null,
      isActive: true
    },
    {
      id: 2,
      text: "She read an ______ story about adventures in space.",
      answer: 'amazing',
      droppedWord: null,
      isCorrect: null,
      isActive: true
    }
  ]);

  const [completedTutorial, setCompletedTutorial] = useState(false);

  const handleTutorialDragStart = (event, word) => {
    if (!word.isUsed) {
      event.dataTransfer.setData("word", word.text);
      event.dataTransfer.setData("wordId", word.id.toString());
      event.target.classList.add('dragging');
    }
  };

  const handleTutorialDragEnd = (event) => {
    event.target.classList.remove('dragging');
  };

  const handleTutorialDrop = (event, sentenceId) => {
    event.preventDefault();
    const word = event.dataTransfer.getData("word");
    const wordId = parseInt(event.dataTransfer.getData("wordId"));

    const sentenceIndex = tutorialSentences.findIndex(s => s.id === sentenceId);
    if (sentenceIndex !== -1) {
      const updatedSentences = [...tutorialSentences];
      const updatedWords = [...tutorialWords];
      const currentSentence = updatedSentences[sentenceIndex];

      // If there was a previous word in this sentence, make it available again
      if (currentSentence.droppedWord) {
        const oldWordId = updatedWords.findIndex(w => w.text === currentSentence.droppedWord);
        if (oldWordId !== -1) {
          updatedWords[oldWordId].isUsed = false;
        }
      }

      // Update the sentence with the new word
      currentSentence.droppedWord = word;
      currentSentence.isCorrect = word === currentSentence.answer;
      updatedWords.find(w => w.id === wordId).isUsed = true;
      
      setTutorialSentences(updatedSentences);
      setTutorialWords(updatedWords);
      
      // Play appropriate sound
      playSound(currentSentence.isCorrect ? 'correct' : 'drop');

      // Check if tutorial is completed
      if (updatedSentences.every(s => s.isCorrect)) {
        setCompletedTutorial(true);
        setTimeout(() => playSound('success'), 300);
      }
    }
  };

  const handleTutorialDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
  };

  const handleTutorialDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
  };

  const resetTutorial = () => {
    setTutorialWords(prev => prev.map(word => ({ ...word, isUsed: false })));
    setTutorialSentences(prev => prev.map(sentence => ({
      ...sentence,
      droppedWord: null,
      isCorrect: null
    })));
    setCompletedTutorial(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[500px]"
    >
      {/* Tutorial Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h3 className="text-3xl font-bold text-purple-600 mb-2">
          🎮 Let's Learn How to Play!
        </h3>
        <p className="text-gray-600 text-lg">
          Practice drag and drop while we prepare your personalized challenge
        </p>
      </motion.div>

      {/* Tutorial Word Bank */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6 border border-blue-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          🎯 Practice Words
          <span className="text-sm text-gray-500">
            (Try dragging these words!)
          </span>
        </h4>
        <div className="flex flex-wrap gap-3 justify-center">
          {tutorialWords.map(word => (
            <motion.button
              key={word.id}
              whileHover={!word.isUsed ? { scale: 1.05, y: -2 } : {}}
              whileTap={!word.isUsed ? { scale: 0.95 } : {}}
              className={`${
                word.isUsed
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white hover:bg-blue-50 text-blue-800 shadow-sm hover:shadow-md cursor-move'
              } font-medium py-3 px-6 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-blue-200 select-none`}
              draggable={!word.isUsed}
              onDragStart={(event) => handleTutorialDragStart(event, word)}
              onDragEnd={handleTutorialDragEnd}
            >
              {word.text}
              {!word.isUsed && <span className="ml-2 text-xs opacity-50">👆</span>}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Tutorial Sentences */}
      <motion.div 
        className="space-y-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">
          📝 Practice Sentences - Drag words to fill the blanks!
        </h4>
        {tutorialSentences.map((sentence, index) => (
          <motion.div
            key={sentence.id}
            data-sentence-id={sentence.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 * index }}
            whileHover={{ scale: 1.01 }}
            className={`p-4 rounded-lg transition-all duration-300 ${
              sentence.isCorrect === true
                ? 'bg-green-50 border-2 border-green-200 shadow-green-100'
                : sentence.isCorrect === false
                  ? 'bg-red-50 border-2 border-red-200 shadow-red-100'
                  : 'bg-white border-2 border-blue-200 shadow-md hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-blue-600 font-bold text-lg min-w-[30px]">
                {index + 1}.
              </span>
              <div
                className="text-lg flex-grow"
                onDrop={(event) => handleTutorialDrop(event, sentence.id)}
                onDragOver={handleTutorialDragOver}
                onDragLeave={handleTutorialDragLeave}
                dangerouslySetInnerHTML={{
                  __html: sentence.text.replace(
                    '______',
                    `<span class='${
                      sentence.isCorrect === true
                        ? 'bg-green-200 text-green-800 border-green-300'
                        : sentence.isCorrect === false
                          ? 'bg-red-200 text-red-800 border-red-300'
                          : 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                    } px-4 py-2 rounded-md inline-block min-w-[120px] text-center droppable-area border-2 border-dashed transition-all duration-200'>${
                      sentence.droppedWord || 'Drop here'
                    }</span>`
                  ),
                }}
              />
              {sentence.isCorrect !== null && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl"
                >
                  {sentence.isCorrect ? '✅' : '❌'}
                </motion.span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Completion Message & Actions */}
      <motion.div className="text-center">
        {completedTutorial && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg border-2 border-green-200"
          >
            🎉 Great job! You've mastered the basics! Now you're ready for the real challenge!
          </motion.div>
        )}

        <div className="flex gap-4 justify-center items-center">
          <button
            onClick={resetTutorial}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg
              transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 transform hover:scale-105"
          >
            🔄 Try Again
          </button>
          
          <button
            onClick={onStartGame}
            disabled={!isContentReady}
            className={`font-medium py-4 px-8 rounded-lg transition-all duration-200 shadow-md transform ${
              isContentReady
                ? 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg hover:scale-105 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isContentReady ? (
              <>🚀 Start Real Challenge!</>
            ) : (
              <>
                <span className="inline-block animate-pulse">⏳</span> Preparing Your Challenge...
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Topic Display Component
const TopicDisplay = ({ topic, description }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-xl mb-6 border-l-4 border-purple-500"
  >
    <h3 className="text-xl font-bold text-purple-800 mb-2">📚 Today's Topic: {topic}</h3>
    <p className="text-purple-700">{description}</p>
  </motion.div>
);

// Score Animation Component
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
    {score > 0 ? '✨ +1' : '❌ -1'}
  </motion.div>
);

const ResultScreen = ({ finalScore, totalQuestions, onRetry, onNewChallenge }) => {
  const { playSound } = useSoundEffects();
  const percentage = Math.round((finalScore / totalQuestions) * 100);
  
  useEffect(() => {
    if (percentage >= 80) {
      playSound('success');
    }
  }, [percentage, playSound]);

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Outstanding! 🌟", color: "text-green-600", emoji: "🏆" };
    if (percentage >= 70) return { message: "Great job! 👏", color: "text-blue-600", emoji: "🎉" };
    if (percentage >= 50) return { message: "Good effort! 💪", color: "text-yellow-600", emoji: "👍" };
    return { message: "Keep practicing! 📚", color: "text-purple-600", emoji: "💡" };
  };

  const performance = getPerformanceMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      {percentage >= 80 && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="text-8xl mb-4"
      >
        {performance.emoji}
      </motion.div>

      <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
        Challenge Complete!
      </h2>
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
        className="mb-6"
      >
        <div className="text-6xl font-bold text-purple-600 mb-2">
          {finalScore}
          <span className="text-3xl text-gray-600">/{totalQuestions}</span>
        </div>
        <div className={`text-2xl font-semibold ${performance.color} mb-2`}>
          {percentage}% Score
        </div>
        <p className={`text-lg ${performance.color}`}>{performance.message}</p>
      </motion.div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={onRetry}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg
            transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          🔄 Same Topic
        </button>
        <button
          onClick={onNewChallenge}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg
            transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          🎯 New Challenge
        </button>
      </div>
    </motion.div>
  );
};

const WordDropChallenge = ({ onBackToGames }) => {
  const [gameData, setGameData] = useState(null);
  const [isContentReady, setIsContentReady] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [lastCheckedScore, setLastCheckedScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [scoreAnimations, setScoreAnimations] = useState([]);
  const [showingSolution, setShowingSolution] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [words, setWords] = useState([]);
  const [sentences, setSentences] = useState([]);
  
  const { playSound } = useSoundEffects();

  // Load game content in background
  const loadGameContent = useCallback(async () => {
    try {
      const content = await genAIService.generateWordDropContent();
      setGameData(content);
      setWords(content.wordBank);
      setSentences(content.sentences);
      setIsContentReady(true);
    } catch (error) {
      console.error('Failed to load game content:', error);
      // Even with fallback content, mark as ready
      setIsContentReady(true);
    }
  }, []);

  useEffect(() => {
    loadGameContent();
  }, [loadGameContent]);

  const handleStartGame = () => {
    setGameStarted(true);
    playSound('success');
  };

  const showFeedbackMessage = (message, type) => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  };

  const handleDragStart = (event, word) => {
    if (!word.isUsed) {
      event.dataTransfer.setData("word", word.text);
      event.dataTransfer.setData("wordId", word.id.toString());
      event.target.classList.add('dragging');
    }
  };

  const handleDragEnd = (event) => {
    event.target.classList.remove('dragging');
  };

  const handleDrop = (event, sentenceId) => {
    event.preventDefault();
    const word = event.dataTransfer.getData("word");
    const wordId = parseInt(event.dataTransfer.getData("wordId"));

    const sentenceIndex = sentences.findIndex(s => s.id === sentenceId);
    if (sentenceIndex !== -1) {
      const updatedSentences = [...sentences];
      const updatedWords = [...words];
      const currentSentence = updatedSentences[sentenceIndex];

      // If there was a previous word in this sentence, make it available again
      if (currentSentence.droppedWord) {
        const oldWordId = updatedWords.findIndex(w => w.text === currentSentence.droppedWord);
        if (oldWordId !== -1) {
          updatedWords[oldWordId].isUsed = false;
        }
      }

      // Update the sentence with the new word
      currentSentence.droppedWord = word;
      currentSentence.isCorrect = null; // Reset correctness until check button is clicked
      updatedWords.find(w => w.id === wordId).isUsed = true;
      
      setSentences(updatedSentences);
      setWords(updatedWords);
      
      // Play drop sound
      playSound('drop');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
  };

  const handleRetry = () => {
    // Reset current game
    const resetSentences = sentences.map(sentence => ({
      ...sentence,
      droppedWord: null,
      isCorrect: null
    }));
    
    const resetWords = words.map(word => ({
      ...word,
      isUsed: false
    }));
    
    setSentences(resetSentences);
    setWords(resetWords);
    setScore(0);
    setLastCheckedScore(0);
    setScoreAnimations([]);
    setShowingSolution(false);
    setShowFinalScore(false);
  };

  const handleNewChallenge = () => {
    // Reset game state and load new content
    setScore(0);
    setLastCheckedScore(0);
    setScoreAnimations([]);
    setShowingSolution(false);
    setShowFinalScore(false);
    setGameStarted(false);
    setIsContentReady(false);
    loadGameContent();
  };

  const handleShowSolution = () => {
    const solvedSentences = sentences.map(sentence => ({
      ...sentence,
      droppedWord: sentence.answer,
      isCorrect: true
    }));
    
    const usedWords = words.map(word => ({
      ...word,
      isUsed: sentences.some(s => s.answer === word.text)
    }));
    
    setSentences(solvedSentences);
    setWords(usedWords);
    setShowingSolution(true);
    
    // Calculate perfect score
    setScore(sentences.length);
    setLastCheckedScore(sentences.length);
  };

  const handleFinishGame = () => {
    setScore(lastCheckedScore);
    setShowFinalScore(true);
  };

  const handleCheck = () => {
    const updatedSentences = sentences.map(sentence => ({
      ...sentence,
      isCorrect: sentence.droppedWord === sentence.answer
    }));

    // Clear any existing animations
    setScoreAnimations([]);

    // Create new animations for each answered sentence
    const newAnimations = [];
    let correctCount = 0;
    let incorrectCount = 0;
    
    updatedSentences.forEach((sentence, index) => {
      if (sentence.droppedWord) {
        const element = document.querySelector(`[data-sentence-id="${sentence.id}"] .droppable-area`);
        if (element) {
          const rect = element.getBoundingClientRect();
          newAnimations.push({
            id: Date.now() + index,
            score: sentence.isCorrect ? 1 : -1,
            position: {
              x: rect.left + (rect.width / 2) - 10,
              y: rect.top - 10
            }
          });
          
          if (sentence.isCorrect) {
            correctCount++;
          } else {
            incorrectCount++;
          }
        }
      }
    });

    setScoreAnimations(newAnimations);

    // Play sounds based on results
    setTimeout(() => {
      if (correctCount > incorrectCount) {
        playSound('correct');
      } else if (incorrectCount > 0) {
        playSound('incorrect');
      }
    }, 200);

    // Remove animations after they complete
    setTimeout(() => {
      setScoreAnimations([]);
    }, 1000);

    setSentences(updatedSentences);
    
    // Calculate and save score
    const checkedScore = Math.max(0, correctCount - incorrectCount);
    
    setScore(checkedScore);
    setLastCheckedScore(checkedScore);
    
    if (checkedScore === sentences.length) {
      showFeedbackMessage('Perfect score! 🎉 You mastered this topic!', 'success');
    } else if (checkedScore >= sentences.length * 0.7) {
      showFeedbackMessage('Great job! 👏 You\'re doing well!', 'success');
    } else {
      showFeedbackMessage('Keep trying! 💪 Review and check your answers!', 'error');
    }
  };

  // Show tutorial mode when game hasn't started yet
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-8">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl w-full">
          {/* Header with Back Button */}
          <div className="flex items-center mb-8">
            <button
              onClick={onBackToGames}
              className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-all duration-200 text-purple-700 font-medium transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Games
            </button>
          </div>

          <TutorialMode 
            isContentReady={isContentReady} 
            onStartGame={handleStartGame}
            playSound={playSound}
          />
        </div>
      </div>
    );
  }

  if (showFinalScore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-8">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl w-full">
          <ResultScreen
            finalScore={score}
            totalQuestions={sentences.length}
            onRetry={handleRetry}
            onNewChallenge={handleNewChallenge}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl w-full relative"
      >
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBackToGames}
            className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-all duration-200 text-purple-700 font-medium transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Games
          </button>
          
          {/* Score Display */}
          <div className="absolute top-8 right-8 flex items-center gap-4">
            <motion.div 
              key={score}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="bg-purple-100 text-purple-800 font-bold py-2 px-4 rounded-lg"
            >
              Score: {score}/{sentences.length}
            </motion.div>
          </div>
          
          <div className="ml-auto mr-auto text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              🎯 Word Drop Challenge
            </h2>
            <p className="text-gray-600 mt-2">
              Drag and drop words to complete the sentences!
            </p>
          </div>
        </div>

        {/* Topic Display */}
        {gameData && <TopicDisplay topic={gameData.topic} description={gameData.description} />}

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

        {/* Feedback Message */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 p-4 rounded-lg text-center font-medium text-lg ${
                feedbackType === 'success'
                  ? 'bg-green-100 text-green-800 border-2 border-green-200'
                  : 'bg-red-100 text-red-800 border-2 border-red-200'
              }`}
            >
              {feedbackMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Word Bank */}
        <motion.div 
          className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl mb-6 border border-purple-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            🗂️ Word Bank
            <span className="text-sm text-gray-500">({words.filter(w => !w.isUsed).length} remaining)</span>
          </h3>
          <motion.div
            className="flex flex-wrap gap-3"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {words.map(word => (
              <motion.button
                key={word.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={!word.isUsed ? { scale: 1.05, y: -2 } : {}}
                whileTap={!word.isUsed ? { scale: 0.95 } : {}}
                className={`${
                  word.isUsed
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-purple-50 text-purple-800 shadow-sm hover:shadow-md cursor-move'
                } font-medium py-3 px-5 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-purple-200 select-none`}
                draggable={!word.isUsed}
                onDragStart={(event) => handleDragStart(event, word)}
                onDragEnd={handleDragEnd}
              >
                {word.text}
                {!word.isUsed && <span className="ml-2 text-xs opacity-50">📌</span>}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Sentences */}
        <motion.div 
          className="space-y-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {sentences.map((sentence, index) => (
            <motion.div
              key={sentence.id}
              data-sentence-id={sentence.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.01 }}
              className={`p-4 rounded-lg transition-all duration-300 ${
                sentence.isCorrect === true
                  ? 'bg-green-50 border-2 border-green-200 shadow-green-100'
                  : sentence.isCorrect === false
                    ? 'bg-red-50 border-2 border-red-200 shadow-red-100'
                    : 'bg-white border-2 border-purple-200 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-600 font-bold text-lg min-w-[30px]">
                  {index + 1}.
                </span>
                <div
                  className="text-lg flex-grow"
                  onDrop={(event) => handleDrop(event, sentence.id)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  dangerouslySetInnerHTML={{
                    __html: sentence.text.replace(
                      '______',
                      `<span class='${
                        sentence.isCorrect === true
                          ? 'bg-green-200 text-green-800 border-green-300'
                          : sentence.isCorrect === false
                            ? 'bg-red-200 text-red-800 border-red-300'
                            : 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
                      } px-4 py-2 rounded-md inline-block min-w-[120px] text-center droppable-area border-2 border-dashed transition-all duration-200'>${
                        sentence.droppedWord || 'Drop here'
                      }</span>`
                    ),
                  }}
                />
                {sentence.isCorrect !== null && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-2xl"
                  >
                    {sentence.isCorrect ? '✅' : '❌'}
                  </motion.span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex items-center justify-center space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {showingSolution ? (
            <button
              onClick={handleFinishGame}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg
                transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              🏁 Finish Game
            </button>
          ) : (
            <>
              <button
                onClick={handleCheck}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg
                  transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                disabled={sentences.every(s => !s.droppedWord)}
              >
                ✅ Check Answers
              </button>
              <button
                onClick={handleRetry}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg
                  transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 transform hover:scale-105"
              >
                🔄 Reset
              </button>
              <button
                onClick={handleShowSolution}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-3 px-6 rounded-lg
                  transition-all duration-200 shadow-sm hover:shadow-md border border-indigo-200 transform hover:scale-105"
              >
                💡 Show Solution
              </button>
              <button
                onClick={handleNewChallenge}
                className="bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-6 rounded-lg
                  transition-all duration-200 shadow-sm hover:shadow-md border border-green-200 transform hover:scale-105"
              >
                🎯 New Topic
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WordDropChallenge;