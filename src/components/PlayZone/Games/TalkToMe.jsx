import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGeminiApiKey, GEMINI_API_ENDPOINT } from '../../../config/apiConfig';

// Get API key using safe method
const GEMINI_API_KEY = getGeminiApiKey();

const defaultQuestions = [
  "What's your favorite book and why?",
  "Describe your ideal vacation destination.",
  "What's the most interesting thing you learned recently?",
  "If you could have any superpower, what would it be and why?",
  "What's your opinion on artificial intelligence?",
  "Describe a challenge you overcame recently.",
  "What's your favorite childhood memory?",
  "If you could change one thing about the world, what would it be?",
  "What are your goals for the next five years?",
  "What advice would you give to your younger self?"
];

const topicSuggestions = [
  'History',
  'Science',
  'Sports',
  'World Events',
  'Arts',
  'Nature'
];

const surpriseMeTopics = [
  'The psychology of colors',
  'Future of space exploration',
  'Hidden talents of animals',
  'Revolutionary inventions that failed',
  'Unusual traditions around the world',
  'The science of happiness',
  'Mysteries of the ocean',
  'How music affects the brain',
  'The art of storytelling',
  'Sustainable living innovations',
  'Cultural festivals around the world',
  'The impact of social media on society'
];

const TalkToMe = ({ onBackToGames }) => {
  // Check if API key is configured
  useEffect(() => {
    if (!GEMINI_API_KEY) {
      console.error('REACT_APP_GEMINI_API_KEY is not configured in environment variables');
    }
  }, []);

  // Screen states
  const [currentScreen, setCurrentScreen] = useState('topicSelection'); // 'topicSelection', 'questionGeneration', 'practice', 'completion'
  
  // Topic selection
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState(25); // 0-100 difficulty percentage
  
  // Questions and practice
  const [questions, setQuestions] = useState(defaultQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionAnswerPairs, setQuestionAnswerPairs] = useState([]);
  
  // Speech recognition
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  
  // Feedback
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comprehensiveFeedback, setComprehensiveFeedback] = useState('');
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.webkitSpeechRecognition) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscribedText(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const generateQuestions = async (topic) => {
    setCurrentScreen('questionGeneration');
    setIsLoading(true);
    
    try {
      if (!GEMINI_API_KEY) {
        throw new Error('API key not configured. Please add REACT_APP_GEMINI_API_KEY to your environment variables.');
      }

      const difficultyLevel = getDifficultyLevel(difficulty);
      const prompt = `Generate 10 engaging questions about ${topic} for speaking practice at ${difficultyLevel} difficulty level. 

Difficulty guidelines:
- Easy (0-25%): Basic, straightforward questions that require simple personal opinions or experiences
- Medium (26-50%): Questions that require some thinking, comparison, or analysis
- Hard (51-75%): Complex, analytical questions that require critical thinking and detailed explanations
- Expert (76-100%): Challenging, debate-worthy questions that require deep analysis and sophisticated reasoning

Questions should:
- Be open-ended and thought-provoking for the ${difficultyLevel} level
- Encourage 30-60 second spoken responses
- Progress logically through different aspects of the topic
- Be suitable for educational speaking practice
- Match the complexity level of ${difficultyLevel} difficulty

Format: Return as JSON array of question strings only, no additional text or formatting.`;

      let response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1000
          }
        })
      });

      if (!response.ok && response.status === 401) {
        response = await fetch(GEMINI_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GEMINI_API_KEY}`
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 1000
            }
          })
        });
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Try to parse JSON from the response
      let generatedQuestions;
      try {
        // Remove any markdown formatting or extra text
        const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          generatedQuestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON array found in response');
        }
      } catch (parseError) {
        console.warn('Failed to parse generated questions, using fallback');
        generatedQuestions = defaultQuestions;
      }
      
      if (Array.isArray(generatedQuestions) && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
      } else {
        setQuestions(defaultQuestions);
      }
      
    } catch (error) {
      console.error('Error generating questions:', error);
      setQuestions(defaultQuestions);
    }
    
    setIsLoading(false);
    setTimeout(() => {
      setCurrentScreen('practice');
    }, 1500);
  };

  const getDifficultyLevel = (difficultyPercentage) => {
    if (difficultyPercentage <= 25) return 'Easy';
    if (difficultyPercentage <= 50) return 'Medium';
    if (difficultyPercentage <= 75) return 'Hard';
    return 'Expert';
  };

  const handleTopicSelection = (topic) => {
    setSelectedTopic(topic);
    generateQuestions(topic);
  };

  const handleCustomTopicSubmit = () => {
    if (customTopic.trim()) {
      setSelectedTopic(customTopic.trim());
      generateQuestions(customTopic.trim());
    }
  };

  const handleSurpriseMe = () => {
    const randomTopic = surpriseMeTopics[Math.floor(Math.random() * surpriseMeTopics.length)];
    setSelectedTopic(randomTopic);
    generateQuestions(randomTopic);
  };

  const startListening = () => {
    setTranscribedText('');
    setFeedback('');
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      await getFeedback();
    }
  };

  const getFeedback = async () => {
    setIsLoading(true);
    try {
      let response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Act as an expert English teacher. For the spoken response to the question "${questions[currentQuestionIndex]}", analyze the answer: "${transcribedText}". Provide up to three concise lines of plain text feedback detailing any grammatical or structural issues and offering specific suggestions for improvement without using any extra formatting symbols.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200
          }
        })
      });

      if (!response.ok && response.status === 401) {
        response = await fetch(GEMINI_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GEMINI_API_KEY}`
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Act as an expert English teacher. For the spoken response to the question "${questions[currentQuestionIndex]}", analyze the answer: "${transcribedText}". Provide up to three concise lines of plain text feedback detailing any grammatical or structural issues and offering specific suggestions for improvement without using any extra formatting symbols.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200
            }
          })
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error('Invalid response format from API');
      }

      setFeedback(data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error('Error getting feedback:', error);
      setFeedback(`Error getting feedback: ${error.message}. Please try again.`);
    }
    setIsLoading(false);
  };

  const handleNextQuestion = () => {
    // Store the current question-answer pair
    const newPair = {
      question: questions[currentQuestionIndex],
      answer: transcribedText
    };
    setQuestionAnswerPairs(prev => [...prev, newPair]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTranscribedText('');
      setFeedback('');
    } else {
      generateComprehensiveFeedback([...questionAnswerPairs, newPair]);
    }
  };

  const generateComprehensiveFeedback = async (allPairs) => {
    setIsLoading(true);
    try {
      const pairsText = allPairs.map((pair, index) => 
        `Q${index + 1}: ${pair.question}\nA${index + 1}: ${pair.answer}`
      ).join('\n\n');

      const difficultyLevel = getDifficultyLevel(difficulty);
      const prompt = `The user practiced speaking on "${selectedTopic}" at ${difficultyLevel} difficulty level. Here are their responses:

${pairsText}

Provide detailed feedback in exactly this format:

RATING: Give an overall performance score from 1-5 stars based on their responses
STRENGTHS: List 2-3 specific things they did well (detailed observations)
INSIGHTS: 1-2 key observations about their topic knowledge and communication style
GROWTH: 2-3 specific, actionable improvement suggestions with examples
NEXT: 1-2 recommended next steps for continued development

Be encouraging, specific, and provide detailed feedback. Each point should be informative and helpful for improvement.`;

      let response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      });

      if (!response.ok && response.status === 401) {
        response = await fetch(GEMINI_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GEMINI_API_KEY}`
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500
            }
          })
        });
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setComprehensiveFeedback(data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error('Error generating comprehensive feedback:', error);
      const difficultyLevel = getDifficultyLevel(difficulty);
      setComprehensiveFeedback(`RATING: 4

STRENGTHS: You demonstrated genuine engagement with each question and showed commitment to improving your speaking skills. Your responses reflected thoughtful consideration of the topics presented.

INSIGHTS: Your communication style shows potential for growth, and you engaged meaningfully with the ${selectedTopic} subject matter.

GROWTH: Focus on expanding your responses with more specific examples and concrete details to support your points. Practice structuring your answers with clear beginning, middle, and end sections.

NEXT: Try practicing with a higher difficulty level to challenge yourself further.`);
    }
    setIsLoading(false);
    setCurrentScreen('completion');
  };

  const resetGame = () => {
    setCurrentScreen('topicSelection');
    setSelectedTopic('');
    setCustomTopic('');
    setDifficulty(25); // Reset difficulty to default
    setQuestions(defaultQuestions);
    setCurrentQuestionIndex(0);
    setQuestionAnswerPairs([]);
    setTranscribedText('');
    setFeedback('');
    setComprehensiveFeedback('');
    setIsLoading(false);
  };

  // Helper function to parse feedback
  const parseFeedback = (feedbackText) => {
    const sections = {
      rating: 0,
      strengths: [],
      insights: [],
      growth: [],
      next: []
    };

    const lines = feedbackText.split('\n').filter(line => line.trim());
    let currentSection = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('RATING:')) {
        const ratingText = trimmed.replace('RATING:', '').trim();
        const ratingMatch = ratingText.match(/(\d+)/);
        if (ratingMatch) {
          sections.rating = parseInt(ratingMatch[1]);
        }
      } else if (trimmed.startsWith('STRENGTHS:')) {
        currentSection = 'strengths';
        const content = trimmed.replace('STRENGTHS:', '').trim();
        if (content) sections.strengths.push(content);
      } else if (trimmed.startsWith('INSIGHTS:')) {
        currentSection = 'insights';
        const content = trimmed.replace('INSIGHTS:', '').trim();
        if (content) sections.insights.push(content);
      } else if (trimmed.startsWith('GROWTH:')) {
        currentSection = 'growth';
        const content = trimmed.replace('GROWTH:', '').trim();
        if (content) sections.growth.push(content);
      } else if (trimmed.startsWith('NEXT:')) {
        currentSection = 'next';
        const content = trimmed.replace('NEXT:', '').trim();
        if (content) sections.next.push(content);
      } else if (currentSection && trimmed) {
        sections[currentSection].push(trimmed);
      }
    });

    // Ensure rating is within valid range
    if (sections.rating < 1 || sections.rating > 5) {
      sections.rating = 4; // Default to 4 stars
    }

    return sections;
  };

  // Topic Selection Screen
  if (currentScreen === 'topicSelection') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 to-white text-slate-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto p-6 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <motion.button
              whileHover={{ x: -5 }}
              onClick={onBackToGames}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 bg-white text-blue-600 hover:bg-blue-50 border border-blue-100 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </motion.button>
          </div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl shadow-xl p-8 mb-8 bg-white border border-blue-100"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="text-6xl mb-4"
                >
                  🎤
                </motion.div>
                <h2 className="text-4xl font-bold mb-4 text-blue-700">
                  Talk To Me
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Choose a topic you'd like to practice speaking about. I'll generate personalized questions to help you improve your communication skills.
                </p>
              </div>

              <div className="space-y-8">
                {/* Custom Topic Input */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800">Enter Your Own Topic:</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Enter any topic..."
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomTopicSubmit()}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCustomTopicSubmit}
                      disabled={!customTopic.trim()}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md ${
                        customTopic.trim()
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Generate Questions
                    </motion.button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">or choose from suggestions</span>
                  </div>
                </div>

                {/* Topic Suggestions */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800">Popular Topics:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {topicSuggestions.map((topic, index) => (
                      <motion.button
                        key={topic}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTopicSelection(topic)}
                        className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 text-slate-700 font-medium shadow-sm hover:shadow-md"
                      >
                        {topic}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Slider */}
                <div className="space-y-4 p-6 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-slate-800">Question Difficulty</h3>
                    <div className="text-lg font-bold text-blue-600">
                      {getDifficultyLevel(difficulty)} ({difficulty}%)
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Difficulty Labels */}
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-emerald-600">Easy</span>
                      <span className="text-yellow-600">Medium</span>
                      <span className="text-orange-600">Hard</span>
                      <span className="text-red-600">Expert</span>
                    </div>
                    
                    {/* Slider Container */}
                    <div className="relative h-6 flex items-center">
                      {/* Background Track */}
                      <div className="absolute w-full h-2 rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 via-orange-400 to-red-400"></div>
                      
                      {/* Progress Fill */}
                      <div 
                        className="absolute h-2 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 via-orange-500 to-red-500 transition-all duration-200"
                        style={{ width: `${difficulty}%` }}
                      ></div>
                      
                      {/* Slider Input */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={difficulty}
                        onChange={(e) => setDifficulty(parseInt(e.target.value))}
                        className="absolute w-full h-6 appearance-none bg-transparent cursor-pointer slider-input"
                      />
                      
                      {/* Slider Thumb */}
                      <div 
                        className="absolute w-6 h-6 bg-white border-3 border-slate-400 rounded-full shadow-lg transform -translate-x-3 transition-all duration-200 hover:scale-110 hover:border-blue-500 pointer-events-none"
                        style={{ left: `${difficulty}%` }}
                      >
                        <div className="absolute inset-1 bg-blue-500 rounded-full opacity-80"></div>
                      </div>
                    </div>
                    
                    {/* Difficulty Markers */}
                    <div className="relative">
                      <div className="flex justify-between">
                        {[0, 25, 50, 75, 100].map((mark) => (
                          <button
                            key={mark}
                            onClick={() => setDifficulty(mark)}
                            className="w-2 h-2 rounded-full bg-slate-300 hover:bg-slate-500 transition-colors duration-200 cursor-pointer"
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Quick Preset Buttons */}
                    <div className="flex justify-center gap-2 flex-wrap">
                      {[
                        { label: 'Beginner', value: 12, color: 'emerald' },
                        { label: 'Intermediate', value: 37, color: 'yellow' },
                        { label: 'Advanced', value: 62, color: 'orange' },
                        { label: 'Expert', value: 87, color: 'red' }
                      ].map(({ label, value, color }) => (
                        <button
                          key={label}
                          onClick={() => setDifficulty(value)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                            Math.abs(difficulty - value) <= 12
                              ? `bg-${color}-500 text-white shadow-md`
                              : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200`
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    
                    {/* Difficulty Description */}
                    <div className="text-center">
                      <div className={`inline-block px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        difficulty <= 25 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        difficulty <= 50 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        difficulty <= 75 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {difficulty <= 25 && "💫 Basic questions about personal experiences and simple opinions"}
                        {difficulty > 25 && difficulty <= 50 && "🤔 Questions requiring some analysis and comparison"}
                        {difficulty > 50 && difficulty <= 75 && "🧠 Complex questions needing critical thinking"}
                        {difficulty > 75 && "🚀 Challenging questions for advanced discussion and debate"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Surprise Me Button */}
                <div className="text-center pt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSurpriseMe}
                    className="px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 flex items-center gap-3 mx-auto"
                  >
                    <span className="text-2xl">🎲</span>
                    Surprise Me!
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <style jsx="true">{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -30px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(20px, 30px) scale(1.05); }
          }
          .animate-blob {
            animation: blob 10s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          
          /* Custom slider styles */
          .slider-input {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background: transparent;
            outline: none;
            z-index: 10;
          }
          
          .slider-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: transparent;
            cursor: pointer;
            border: none;
          }
          
          .slider-input::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: transparent;
            cursor: pointer;
            border: none;
            -moz-appearance: none;
          }
          
          .slider-input::-ms-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: transparent;
            cursor: pointer;
            border: none;
          }
          
          .slider-input::-webkit-slider-track {
            -webkit-appearance: none;
            background: transparent;
            height: 8px;
          }
          
          .slider-input::-moz-range-track {
            background: transparent;
            height: 8px;
            border: none;
          }
          
          .slider-input::-ms-track {
            background: transparent;
            height: 8px;
            border: none;
            color: transparent;
          }
        `}</style>
      </div>
    );
  }

  // Question Generation Loading Screen
  if (currentScreen === 'questionGeneration') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 to-white text-slate-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-screen p-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Animated Book */}
            <div className="relative mb-8">
              <motion.div
                animate={{ 
                  rotateY: [0, 10, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-8xl mb-4"
              >
                📚
              </motion.div>
              
              {/* Page turning animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="absolute w-16 h-20 bg-white border border-slate-200 rounded-sm shadow-md"
                    style={{
                      zIndex: 3 - i,
                      transform: `translateX(${i * 2}px) translateY(${i * 1}px)`
                    }}
                    animate={{
                      rotateY: [0, 180, 0],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Page lines */}
                    <div className="p-2 space-y-1">
                      {[...Array(4)].map((_, lineIndex) => (
                        <div 
                          key={lineIndex}
                          className="h-1 bg-slate-300 rounded"
                          style={{ width: `${Math.random() * 40 + 60}%` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Sparkles around the book */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  style={{
                    left: `${30 + Math.cos(i * Math.PI / 4) * 60}%`,
                    top: `${50 + Math.sin(i * Math.PI / 4) * 60}%`
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold mb-4 text-blue-700"
            >
              Generating Questions...
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xl text-slate-600 mb-4"
            >
              Creating <span className="font-semibold text-blue-600">{getDifficultyLevel(difficulty)}</span> level questions about <span className="font-semibold text-blue-600">{selectedTopic}</span>
            </motion.p>

            {/* Loading dots */}
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-blue-500 rounded-full"
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        <style jsx="true">{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -30px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(20px, 30px) scale(1.05); }
          }
          .animate-blob {
            animation: blob 10s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  // Completion Screen with Comprehensive Feedback
  if (currentScreen === 'completion') {
    const feedbackSections = parseFeedback(comprehensiveFeedback);
    
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 to-white text-slate-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto p-6 relative z-10 max-w-6xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 1.5 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-4 text-blue-600">Session Complete!</h1>
            
            {/* Performance Rating */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="mb-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-200 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-slate-700 mb-3">Your Performance</h3>
                <div className="flex justify-center items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.span
                      key={star}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + star * 0.1 }}
                      className={`text-3xl ${
                        star <= feedbackSections.rating 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </motion.span>
                  ))}
                </div>
                <p className="text-2xl font-bold text-slate-700">
                  {feedbackSections.rating}/5 Stars
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  {feedbackSections.rating === 5 && "Outstanding Performance! 🎯"}
                  {feedbackSections.rating === 4 && "Great Work! 👏"}
                  {feedbackSections.rating === 3 && "Good Progress! 📈"}
                  {feedbackSections.rating === 2 && "Keep Practicing! 💪"}
                  {feedbackSections.rating === 1 && "Room for Growth! 🌱"}
                </p>
              </div>
            </motion.div>
            
            <div className="flex justify-center items-center gap-6 flex-wrap mb-6">
              <div className="bg-blue-50 px-4 py-2 rounded-full">
                <span className="text-blue-600 font-medium">📚 {selectedTopic}</span>
              </div>
              <div className={`px-4 py-2 rounded-full ${
                getDifficultyLevel(difficulty) === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                getDifficultyLevel(difficulty) === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                getDifficultyLevel(difficulty) === 'Hard' ? 'bg-orange-50 text-orange-600' :
                'bg-red-50 text-red-600'
              }`}>
                🎯 {getDifficultyLevel(difficulty)} Level
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-full">
                <span className="text-green-600 font-medium">✅ {questions.length} Questions</span>
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center gap-3 text-slate-600 py-16">
              <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xl">Analyzing your performance...</span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Feedback Cards Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <h3 className="text-xl font-bold text-emerald-700">Strengths</h3>
                  </div>
                  <div className="space-y-2">
                    {feedbackSections.strengths.map((strength, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-start gap-3 text-slate-700 p-3 bg-emerald-50 rounded-lg"
                      >
                        <span className="text-emerald-600 font-bold text-lg min-w-6">{index + 1}.</span>
                        <span className="flex-1">{strength}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Insights Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💡</span>
                    </div>
                    <h3 className="text-xl font-bold text-blue-700">Key Insights</h3>
                  </div>
                  <div className="space-y-2">
                    {feedbackSections.insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="flex items-start gap-3 text-slate-700 p-3 bg-blue-50 rounded-lg"
                      >
                        <span className="text-blue-600 font-bold text-lg min-w-6">{index + 1}.</span>
                        <span className="flex-1">{insight}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Growth Areas Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-xl font-bold text-orange-700">Growth Areas</h3>
                  </div>
                  <div className="space-y-2">
                    {feedbackSections.growth.map((growth, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 + index * 0.1 }}
                        className="flex items-start gap-3 text-slate-700 p-3 bg-orange-50 rounded-lg"
                      >
                        <span className="text-orange-600 font-bold text-lg min-w-6">{index + 1}.</span>
                        <span className="flex-1">{growth}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Next Steps Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <h3 className="text-xl font-bold text-purple-700">Next Steps</h3>
                  </div>
                  <div className="space-y-2">
                    {feedbackSections.next.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 + index * 0.1 }}
                        className="flex items-start gap-3 text-slate-700 p-3 bg-purple-50 rounded-lg"
                      >
                        <span className="text-purple-600 font-bold text-lg min-w-6">{index + 1}.</span>
                        <span className="flex-1">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex flex-wrap gap-4 justify-center pt-8"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="px-8 py-4 rounded-xl font-medium shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 flex items-center gap-3"
                >
                  <span className="text-xl">🔄</span>
                  Practice New Topic
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBackToGames}
                  className="px-8 py-4 rounded-xl font-medium shadow-lg transition-all duration-200 bg-gradient-to-r from-slate-500 to-slate-600 text-white hover:from-slate-600 hover:to-slate-700 flex items-center gap-3"
                >
                  <span className="text-xl">🏠</span>
                  Back to Games
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </div>
        
        <style jsx="true">{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -30px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(20px, 30px) scale(1.05); }
          }
          .animate-blob {
            animation: blob 10s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  // Practice Screen (Main Functionality - Unchanged)
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 to-white text-slate-800">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto p-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => setCurrentScreen('topicSelection')}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 bg-white text-blue-600 hover:bg-blue-50 border border-blue-100 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </motion.button>
          
          <div className="text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-blue-100">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
              Topic: {selectedTopic}
            </div>
            <div className={`text-sm font-medium px-3 py-1.5 rounded-full ${
              getDifficultyLevel(difficulty) === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
              getDifficultyLevel(difficulty) === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
              getDifficultyLevel(difficulty) === 'Hard' ? 'bg-orange-50 text-orange-600' :
              'bg-red-50 text-red-600'
            }`}>
              {getDifficultyLevel(difficulty)} Level
            </div>
          </div>
        </div>

        <div className="relative w-full h-2.5 mb-8 rounded-full overflow-hidden bg-blue-100 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 left-0 h-full bg-blue-600"
          />
        </div>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl shadow-xl p-8 mb-8 bg-white border border-blue-100"
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">
              Talk To Me
            </h2>

            <div className="space-y-6">
              <div className="rounded-xl p-6 bg-blue-50 border border-blue-100 shadow-inner">
                <h3 className="text-xl font-semibold mb-2 text-blue-800">Your Question:</h3>
                <p className="text-lg text-slate-700">
                  {questions[currentQuestionIndex]}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startListening}
                  disabled={isListening}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md ${
                    isListening
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  {isListening ? 'Listening...' : 'Start Speaking'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopListening}
                  disabled={!isListening}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md ${
                    !isListening
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Stop Speaking
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {transcribedText && (
                  <motion.div
                    key="transcribed-text"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="rounded-xl p-6 bg-slate-50 border border-slate-200 shadow-inner"
                  >
                    <h4 className="text-lg font-semibold mb-2 text-slate-800">Your Response:</h4>
                    <p className="text-slate-700">{transcribedText}</p>
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div
                    key="loading-spinner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center items-center gap-3 text-slate-600 py-4"
                  >
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing your response...
                  </motion.div>
                )}

                {feedback && (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="rounded-xl p-6 bg-indigo-50 border border-indigo-100 shadow-md"
                  >
                    <h4 className="text-lg font-semibold mb-2 text-indigo-800">Feedback:</h4>
                    <p className="text-slate-700 whitespace-pre-line">{feedback}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextQuestion}
                  className="px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Practice'}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <style jsx="true">{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 30px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default TalkToMe;