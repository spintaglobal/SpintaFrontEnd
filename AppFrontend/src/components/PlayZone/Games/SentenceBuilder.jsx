import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import genAIService from '../../../services/genAIService';

// Fixed game utilities with proper answer checking
const gameUtils = {
  isSentenceCorrect: (currentWords, correctWords) => {
    if (!currentWords || !correctWords) return false;
    if (currentWords.length !== correctWords.length) return false;
    
    // Normalize words for comparison (trim, lowercase)
    const normalizedCurrent = currentWords.map(word => 
      (word || '').toString().trim().toLowerCase()
    );
    const normalizedCorrect = correctWords.map(word => 
      (word || '').toString().trim().toLowerCase()
    );
    
    console.log('Checking answer:', { 
      current: normalizedCurrent, 
      correct: normalizedCorrect,
      match: normalizedCurrent.every((word, index) => word === normalizedCorrect[index])
    });
    
    return normalizedCurrent.every((word, index) => word === normalizedCorrect[index]);
  },
  
  playSound: (type) => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
          case 'drop':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            break;
          case 'correct':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            break;
          case 'error':
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            break;
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        console.log('Audio not available');
      }
    }
  }
};

// Difficulty Slider Component
const DifficultySlider = ({ onStart }) => {
  const [sliderValue, setSliderValue] = useState(33); // Default to medium
  
  const getDifficultyInfo = (value) => {
    if (value <= 33) return { 
      level: 'easy', 
      label: 'Beginner', 
      description: '4-6 words, simple sentences',
      color: 'from-green-400 to-green-600',
      emoji: '🌱'
    };
    if (value <= 66) return { 
      level: 'medium', 
      label: 'Intermediate', 
      description: '7-10 words, compound sentences',
      color: 'from-yellow-400 to-orange-500',
      emoji: '🌟'
    };
    return { 
      level: 'hard', 
      label: 'Advanced', 
      description: '10-15 words, complex sentences',
      color: 'from-red-400 to-purple-600',
      emoji: '🚀'
    };
  };

  const currentDifficulty = getDifficultyInfo(sliderValue);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            🧩 Sentence Builder
          </motion.h1>
          <p className="text-gray-600 text-lg">
            Build perfect sentences by arranging scrambled words in the correct order
          </p>
        </div>

        <div className="mb-12">
          <div className="text-center mb-8">
            <motion.div
              key={currentDifficulty.level}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-white font-bold text-xl bg-gradient-to-r ${currentDifficulty.color} shadow-lg`}
            >
              <span className="text-2xl">{currentDifficulty.emoji}</span>
              {currentDifficulty.label}
            </motion.div>
            <p className="text-gray-600 mt-3 text-lg">{currentDifficulty.description}</p>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 33%, #f59e0b 33%, #f59e0b 66%, #ef4444 66%, #ef4444 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Advanced</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl mb-2">🌱</div>
            <div className="font-semibold text-green-700">Beginner</div>
            <div className="text-sm text-green-600">Simple, everyday sentences</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <div className="text-2xl mb-2">🌟</div>
            <div className="font-semibold text-yellow-700">Intermediate</div>
            <div className="text-sm text-yellow-600">Descriptive sentences</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl mb-2">🚀</div>
            <div className="font-semibold text-purple-700">Advanced</div>
            <div className="text-sm text-purple-600">Complex structures</div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onStart(currentDifficulty.level)}
          className={`w-full py-4 rounded-2xl text-white font-bold text-xl shadow-lg bg-gradient-to-r ${currentDifficulty.color} hover:shadow-xl transition-all duration-200`}
        >
          Start Building Sentences! 🚀
        </motion.button>
      </motion.div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
          border: 3px solid #4f46e5;
        }
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
          border: 3px solid #4f46e5;
        }
      `}</style>
    </div>
  );
};

// Enhanced WordTile component
const WordTile = ({ 
  word, 
  isDragging, 
  isSelected,
  onDragStart, 
  onDragEnd,
  onClick,
  className,
  isInSentence = false,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`${className} cursor-grab active:cursor-grabbing font-semibold text-lg select-none 
                 rounded-xl px-4 py-3 relative overflow-hidden transition-all duration-200
                 ${isInSentence ? 'border-2 border-opacity-30' : 'border border-opacity-50'}
                 ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{ 
        scale: isDragging ? 1.1 : isSelected ? 1.02 : 1,
        boxShadow: isDragging ? "0 15px 35px rgba(0,0,0,0.25)" : "0 4px 8px rgba(0,0,0,0.1)"
      }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {/* Shimmer effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        />
      )}
      
      <span className="relative z-10">{word}</span>
    </motion.div>
  );
};

// Drop Zone Component
const SentenceDropZone = ({ 
  droppedTiles, 
  onDrop, 
  onDragOver, 
  onDragLeave, 
  dropIndicatorPosition,
  isActive,
  expectedLength 
}) => {
  return (
    <motion.div
      className={`relative min-h-[120px] border-4 border-dashed rounded-2xl overflow-hidden 
                 transition-all duration-300 ${
                   isActive 
                     ? 'border-blue-500 bg-blue-50 shadow-lg' 
                     : 'border-gray-300 bg-gray-50'
                 }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      animate={{ scale: isActive ? 1.02 : 1 }}
    >
      {/* Drop indicator */}
      <AnimatePresence>
        {dropIndicatorPosition !== null && (
          <motion.div
            className="absolute top-4 bottom-4 w-1 bg-blue-500 rounded-full"
            style={{ left: `${dropIndicatorPosition}px` }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 p-6 flex flex-wrap gap-4 justify-center items-center min-h-[88px]">
        {droppedTiles.length === 0 && (
          <motion.div 
            className="text-gray-400 italic text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-lg mb-2">🎯 Drag words here to build your sentence</div>
          </motion.div>
        )}
        
        <AnimatePresence mode="popLayout">
          {droppedTiles.map((tile, index) => (
            <motion.div
              key={tile.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {tile.component}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Progress indicators */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
          {[...Array(expectedLength)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < droppedTiles.length ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Main Game Component
const SentenceBuilderGame = ({ onBackToGames }) => {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [sentences, setSentences] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(2); // Allow 2 attempts per question
  const [difficulty, setDifficulty] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [hasAnswerBeenChecked, setHasAnswerBeenChecked] = useState(false);

  // Interaction state
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [selectedTile, setSelectedTile] = useState(null);
  const [draggedTileId, setDraggedTileId] = useState(null);
  const [dropIndicatorPosition, setDropIndicatorPosition] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);

  // Tile management
  const [wordTiles, setWordTiles] = useState([]);
  const [droppedTiles, setDroppedTiles] = useState([]);
  
  // Performance tracking
  const [startTime, setStartTime] = useState(Date.now());
  const [userPerformance, setUserPerformance] = useState({
    correctAnswers: 0,
    totalAnswers: 0,
    averageTime: 0,
    times: []
  });

  const dropZoneRef = useRef(null);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Generate new sentences each time the game starts
  const loadSentences = async (selectedDifficulty) => {
    setIsLoading(true);
    const loadingMessages = [
      '🔮 Mixing words into perfect puzzles...',
      '📝 Scrambling academic sentences...',
      '🎯 Preparing your word challenges...',
      '⚡ Brewing linguistic brain teasers...',
      '🌟 Crafting sentence adventures...',
      '🧩 Assembling word mysteries...'
    ];
    
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    setLoadingMessage(randomMessage);
    
    try {
      // Always generate new sentences - 10 questions total
      const generatedSentences = await genAIService.generateSentences(selectedDifficulty, 10);
      
      if (generatedSentences.length > 0) {
        setSentences(generatedSentences);
        setLoadingMessage('🎉 Your word adventure is ready!');
        console.log('Generated sentences:', generatedSentences);
      } else {
        setLoadingMessage('📖 Loading expertly curated challenges...');
        setSentences(genAIService.getFallbackSentences(selectedDifficulty, 10));
      }
      
      setTimeout(() => {
        setIsLoading(false);
        loadNewSentence(0, generatedSentences.length > 0 ? generatedSentences : genAIService.getFallbackSentences(selectedDifficulty, 10));
      }, 1500);
    } catch (error) {
      console.error('Error loading sentences:', error);
      setLoadingMessage('🏆 Activating premium question bank...');
      const fallback = genAIService.getFallbackSentences(selectedDifficulty, 10);
      setSentences(fallback);
      setTimeout(() => {
        setIsLoading(false);
        loadNewSentence(0, fallback);
      }, 1500);
    }
  };

  const handleGameStart = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    loadSentences(selectedDifficulty);
  };

  // Create unique word tiles
  const createWordTiles = useCallback((sentence) => {
    return sentence.jumbled.map((word, index) => ({
      id: `${word}-${index}-${Date.now()}-${Math.random()}`,
      word,
      originalIndex: index
    }));
  }, []);

  // Current sentence
  const currentSentence = useMemo(() =>
    sentences[currentSentenceIndex] || { correct: [], jumbled: [], chunks: [] },
    [sentences, currentSentenceIndex]
  );

  const loadNewSentence = useCallback((index, sentenceList = sentences) => {
    if (!sentenceList[index]) return;
    
    setCurrentSentenceIndex(index);
    setWordTiles(createWordTiles(sentenceList[index]));
    setDroppedTiles([]);
    setDraggedTileId(null);
    setIsCorrect(null);
    setShowHint(false);
    setAttempts(0);
    setHasAnswerBeenChecked(false);
    setStartTime(Date.now());
  }, [createWordTiles, sentences]);

  const getWordClasses = (word) => {
    // Get word type from chunks
    let type = null;
    for (const chunk of currentSentence.chunks) {
      if (chunk.words.includes(word)) {
        type = chunk.type;
        break;
      }
    }
    
    const baseClasses = "transition-all duration-200";
    switch (type) {
      case 'N': return `${baseClasses} bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-700`;
      case 'V': return `${baseClasses} bg-gradient-to-br from-red-500 to-red-600 text-white border-red-700`;
      case 'P': return `${baseClasses} bg-gradient-to-br from-green-500 to-green-600 text-white border-green-700`;
      case 'A': return `${baseClasses} bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-700`;
      default: return `${baseClasses} bg-gradient-to-br from-gray-500 to-gray-600 text-white border-gray-700`;
    }
  };

  // Fixed answer checking
  const checkAnswer = useCallback((tiles) => {
    const words = tiles.map(tile => tile.word);
    const isAnswerCorrect = gameUtils.isSentenceCorrect(words, currentSentence.correct);
    const timeTaken = (Date.now() - startTime) / 1000;
    
    console.log('Answer check:', {
      submitted: words,
      correct: currentSentence.correct,
      isCorrect: isAnswerCorrect
    });
    
    setIsCorrect(isAnswerCorrect);
    setAttempts(prev => prev + 1);
    setHasAnswerBeenChecked(true);
    
    // Update performance tracking
    setUserPerformance(prev => ({
      correctAnswers: prev.correctAnswers + (isAnswerCorrect ? 1 : 0),
      totalAnswers: prev.totalAnswers + 1,
      times: [...prev.times, timeTaken],
      averageTime: [...prev.times, timeTaken].reduce((a, b) => a + b, 0) / [...prev.times, timeTaken].length
    }));

    if (isAnswerCorrect) {
      setStreak(prev => prev + 1);
      gameUtils.playSound('correct');
    } else {
      setStreak(0);
      gameUtils.playSound('error');
    }
  }, [currentSentence.correct, startTime]);

  const handleCheckAnswer = () => {
    if (droppedTiles.length === currentSentence.correct.length) {
      checkAnswer(droppedTiles);
    }
  };

  const handleTryAgain = () => {
    setDroppedTiles([]);
    setWordTiles(createWordTiles(currentSentence));
    setIsCorrect(null);
    setHasAnswerBeenChecked(false);
    setShowHint(false);
    // Keep the attempts count - don't reset it
  };

  const handleNextSentence = useCallback(async () => {
    if (isCorrect) {
      const timeBonus = Math.max(20 - Math.floor((Date.now() - startTime) / 1000), 5);
      const streakBonus = streak >= 3 ? 10 : 0;
      setScore(prevScore => prevScore + Math.max(10 - attempts, 1) + timeBonus + streakBonus);
    }
    
    if (currentSentenceIndex < sentences.length - 1) {
      loadNewSentence(currentSentenceIndex + 1);
    } else {
      setGameComplete(true);
    }
  }, [currentSentenceIndex, sentences, loadNewSentence, isCorrect, attempts, startTime, streak]);

  // Drag handlers
  const handleDragStart = useCallback((e, tileId) => {
    setDraggedTileId(tileId);
    setIsDropZoneActive(true);
    gameUtils.playSound('drop');
    e.dataTransfer.setData('text/plain', tileId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTileId(null);
    setIsDropZoneActive(false);
    setDropIndicatorPosition(null);
  }, []);

  const findTileById = useCallback((id) => {
    return wordTiles.find(tile => tile.id === id) ||
           droppedTiles.find(tile => tile.id === id);
  }, [wordTiles, droppedTiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const rect = dropZone.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setDropIndicatorPosition(Math.max(24, x));
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setDropIndicatorPosition(null);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDropZoneActive(false);
    
    const tileId = e.dataTransfer.getData('text/plain') || draggedTileId;
    if (!tileId) return;

    const draggedTile = findTileById(tileId);
    if (!draggedTile) return;

    // Remove from current location and get updated arrays
    let updatedWordTiles = wordTiles;
    let updatedDroppedTiles = droppedTiles;
    
    if (wordTiles.find(tile => tile.id === tileId)) {
      // Remove from word tiles
      updatedWordTiles = wordTiles.filter(tile => tile.id !== tileId);
      setWordTiles(updatedWordTiles);
    } else if (droppedTiles.find(tile => tile.id === tileId)) {
      // Remove from dropped tiles (to prevent duplication)
      updatedDroppedTiles = droppedTiles.filter(tile => tile.id !== tileId);
      setDroppedTiles(updatedDroppedTiles);
    }

    // Create new tile component
    const tileComponent = (
      <WordTile
        key={draggedTile.id}
        word={draggedTile.word}
        className={getWordClasses(draggedTile.word)}
        isDragging={draggedTileId === draggedTile.id}
        isSelected={selectedTile === draggedTile.id}
        onDragStart={(e) => handleDragStart(e, draggedTile.id)}
        onDragEnd={handleDragEnd}
        onClick={() => handleTileClick(draggedTile.id)}
        isInSentence={true}
      />
    );

    // Add to dropped tiles using the updated array
    const newDroppedTiles = [...updatedDroppedTiles, { 
      id: draggedTile.id, 
      word: draggedTile.word, 
      component: tileComponent 
    }];
    
    setDroppedTiles(newDroppedTiles);
    setDropIndicatorPosition(null);
    gameUtils.playSound('drop');

    // Reset answer check state when user changes answer
    if (hasAnswerBeenChecked) {
      setIsCorrect(null);
      setHasAnswerBeenChecked(false);
    }

    // Auto-check when all words are placed
    if (newDroppedTiles.length === currentSentence.correct.length && !hasAnswerBeenChecked) {
      setTimeout(() => {
        checkAnswer(newDroppedTiles);
      }, 500); // Small delay for better UX
    }
  }, [draggedTileId, wordTiles, droppedTiles, findTileById, getWordClasses, selectedTile, handleDragStart, handleDragEnd, hasAnswerBeenChecked, currentSentence.correct.length, checkAnswer]);

  // Touch handling
  const handleTileClick = useCallback((tileId) => {
    if (!isTouchDevice) return;
    
    const draggedTile = findTileById(tileId);
    if (!draggedTile) return;
    
    // Move between word bank and sentence area
    if (wordTiles.find(tile => tile.id === tileId)) {
      // Move from word bank to drop zone
      const updatedWordTiles = wordTiles.filter(tile => tile.id !== tileId);
      setWordTiles(updatedWordTiles);
      
      const tileComponent = (
        <WordTile
          key={draggedTile.id}
          word={draggedTile.word}
          className={getWordClasses(draggedTile.word)}
          isSelected={true}
          onClick={() => handleTileClick(draggedTile.id)}
          isInSentence={true}
        />
      );
      const newDroppedTiles = [...droppedTiles, { 
        id: draggedTile.id, 
        word: draggedTile.word, 
        component: tileComponent 
      }];
      setDroppedTiles(newDroppedTiles);

      // Auto-check when all words are placed (touch)
      if (newDroppedTiles.length === currentSentence.correct.length && !hasAnswerBeenChecked) {
        setTimeout(() => {
          checkAnswer(newDroppedTiles);
        }, 500);
      }
    } else if (droppedTiles.find(tile => tile.id === tileId)) {
      // Move from drop zone back to word bank
      const updatedDroppedTiles = droppedTiles.filter(tile => tile.id !== tileId);
      setDroppedTiles(updatedDroppedTiles);
      setWordTiles(prev => [...prev, draggedTile]);
      
      // Reset answer check state when removing tiles
      if (hasAnswerBeenChecked) {
        setIsCorrect(null);
        setHasAnswerBeenChecked(false);
      }
    }
  }, [isTouchDevice, findTileById, wordTiles, getWordClasses, droppedTiles, currentSentence.correct.length, hasAnswerBeenChecked, checkAnswer]);

  const handleShowHint = () => {
    setShowHint(true);
    setScore(prev => Math.max(0, prev - 5));
  };

  const handleResetSentence = () => {
    loadNewSentence(currentSentenceIndex);
  };

  const handleShowAnswer = () => {
    setIsCorrect(false);
    setHasAnswerBeenChecked(true);
    setAttempts(maxAttempts); // Set to max attempts to show answer immediately
    setScore(prev => Math.max(0, prev - 10)); // Penalty for showing answer
    gameUtils.playSound('error');
  };

  // Show difficulty slider first
  if (!gameStarted) {
    return <DifficultySlider onStart={handleGameStart} />;
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden relative">
        {/* Floating word bubbles background */}
        <div className="absolute inset-0">
          {['WORD', 'SENTENCE', 'PUZZLE', 'CHALLENGE', 'BUILD', 'SOLVE'].map((word, index) => (
            <motion.div
              key={word}
              className="absolute text-white/20 font-bold text-lg select-none"
              style={{
                left: `${15 + (index * 12)}%`,
                top: `${20 + (index * 8)}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 3 + (index * 0.5),
                repeat: Infinity,
                delay: index * 0.5
              }}
            >
              {word}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-white text-center relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated puzzle pieces */}
          <div className="relative mb-8">
            <motion.div
              className="text-7xl mb-2"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🧩
            </motion.div>
            
            {/* Orbiting mini puzzle pieces */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{ 
                  left: '50%',
                  top: '50%',
                  transformOrigin: '0 0'
                }}
                animate={{
                  rotate: [0 + (i * 90), 360 + (i * 90)],
                  x: [0, 40, 0, -40, 0],
                  y: [0, -40, 0, 40, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              >
                🔤
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {loadingMessage}
          </motion.div>
          
          {/* Enhanced loading dots with word effects */}
          <div className="flex gap-3 justify-center items-center mb-6">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="relative"
              >
                <motion.div
                  className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity, 
                    delay: i * 0.15 
                  }}
                />
                {/* Ripple effect */}
                <motion.div
                  className="absolute inset-0 w-4 h-4 bg-white rounded-full opacity-30"
                  animate={{ 
                    scale: [1, 2, 1],
                    opacity: [0.3, 0, 0.3]
                  }}
                  transition={{ 
                    duration: 1.2, 
                    repeat: Infinity, 
                    delay: i * 0.15 
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Fun fact or tip */}
          <motion.div 
            className="text-sm opacity-80 max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            💡 <strong>Pro Tip:</strong> Look for connecting words like "however" and "therefore" - they're clues to sentence structure!
          </motion.div>
        </motion.div>

        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Game complete screen
  if (gameComplete) {
    const accuracyRate = Math.round((userPerformance.correctAnswers / userPerformance.totalAnswers) * 100);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-600 text-white p-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <div className="text-8xl mb-6">🏆</div>
          <div className="text-4xl font-bold mb-8">Excellent Work!</div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 space-y-4">
            <div className="text-2xl">Final Score: <span className="font-bold text-yellow-300">{score}</span></div>
            <div className="text-lg">Accuracy: <span className="font-bold">{accuracyRate}%</span></div>
            <div className="text-lg">Questions Completed: <span className="font-bold">{sentences.length}</span></div>
          </div>
          
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-50"
            >
              Play Again
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBackToGames}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-600"
            >
              Back to Games
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBackToGames}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-blue-700 font-medium hover:bg-blue-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          
          <div className="text-center flex-grow">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🧩 Sentence Builder
            </h1>
            <div className="flex justify-center gap-4 items-center mt-4">
              <div className="bg-white px-4 py-2 rounded-xl shadow-md">
                <span className="text-sm text-gray-600">Question {currentSentenceIndex + 1} of {sentences.length}</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl shadow-md">
                <span className="text-sm text-gray-600">Score: {score}</span>
              </div>
              {hasAnswerBeenChecked && attempts > 0 && (
                <div className="bg-white px-4 py-2 rounded-xl shadow-md">
                  <span className="text-sm text-gray-600">
                    Attempts: {attempts}/{maxAttempts}
                  </span>
                </div>
              )}
              {streak > 0 && (
                <motion.div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-xl shadow-md"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-sm font-bold">🔥 {streak} streak!</span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="bg-white px-4 py-2 rounded-xl shadow-md">
            <span className="text-sm text-gray-600 capitalize">{difficulty}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
          <p className="text-gray-700 font-medium">
            {isTouchDevice 
              ? '👆 Tap words to move them between areas'
              : '🖱️ Drag words to build the perfect sentence'}
          </p>
        </div>

        {/* Drop Zone */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-700">📝 Build Your Sentence</h3>
          </div>
          
          <div ref={dropZoneRef}>
            <SentenceDropZone
              droppedTiles={droppedTiles}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              dropIndicatorPosition={dropIndicatorPosition}
              isActive={isDropZoneActive}
              expectedLength={currentSentence.correct.length}
            />
          </div>
        </div>

        {/* Word Bank */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-700">🎯 Available Words</h3>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl shadow-inner min-h-[120px]">
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <AnimatePresence mode="popLayout">
                {wordTiles.map((tile) => (
                  <motion.div
                    key={tile.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <WordTile
                      word={tile.word}
                      className={getWordClasses(tile.word)}
                      isDragging={draggedTileId === tile.id}
                      isSelected={selectedTile === tile.id}
                      onDragStart={(e) => handleDragStart(e, tile.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleTileClick(tile.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Feedback and Controls */}
        <div className="flex flex-col items-center gap-6">
          <AnimatePresence>
            {isCorrect !== null && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className={`text-2xl font-bold px-8 py-4 rounded-2xl shadow-xl ${
                  isCorrect 
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                    : 'bg-gradient-to-r from-red-400 to-red-600 text-white'
                }`}
              >
                {isCorrect ? '🎉 Perfect! Excellent work!' : 
                 attempts >= maxAttempts ? '❌ Incorrect! Here\'s the answer:' : `🤔 Not quite right, try again! (Attempt ${attempts}/${maxAttempts})`}
              </motion.div>
            )}
          </AnimatePresence>
          
          {(isCorrect === false && attempts >= maxAttempts) && (
            <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl">
              <div className="text-yellow-800 font-medium mb-2">💡 Correct Answer:</div>
              <div className="text-gray-700 font-bold mb-2">
                {currentSentence.correct.join(' ')}
              </div>
              <div className="text-green-600 font-medium text-sm">
                ✅ You can now proceed to the next question!
              </div>
            </div>
          )}

          {(isCorrect === false && attempts < maxAttempts && !showHint) && (
            <div className="text-center">
              <button 
                onClick={handleShowHint}
                className="text-yellow-600 hover:text-yellow-700 underline font-medium hover:bg-yellow-50 px-4 py-2 rounded-lg"
              >
                💡 Need a hint? (−5 points)
              </button>
            </div>
          )}

          {showHint && (
            <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl">
              <div className="text-yellow-800 font-medium mb-2">💡 Hint:</div>
              <div className="text-gray-700 font-bold">
                {currentSentence.correct.join(' ')}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetSentence}
              className="px-6 py-3 rounded-xl font-bold shadow-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              🔄 Reset
            </motion.button>

            {/* Show Answer Button - Always Available */}
            {!hasAnswerBeenChecked && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShowAnswer}
                className="px-6 py-3 rounded-xl font-bold shadow-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700"
              >
                💡 Show Answer (-10 pts)
              </motion.button>
            )}
            
            {/* Check Answer Button - Only if not auto-checked */}
            {!hasAnswerBeenChecked && droppedTiles.length === currentSentence.correct.length && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckAnswer}
                className="px-8 py-3 rounded-xl font-bold shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
              >
                ✅ Check Answer
              </motion.button>
            )}

            {/* Try Again Button */}
            {isCorrect === false && attempts < maxAttempts && hasAnswerBeenChecked && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTryAgain}
                className="px-8 py-3 rounded-xl font-bold shadow-lg bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
              >
                🔄 Try Again
              </motion.button>
            )}

            {/* Next Question Button */}
            {(isCorrect === true || (isCorrect === false && attempts >= maxAttempts)) && hasAnswerBeenChecked && currentSentenceIndex < sentences.length - 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextSentence}
                className="px-8 py-3 rounded-xl font-bold shadow-lg bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700"
              >
                ➡️ Next Question
              </motion.button>
            )}

            {/* Finish Game Button */}
            {(isCorrect === true || (isCorrect === false && attempts >= maxAttempts)) && hasAnswerBeenChecked && currentSentenceIndex >= sentences.length - 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextSentence}
                className="px-8 py-3 rounded-xl font-bold shadow-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700"
              >
                🏁 Finish Game
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentenceBuilderGame; 