import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExamContainer from '../../ui/ExamContainer';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import './ToeflWritingPage.css';
import ToeflWritingFeedback from './ToeflWritingFeedback';

// Mock data for TOEFL writing test
const mockToeflWritingData = {
  "testId": "toefl_writing_test_1",
  "testTitle": "TOEFL iBT Writing Practice Test",
  "tasks": [
    {
      "taskNumber": 1,
      "taskType": "INTEGRATED_WRITING",
      "readingPassage": {
        "title": "The Primary Purpose of the Great Pyramids of Egypt",
        "content": "For centuries, the prevailing consensus among Egyptologists has been that the Great Pyramids of Giza served primarily as elaborate tombs for the pharaohs of the Old Kingdom. This theory is supported by several key pieces of evidence. Firstly, the discovery of sarcophagi within the King's Chamber of the Great Pyramid and other pyramid complexes strongly suggests a funerary purpose. While bodies were often missing, this is attributed to tomb robbery which was rampant throughout ancient Egyptian history. Secondly, the sheer scale and complexity of the pyramids, requiring immense resources and labor, align with the status and religious beliefs surrounding the pharaohs, who were considered divine rulers requiring grand eternal resting places. Furthermore, hieroglyphic texts found in later pyramids (Pyramid Texts) detail rituals and spells intended to guide the deceased pharaoh into the afterlife, reinforcing the idea that pyramids were central to their burial and transition. The careful alignment of the pyramids with cardinal directions and specific stars is also seen as part of the pharaoh's journey to the heavens, consistent with funerary beliefs."
      },
      "lectureTranscript": {
        "title": "Alternative Theories on the Function of the Great Pyramids",
        "content": "While the tomb theory is popular, there are significant challenges to it. For one, the lack of mummies or substantial burial goods in the main chambers of the Giza pyramids is problematic. If they were solely tombs, you'd expect more evidence of interment, even after robberies. The sarcophagi found could have served other ritualistic purposes besides holding a body. Second, the incredible precision and alignment, particularly with astronomical phenomena like Orion's Belt, suggest a more complex function than just a burial site. Some researchers propose the pyramids were large-scale astronomical observatories or even power generation devices, theories not easily explained by the tomb hypothesis alone. Finally, the internal structure, with narrow shafts and complex passageways, doesn't seem optimized for easy access for burial ceremonies or subsequent visits, as one might expect from a traditional tomb. This points towards a purpose perhaps related to ascension or alignment rather than simple interment."
      },
      "writingPrompt": "Summarize the points made in the lecture, being sure to explain how they cast doubt on specific points made in the reading passage.",
      "constraints": {
        "readingTimeMinutes": 3,
        "writingTimeMinutes": 20,
        "typicalWordCount": "150-225 words",
        "importantNote": "You should not express your own opinion in this task."
      }
    },
    {
      "taskNumber": 2,
      "taskType": "WRITING_FOR_ACADEMIC_DISCUSSION",
      "discussionContext": {
        "instructorPost": {
          "author": "Professor Chen",
          "topic": "The Role of Artificial Intelligence in University Education",
          "postContent": "Hello class, this week we're discussing the rapidly evolving role of Artificial Intelligence (AI) in higher education. AI tools like advanced chatbots and writing assistants are becoming more common. Some argue that AI is a powerful tool that can enhance learning and efficiency, while others worry about its potential negative impacts on academic integrity and critical thinking skills. What are your thoughts? Do you see AI as a beneficial development for university students and instructors, or does it pose significant risks? Please share your opinion and support it with reasons or examples."
        },
        "studentPosts": [
          {
            "author": "Student Anya",
            "postContent": "I think AI has huge potential to personalize learning. It can provide instant feedback on drafts, suggest resources tailored to a student's needs, and automate repetitive tasks for instructors, freeing up time for more meaningful interaction."
          },
          {
            "author": "Student Ben",
            "postContent": "I'm more concerned about academic integrity. How can we ensure students are doing their own work if AI can generate essays or solve problems instantly? It might discourage deep learning and critical thinking if students rely on it too much."
          }
        ]
      },
      "writingPrompt": "Your professor has started a discussion about the role of Artificial Intelligence in university education. Other students may have shared their views. Now, it's your turn. Write a post for the discussion forum that contributes to the academic discussion. In your post, you should clearly state your own opinion on the topic, explain your reasoning, and support your points with relevant examples or arguments.",
      "constraints": {
        "writingTimeMinutes": 10,
        "minimumWordCount": "at least 100 words"
      }
    }
  ]
};

const ToeflWritingPage = ({ onBackToStart }) => {
  const navigate = useNavigate();
  
  const [testData, setTestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [wordCount, setWordCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [fetchingQuestions, setFetchingQuestions] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = "TOEFL iBT Writing Practice";
    return () => {
      document.title = "IELTS Practice";
    };
  }, []);

  // Countdown animation effect
  useEffect(() => {
    if (showCountdown) {
      if (countdownNumber > 0) {
        const timer = setTimeout(() => {
          setCountdownNumber(countdownNumber - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // When countdown reaches 0, hide countdown and show the exam
        setShowCountdown(false);
      }
    }
  }, [countdownNumber, showCountdown]);

  // Load test data
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setFetchingQuestions(true);
        
        // First try to fetch from API, now that CSP has been updated
        try {
          console.log("Fetching TOEFL writing data from API...");
          const apiUrl = `https://h5gf4jspy7.execute-api.us-east-1.amazonaws.com/prod/toefl/writing/2`;
          
          const response = await fetch(apiUrl, { 
            method: 'GET', 
            headers: { 'Accept': 'application/json' }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("Successfully fetched TOEFL writing data from API:", data);
            
            // Use API data
            setTestData(data);
            
            // Initialize responses with API data structure
            const apiResponses = {};
            data.tasks.forEach(task => {
              apiResponses[task.taskNumber] = '';
            });
            setResponses(apiResponses);
          } else {
            console.log("API returned non-OK status, falling back to mock data:", response.status);
            // Fall back to mock data
            setTestData(mockToeflWritingData);
            
            // Initialize responses with mock data
            const initialResponses = {};
            mockToeflWritingData.tasks.forEach(task => {
              initialResponses[task.taskNumber] = '';
            });
            setResponses(initialResponses);
          }
        } catch (apiError) {
          console.log("API error, falling back to mock data:", apiError.message);
          // Fall back to mock data
          setTestData(mockToeflWritingData);
          
          // Initialize responses with mock data
          const initialResponses = {};
          mockToeflWritingData.tasks.forEach(task => {
            initialResponses[task.taskNumber] = '';
          });
          setResponses(initialResponses);
        }
        
      } catch (error) {
        console.error('Error loading test data:', error);
        setError("Failed to load test data. Please try again.");
      } finally {
        setFetchingQuestions(false);
        setIsLoading(false);
      }
    };
    
    fetchTestData();
  }, []);

  // Update word count whenever response changes
  useEffect(() => {
    if (testData && currentTaskIndex < testData.tasks.length) {
      const taskNumber = testData.tasks[currentTaskIndex].taskNumber;
      const currentResponse = responses[taskNumber] || '';
      const words = currentResponse.trim() ? currentResponse.trim().split(/\s+/).length : 0;
      setWordCount(words);
    }
  }, [responses, currentTaskIndex, testData]);

  const handleResponseChange = (e) => {
    if (testData) {
      const taskNumber = testData.tasks[currentTaskIndex].taskNumber;
      setResponses({
        ...responses,
        [taskNumber]: e.target.value
      });
    }
  };

  const handleNextTask = () => {
    if (testData && currentTaskIndex < testData.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      handleSubmitExam();
    }
  };

  const handlePreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  const handleSubmitExam = () => {
    console.log('Submitting exam responses:', responses);
    // Directly show feedback instead of showing an intermediate "Submitting" state
    setShowFeedback(true);
  };
  
  const handleRetryExam = () => {
    // Reset exam state
    setResponses({});
    setCurrentTaskIndex(0);
    setShowFeedback(false);
    setShowCountdown(true);
    setCountdownNumber(3);
  };

  const renderCountdown = () => {
    return (
      <div className="flex flex-col justify-center items-center h-[600px] text-center">
        {/* Main heading with enhanced styling */}
        <h2 className="text-4xl font-bold text-gradient mb-12">
          <span className="breath-text">Take a deep breath</span>
        </h2>
        
        {/* Enhanced countdown animation container */}
        <div className="countdown-animation">
          {/* Floating particles background */}
          <div className="particles-container">
            {[...Array(15)].map((_, index) => (
              <div 
                key={`particle-${index}`}
                className="floating-particle"
                style={{ 
                  '--delay': `${Math.random() * 5}s`,
                  '--duration': `${5 + Math.random() * 10}s`,
                  '--x-start': `${Math.random() * 100}%`,
                  '--x-end': `${Math.random() * 100}%`,
                  '--y-start': `${Math.random() * 100}%`,
                  '--y-end': `${Math.random() * 100}%`,
                  '--size': `${Math.random() * 10 + 5}px`,
                  '--opacity': Math.random() * 0.5 + 0.2
                }}
              />
            ))}
          </div>
          
          {/* Animated circles */}
          <div className="countdown-ring countdown-ring-1">
            {[...Array(8)].map((_, index) => {
              const angle = (index / 8) * 2 * Math.PI;
              const x = 110 * Math.cos(angle);
              const y = 110 * Math.sin(angle);
              
              return (
                <div 
                  key={`dot1-${index}`}
                  className="countdown-dot"
                  style={{ 
                    left: `calc(50% + ${x}px)`, 
                    top: `calc(50% + ${y}px)`,
                    opacity: 0.8,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              );
            })}
          </div>
          
          <div className="countdown-ring countdown-ring-2">
            {[...Array(12)].map((_, index) => {
              const angle = (index / 12) * 2 * Math.PI;
              const x = 140 * Math.cos(angle);
              const y = 140 * Math.sin(angle);
              
              return (
                <div 
                  key={`dot2-${index}`}
                  className="countdown-dot countdown-dot-alt"
                  style={{ 
                    left: `calc(50% + ${x}px)`, 
                    top: `calc(50% + ${y}px)`,
                    opacity: 0.5,
                    transform: 'translate(-50%, -50%) scale(0.7)'
                  }}
                />
              );
            })}
          </div>
          
          {/* Dynamic sparkles */}
          {[...Array(8)].map((_, index) => {
            const angle = Math.random() * 2 * Math.PI;
            const distance = 60 + Math.random() * 100;
            const x = distance * Math.cos(angle);
            const y = distance * Math.sin(angle);
            
            return (
              <div
                key={`sparkle-${index}`}
                className="countdown-sparkle"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  animationDelay: `${Math.random() * 2}s`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            );
          })}
          
          {/* Main countdown number with enhanced animation */}
          <div className="countdown-number-container">
            {countdownNumber > 0 ? (
              <div className="countdown-number">{countdownNumber}</div>
            ) : (
              <div className="countdown-go">Begin!</div>
            )}
          </div>
        </div>
        
        {/* Motivational message */}
        <div className="countdown-message" style={{ animationDelay: '0.3s' }}>
          {countdownNumber > 0 
            ? "Preparing your exam environment..."
            : "Your exam is ready - good luck!"
          }
        </div>
        
        {/* Breathing guide animation */}
        <div className="breathing-guide">
          <div className="breathing-circle" style={{ 
            animationDuration: `${countdownNumber > 0 ? '4s' : '0s'}`
          }}></div>
          <p className="breathing-text">
            {countdownNumber > 0 ? "Breathe in... and out..." : "Focus on your task"}
          </p>
        </div>
      </div>
    );
  };

  const renderIntegratedWritingTask = (task) => {
    const { readingPassage, lectureTranscript, writingPrompt, constraints } = task;
    
    return (
      <div className="space-y-6">
        {/* Task header with improved styling */}
        <div className="task-header-container mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-xl font-bold text-blue-800 mb-3">Instructions</h3>
          <p className="text-gray-700 mt-2 text-lg">Read the passage and listen to the lecture, then write your response according to the prompt below.</p>
          <div className="flex items-center mt-3 text-base text-gray-700 font-medium">
            <span className="flex items-center mr-4">
              <span className="material-icons text-blue-500 text-base mr-1">schedule</span>
              <strong className="font-bold">Reading:</strong> <span className="font-bold">{constraints.readingTimeMinutes} min</span>
            </span>
            <span className="flex items-center mr-4">
              <span className="material-icons text-blue-500 text-base mr-1">edit</span>
              <strong className="font-bold">Writing:</strong> <span className="font-bold">{constraints.writingTimeMinutes} min</span>
            </span>
            <span className="flex items-center">
              <span className="material-icons text-blue-500 text-base mr-1">text_format</span>
              <strong className="font-bold">Word Count:</strong> <span className="font-bold">{constraints.typicalWordCount}</span>
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reading Passage with enhanced styling */}
          <Card className="p-4 md:p-6 h-[500px] overflow-auto transition-all duration-300 hover:shadow-md">
            <div className="flex items-center mb-4">
              <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="material-icons text-blue-600">menu_book</span>
              </span>
              <h2 className="text-xl font-bold text-blue-800 ml-3">{readingPassage.title}</h2>
            </div>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p className="whitespace-pre-line">{readingPassage.content}</p>
            </div>
          </Card>
          
          {/* Lecture Transcript with enhanced styling */}
          <Card className="p-4 md:p-6 h-[500px] overflow-auto transition-all duration-300 hover:shadow-md">
            <div className="flex items-center mb-4">
              <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="material-icons text-indigo-600">record_voice_over</span>
              </span>
              <h2 className="text-xl font-bold text-indigo-800 ml-3">{lectureTranscript.title}</h2>
            </div>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p className="whitespace-pre-line">{lectureTranscript.content}</p>
            </div>
          </Card>
        </div>
        
        {/* Writing Prompt with enhanced styling */}
        <Card className="p-5 md:p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-md">
          <div className="flex items-start">
            <span className="mt-1 mr-4 text-blue-600">
              <span className="material-icons text-2xl">assignment</span>
            </span>
            <div>
              <h2 className="text-xl font-bold text-blue-800 mb-3">Writing Prompt</h2>
              <p className="text-gray-800 text-lg">{writingPrompt}</p>
              <div className="mt-4 bg-white p-4 rounded-md border border-blue-100">
                <p className="font-bold text-gray-800 text-lg mb-2">Guidelines:</p>
                <ul className="mt-1 space-y-2 text-gray-700 text-base">
                  <li className="flex items-center">
                    <span className="material-icons text-amber-500 text-base mr-2">schedule</span>
                    <strong className="font-bold mr-1">Time:</strong> <span className="font-bold">{constraints.writingTimeMinutes} minutes</span>
                  </li>
                  <li className="flex items-center">
                    <span className="material-icons text-amber-500 text-base mr-2">text_format</span>
                    <strong className="font-bold mr-1">Word Count:</strong> <span className="font-bold">150-225 words</span>
                  </li>
                  <li className="flex items-center mt-2 text-amber-700 font-medium">
                    <span className="material-icons text-amber-500 text-base mr-2">info</span>
                    <strong>You should not express your own opinion in this task.</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Response Area with enhanced styling */}
        <Card className="p-4 md:p-6 transition-all duration-300 hover:shadow-md relative">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <span className="material-icons text-green-600">edit_note</span>
              </span>
              <h2 className="text-xl font-bold text-green-800">Your Response</h2>
            </div>
            <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              Words: {wordCount}
            </span>
          </div>
          <textarea 
            className="w-full h-[300px] p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium text-gray-700"
            placeholder="Type your response here..."
            value={responses[task.taskNumber] || ''}
            onChange={handleResponseChange}
          />
        </Card>
      </div>
    );
  };

  const renderAcademicDiscussionTask = (task) => {
    const { discussionContext, writingPrompt, constraints } = task;
    const { instructorPost, studentPosts } = discussionContext;
    
    return (
      <div className="space-y-6">
        {/* Task header with improved styling */}
        <div className="task-header-container mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-xl font-bold text-blue-800 mb-3">Instructions</h3>
          <p className="text-gray-700 mt-2 text-lg">Read the discussion posts carefully, then write your own response to contribute to the academic discussion.</p>
          <div className="flex items-center mt-3 text-base text-gray-700 font-medium">
            <span className="flex items-center mr-4">
              <span className="material-icons text-blue-500 text-base mr-1">schedule</span>
              <strong className="font-bold">Writing:</strong> <span className="font-bold">{constraints.writingTimeMinutes} min</span>
            </span>
            <span className="flex items-center">
              <span className="material-icons text-blue-500 text-base mr-1">text_format</span>
              <strong className="font-bold">Word Count:</strong> <span className="font-bold">{constraints.minimumWordCount}</span>
            </span>
          </div>
        </div>
        
        {/* Discussion Context with enhanced styling */}
        <Card className="p-4 md:p-6 bg-gradient-to-b from-gray-50 to-white transition-all duration-300 hover:shadow-md">
          <div className="flex items-center mb-6">
            <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="material-icons text-blue-600">forum</span>
            </span>
            <h2 className="text-xl font-bold text-blue-800 ml-3">Academic Discussion</h2>
          </div>
          
          {/* Instructor Post with enhanced styling */}
          <div className="mb-6 p-5 bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex items-start">
              <div className="min-w-[40px] h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                P
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{instructorPost.author}</p>
                    <p className="text-sm text-gray-600">{instructorPost.topic}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Professor</span>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-md text-gray-700">
                  <p className="whitespace-pre-line">{instructorPost.postContent}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Student Posts with enhanced styling */}
          <div className="space-y-4">
            {studentPosts.map((post, index) => (
              <div key={index} className="p-5 bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
                <div className="flex items-start">
                  <div className="min-w-[40px] h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                    {post.author.charAt(0)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-gray-900">{post.author}</p>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Student</span>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-md text-gray-700">
                      <p className="whitespace-pre-line">{post.postContent}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Writing Prompt with enhanced styling */}
        <Card className="p-5 md:p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-md">
          <div className="flex items-start">
            <span className="mt-1 mr-4 text-blue-600">
              <span className="material-icons text-2xl">assignment</span>
            </span>
            <div>
              <h2 className="text-xl font-bold text-blue-800 mb-3">Writing Prompt</h2>
              <p className="text-gray-800 text-lg">{writingPrompt}</p>
              <div className="mt-4 bg-white p-4 rounded-md border border-blue-100">
                <p className="font-bold text-gray-800 text-lg mb-2">Guidelines:</p>
                <ul className="mt-1 space-y-2 text-gray-700 text-base">
                  <li className="flex items-center">
                    <span className="material-icons text-amber-500 text-base mr-2">schedule</span>
                    <strong className="font-bold mr-1">Time:</strong> <span className="font-bold">{constraints.writingTimeMinutes} minutes</span>
                  </li>
                  <li className="flex items-center">
                    <span className="material-icons text-amber-500 text-base mr-2">text_format</span>
                    <strong className="font-bold mr-1">Word Count:</strong> <span className="font-bold">150-225 words</span>
                  </li>
                  <li className="flex items-center mt-2 text-amber-700 font-medium">
                    <span className="material-icons text-amber-500 text-base mr-2">info</span>
                    <strong>You should not express your own opinion in this task.</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Response Area with enhanced styling */}
        <Card className="p-4 md:p-6 transition-all duration-300 hover:shadow-md relative">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <span className="material-icons text-green-600">edit_note</span>
              </span>
              <h2 className="text-xl font-bold text-green-800">Your Response</h2>
            </div>
            <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              Words: {wordCount}
            </span>
          </div>
          <textarea 
            className="w-full h-[300px] p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium text-gray-700"
            placeholder="Type your response here..."
            value={responses[task.taskNumber] || ''}
            onChange={handleResponseChange}
          />
        </Card>
      </div>
    );
  };

  const renderCurrentTask = () => {
    // Show enhanced countdown animation if in countdown mode
    if (showCountdown) {
      return renderCountdown();
    }
    
    if (isLoading || fetchingQuestions) {
      return (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="loading-spinner"></div>
            <p className="text-xl font-medium text-gray-700 mt-6">Preparing your exam...</p>
            <p className="text-gray-500 mt-2">Loading questions and materials</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center max-w-md">
            <div className="rounded-full h-16 w-16 bg-red-100 flex items-center justify-center mx-auto mb-6">
              <span className="material-icons text-red-500 text-2xl">error_outline</span>
            </div>
            <p className="text-xl font-medium text-gray-700 mb-4">Unable to load exam materials</p>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.location.reload()}
            >
              <span className="material-icons mr-2 text-sm">refresh</span>
              Try Again
            </Button>
          </div>
        </div>
      );
    }
    
    if (!testData || currentTaskIndex >= testData.tasks.length) {
      return null;
    }
    
    const task = testData.tasks[currentTaskIndex];
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <span className="h-8 w-8 flex items-center justify-center bg-blue-600 text-white rounded-full mr-3">
              {task.taskNumber}
            </span>
            <h1 className="text-2xl font-bold text-blue-800">
              {task.taskType.replace(/_/g, ' ')}
            </h1>
          </div>
          <div className="flex items-center text-gray-500">
            <span className="material-icons mr-2">lightbulb</span>
            <span className="text-sm">Task {currentTaskIndex + 1} of {testData.tasks.length}</span>
          </div>
        </div>
        
        {task.taskType === 'INTEGRATED_WRITING' 
          ? renderIntegratedWritingTask(task)
          : renderAcademicDiscussionTask(task)
        }
        
        <div className="flex justify-between pt-6">
          <Button
            disabled={currentTaskIndex === 0}
            onClick={handlePreviousTask}
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-300"
          >
            <span className="material-icons mr-1">arrow_back</span>
            Previous Task
          </Button>
          
          <Button
            onClick={handleNextTask}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
          >
            {currentTaskIndex < testData.tasks.length - 1 ? (
              <>
                Next Task
                <span className="material-icons ml-1">arrow_forward</span>
              </>
            ) : (
              <>
                Submit Exam
                <span className="material-icons ml-1">done</span>
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Main render method
  return (
    <ExamContainer>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {showFeedback ? (
          <ToeflWritingFeedback 
            writingData={testData}
            userResponses={responses}
            onRetry={handleRetryExam}
            onBackToStart={onBackToStart || (() => navigate('/toefl/writing'))}
          />
        ) : (
          renderCurrentTask()
        )}
      </div>
    </ExamContainer>
  );
};

export default ToeflWritingPage; 