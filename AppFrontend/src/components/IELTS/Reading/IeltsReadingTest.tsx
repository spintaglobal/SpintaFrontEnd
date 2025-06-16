import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Send, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { IeltsTest, IeltsQuestion, UserAnswer, TestState } from '../../../../types/IeltsTypes';
import ProgressIndicator from './ProgressIndicator.tsx';
import ReadingPassage from './ReadingPassage.tsx';
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion.tsx';
import TrueFalseNotGivenQuestion from './questions/TrueFalseNotGivenQuestion.tsx';
import SentenceCompletionQuestion from './questions/SentenceCompletionQuestion.tsx';
import MatchingHeadingsQuestion from './questions/MatchingHeadingsQuestion.tsx';
import ParagraphMatchingQuestion from './questions/ParagraphMatchingQuestion.tsx';
import MatchSentenceEndingsQuestion from './questions/MatchSentenceEndingsQuestion.tsx';
import IdentifyingWritersViewsQuestion from './questions/IdentifyingWritersViewsQuestion.tsx';
import IdentifyingInformationQuestion from './questions/IdentifyingInformationQuestion.tsx';
import MatchingFeaturesQuestion from './questions/MatchingFeaturesQuestion.tsx';
import RefreshTestButton from '../RefreshTestButton';
import { logger } from '../../../utils/globalLogger.js';

interface IeltsReadingTestProps {
  testData: IeltsTest;
  onSubmit: (answers: UserAnswer[]) => void;
  onExit?: () => void;
}

const IeltsReadingTest: React.FC<IeltsReadingTestProps> = ({ testData, onSubmit, onExit }) => {
  const navigate = useNavigate();
  
  // Debug logging to see the exact data structure
  logger.log('IeltsReadingTest received testData:', testData);
  logger.log('testData.sections:', testData?.sections);
  logger.log('sections type and length:', typeof testData?.sections, testData?.sections?.length);
  
  // Add safety checks for testData
  if (!testData) {
    logger.error('IeltsReadingTest: testData is null or undefined');
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Test Data Error</Typography>
          <Typography>No test data provided. Please go back and try again.</Typography>
          {onExit && (
            <Button onClick={onExit} sx={{ mt: 2 }} variant="outlined">
              Go Back
            </Button>
          )}
        </Alert>
      </Container>
    );
  }
  
  if (!testData.sections) {
    logger.error('IeltsReadingTest: testData.sections is missing');
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Test Data Error</Typography>
          <Typography>Test data is missing sections. Received keys: {Object.keys(testData).join(', ')}</Typography>
          {onExit && (
            <Button onClick={onExit} sx={{ mt: 2 }} variant="outlined">
              Go Back
            </Button>
          )}
        </Alert>
      </Container>
    );
  }
  
  if (!Array.isArray(testData.sections)) {
    logger.error('IeltsReadingTest: testData.sections is not an array, type:', typeof testData.sections);
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Test Data Error</Typography>
          <Typography>Test sections data is not in the expected format (not an array). Type: {typeof testData.sections}</Typography>
          {onExit && (
            <Button onClick={onExit} sx={{ mt: 2 }} variant="outlined">
              Go Back
            </Button>
          )}
        </Alert>
      </Container>
    );
  }
  
  if (testData.sections.length === 0) {
    logger.error('IeltsReadingTest: testData.sections is empty');
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Test Data Error</Typography>
          <Typography>Test sections array is empty. No questions to display.</Typography>
          {onExit && (
            <Button onClick={onExit} sx={{ mt: 2 }} variant="outlined">
              Go Back
            </Button>
          )}
        </Alert>
      </Container>
    );
  }

  const [testState, setTestState] = useState<TestState>({
    currentSectionIndex: 0,
    currentPassageIndex: 0,
    currentQuestionIndex: 0,
    userAnswers: new Map(),
    timeRemaining: (testData.estimatedTimeMinutes || 60) * 60,
    isSubmitted: false,
  });

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    if (testState.isSubmitted) return;

    const interval = setInterval(() => {
      setTestState(prev => {
        if (prev.timeRemaining <= 1) {
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testState.isSubmitted]);

  // Handle time up when timeRemaining reaches 0
  useEffect(() => {
    if (testState.timeRemaining === 0 && !testState.isSubmitted) {
      handleTimeUp();
    }
  }, [testState.timeRemaining, testState.isSubmitted]);

  // Add safety checks for accessing current data
  const getCurrentSection = () => {
    if (!testData.sections || testState.currentSectionIndex >= testData.sections.length) {
      return null;
    }
    return testData.sections[testState.currentSectionIndex];
  };

  const getCurrentPassage = () => {
    const currentSection = getCurrentSection();
    if (!currentSection?.passages || testState.currentPassageIndex >= currentSection.passages.length) {
      return null;
    }
    return currentSection.passages[testState.currentPassageIndex];
  };

  const getCurrentQuestion = () => {
    const currentPassage = getCurrentPassage();
    if (!currentPassage?.questions || testState.currentQuestionIndex >= currentPassage.questions.length) {
      return null;
    }
    return currentPassage.questions[testState.currentQuestionIndex];
  };

  const currentSection = getCurrentSection();
  const currentPassage = getCurrentPassage();
  const currentQuestion = getCurrentQuestion();

  // Add safety check to getAllQuestions
  const getAllQuestions = useCallback((): IeltsQuestion[] => {
    if (!testData.sections) return [];
    return testData.sections.flatMap(section =>
      section.passages?.flatMap(passage => passage.questions || []) || []
    );
  }, [testData]);

  const getTotalQuestions = useCallback((): number => {
    const allQuestions = getAllQuestions();
    let totalQuestions = 0;
    
    allQuestions.forEach(question => {
      // For grouped question types, count each item as a separate question
      if (['MATCHING_HEADINGS', 'MATCH_SENTENCE_ENDINGS', 'MATCHING_FEATURES'].includes(question.questionType) && question.items && question.items.length > 0) {
        totalQuestions += question.items.length;
      } else {
        // For single questions, count normally
        totalQuestions++;
      }
    });
    
    return totalQuestions;
  }, [getAllQuestions]);

  const getAnsweredCount = useCallback((): number => {
    return testState.userAnswers.size;
  }, [testState.userAnswers]);

  // Calculate detailed results for feedback page
  const calculateResults = useCallback(() => {
    const allQuestions = getAllQuestions();
    let correctAnswers = 0;
    let totalQuestions = 0;
    const questionResults: Array<{
      question: IeltsQuestion;
      userAnswer: UserAnswer | undefined;
      isCorrect: boolean;
    }> = [];

    allQuestions.forEach(question => {
      const userAnswer = testState.userAnswers.get(question.questionNumber);
      
      // For grouped question types, count each item as a separate question
      if (['MATCHING_HEADINGS', 'MATCH_SENTENCE_ENDINGS', 'MATCHING_FEATURES'].includes(question.questionType) && question.items && question.items.length > 0) {
        // Add the number of items to the total count
        totalQuestions += question.items.length;
        
        // Check each item's answer for correctness
        question.items.forEach((item, itemIndex) => {
          if (userAnswer && typeof userAnswer.answer === 'object' && !Array.isArray(userAnswer.answer)) {
            const userAnswerForItem = userAnswer.answer[item.itemText];
            const correctAnswer = item.correctHeading || item.correctAnswer;
            if (userAnswerForItem === correctAnswer) {
              correctAnswers++;
            }
          }
        });
      } else {
        // For single questions, count normally
        totalQuestions++;
        const isCorrect = userAnswer ? isAnswerCorrect(question, userAnswer) : false;
        if (isCorrect) {
          correctAnswers++;
        }
      }

      questionResults.push({
        question,
        userAnswer,
        isCorrect: userAnswer ? isAnswerCorrect(question, userAnswer) : false,
      });
    });

    const answeredCount = testState.userAnswers.size;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const bandScore = calculateIeltsBandScore(correctAnswers, totalQuestions);

    return {
      totalQuestions,
      answeredCount,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      unansweredQuestions: totalQuestions - answeredCount,
      score,
      bandScore,
      questionResults,
    };
  }, [testState.userAnswers, getAllQuestions]);

  // Check if user answer is correct for the new API format
  const isAnswerCorrect = (question: IeltsQuestion, userAnswer: UserAnswer): boolean => {
    if (!question.correctAnswer) return false;
    
    const correctAnswer = question.correctAnswer.toLowerCase().trim();
    
    if (question.questionType === 'MATCHING_HEADINGS') {
      // For matching headings, check if all items are correctly matched
      if (typeof userAnswer.answer === 'object' && !Array.isArray(userAnswer.answer)) {
        const userMapping = userAnswer.answer as { [key: string]: string };
        return question.items?.every(item => 
          userMapping[item.itemText] === item.correctHeading
        ) || false;
      }
      return false;
    }
    
    if (question.questionType === 'MATCH_SENTENCE_ENDINGS') {
      // For match sentence endings, check if all items are correctly matched
      if (typeof userAnswer.answer === 'object' && !Array.isArray(userAnswer.answer)) {
        const userMapping = userAnswer.answer as { [key: string]: string };
        return question.items?.every(item => 
          userMapping[item.itemText] === item.correctAnswer
        ) || false;
      }
      return false;
    }
    
    if (question.questionType === 'MATCHING_FEATURES') {
      // For matching features, check if all items are correctly matched
      if (typeof userAnswer.answer === 'object' && !Array.isArray(userAnswer.answer)) {
        const userMapping = userAnswer.answer as { [key: string]: string };
        return question.items?.every(item => 
          userMapping[item.itemText] === item.correctAnswer
        ) || false;
      }
      return false;
    }
    
    // For all other question types including PARAGRAPH_MATCHING, IDENTIFYING_INFORMATION, IDENTIFYING_WRITERS_VIEWS
    const userAnswerText = Array.isArray(userAnswer.answer) 
      ? userAnswer.answer[0]?.toLowerCase().trim() 
      : String(userAnswer.answer).toLowerCase().trim();
    
    return userAnswerText === correctAnswer;
  };

  // Calculate IELTS band score based on correct answers out of 40
  const calculateIeltsBandScore = (correct: number, total: number): number => {
    if (total === 0) return 0;
    
    // IELTS Reading band scores are typically based on raw scores out of 40
    // This is the standard IELTS Reading band score conversion
    if (correct >= 39) return 9.0;      // 39-40/40
    if (correct >= 37) return 8.5;      // 37-38/40  
    if (correct >= 35) return 8.0;      // 35-36/40
    if (correct >= 32) return 7.5;      // 32-34/40
    if (correct >= 30) return 7.0;      // 30-31/40
    if (correct >= 27) return 6.5;      // 27-29/40
    if (correct >= 23) return 6.0;      // 23-26/40
    if (correct >= 19) return 5.5;      // 19-22/40
    if (correct >= 15) return 5.0;      // 15-18/40
    if (correct >= 11) return 4.5;      // 11-14/40
    if (correct >= 8) return 4.0;       // 8-10/40
    if (correct >= 5) return 3.5;       // 5-7/40
    if (correct >= 3) return 3.0;       // 3-4/40
    if (correct >= 2) return 2.5;       // 2/40
    if (correct >= 1) return 2.0;       // 1/40
    return 1.0;                         // 0/40
  };

  const handleAnswerChange = (questionNumber: number, answer: string | string[] | { [key: string]: string }) => {
    setTestState(prev => {
      const newAnswers = new Map(prev.userAnswers);
      newAnswers.set(questionNumber, { questionNumber, answer });
      return { ...prev, userAnswers: newAnswers };
    });
    
    setSnackbarMessage('Answer saved');
  };

  const handleMatchingAnswerChange = (answers: { [key: string]: string }) => {
    if (!currentQuestion) return;
    
    // Store the main question answer first and separately from sub-questions
    setTestState(prev => {
      const newAnswers = new Map(prev.userAnswers);
      
      // Store main question answer - this is what the dropdown component needs
      newAnswers.set(currentQuestion.questionNumber, { 
        questionNumber: currentQuestion.questionNumber, 
        answer: answers 
      });
      
      // Track individual sub-question answers for progress tracking only
      // These use different question numbers so they don't interfere
      if (currentQuestion.items) {
        currentQuestion.items.forEach((item, index) => {
          const subQuestionNumber = currentQuestion.questionNumber + index;
          const itemAnswer = answers[item.itemText];
          
          // Only store sub-question if it's not the main question number
          if (subQuestionNumber !== currentQuestion.questionNumber) {
            if (itemAnswer) {
              newAnswers.set(subQuestionNumber, { 
                questionNumber: subQuestionNumber, 
                answer: itemAnswer,
                isSubQuestion: true,
                parentQuestionNumber: currentQuestion.questionNumber
              });
            } else {
              newAnswers.delete(subQuestionNumber);
            }
          }
        });
      }
      
      return { ...prev, userAnswers: newAnswers };
    });
    
    setSnackbarMessage('Answer saved');
  };

  const handleNavigateToQuestion = (sectionIndex: number, passageIndex: number, questionIndex: number) => {
    setTestState(prev => ({
      ...prev,
      currentSectionIndex: sectionIndex,
      currentPassageIndex: passageIndex,
      currentQuestionIndex: questionIndex,
    }));
  };

  const navigateToQuestion = (direction: 'next' | 'prev') => {
    const allQuestions = getAllQuestions();
    if (allQuestions.length === 0 || !currentQuestion) return;
    
    const currentQuestionGlobalIndex = allQuestions.findIndex(q => q.questionNumber === currentQuestion?.questionNumber);
    
    let newGlobalIndex;
    if (direction === 'next') {
      newGlobalIndex = Math.min(currentQuestionGlobalIndex + 1, allQuestions.length - 1);
    } else {
      newGlobalIndex = Math.max(currentQuestionGlobalIndex - 1, 0);
    }
    
    const targetQuestion = allQuestions[newGlobalIndex];
    if (!targetQuestion) return;
    
    // Find the section, passage, and question indices for the target question
    let targetSectionIndex = 0;
    let targetPassageIndex = 0;
    let targetQuestionIndex = 0;
    
    // Add safety checks for the nested loops
    if (!testData.sections) return;
    
    for (let sIndex = 0; sIndex < testData.sections.length; sIndex++) {
      const section = testData.sections[sIndex];
      if (!section?.passages) continue;
      
      for (let pIndex = 0; pIndex < section.passages.length; pIndex++) {
        const passage = section.passages[pIndex];
        if (!passage?.questions) continue;
        
        for (let qIndex = 0; qIndex < passage.questions.length; qIndex++) {
          const question = passage.questions[qIndex];
          if (question?.questionNumber === targetQuestion.questionNumber) {
            targetSectionIndex = sIndex;
            targetPassageIndex = pIndex;
            targetQuestionIndex = qIndex;
            break;
          }
        }
      }
    }
    
    setTestState(prev => ({
      ...prev,
      currentSectionIndex: targetSectionIndex,
      currentPassageIndex: targetPassageIndex,
      currentQuestionIndex: targetQuestionIndex,
    }));
  };

  const isFirstQuestion = () => {
    const allQuestions = getAllQuestions();
    return currentQuestion?.questionNumber === allQuestions[0]?.questionNumber;
  };

  const handleSubmit = () => {
    const results = calculateResults();
    const answersArray = Array.from(testState.userAnswers.values());
    
    // Navigate to feedback page with results
    navigate('/ielts/reading/feedback', { 
      state: { 
        testResults: results,
        testData: testData,
        userAnswers: testState.userAnswers
      } 
    });
    
    // Call original onSubmit if provided
    onSubmit(answersArray);
    setShowSubmitDialog(false);
  };

  const handleTimeUp = () => {
    setShowTimeUpDialog(true);
    // Auto-submit after a short delay
    setTimeout(() => {
      handleSubmit();
    }, 3000);
  };

  const confirmRefreshTest = async () => {
    setRefreshLoading(true);
    
    try {
      // Generate a random test number between 1 and 20 for reading tests
      const randomTestNumber = Math.floor(Math.random() * 20) + 1;
      
      // Navigate back to reading home with a flag to load a new test
      navigate('/ielts/reading', { 
        state: { 
          refreshTest: true,
          testNumber: randomTestNumber
        },
        replace: true
      });
      
    } catch (error) {
      console.error('Error refreshing reading test:', error);
      alert('Failed to load new test. Please try again.');
    } finally {
      setRefreshLoading(false);
    }
  };

  const isLastQuestion = () => {
    const allQuestions = getAllQuestions();
    return currentQuestion?.questionNumber === allQuestions[allQuestions.length - 1]?.questionNumber;
  };

  const renderCurrentQuestion = () => {
    if (!currentQuestion) return null;

    const userAnswer = testState.userAnswers.get(currentQuestion.questionNumber);
    
    // Debug logging to help identify the issue
    logger.log('Current question type:', currentQuestion.questionType);
    logger.log('Question type length:', currentQuestion.questionType.length);
    logger.log('Question type encoded:', JSON.stringify(currentQuestion.questionType));

    switch (currentQuestion.questionType) {
      case 'MULTIPLE_CHOICE':
        const selectedAnswer = userAnswer && Array.isArray(userAnswer.answer) 
          ? userAnswer.answer[0] || '' 
          : userAnswer?.answer || '';
        return (
          <MultipleChoiceQuestion
            question={currentQuestion}
            selectedAnswer={selectedAnswer as string}
            onAnswerChange={(answer: string) => handleAnswerChange(currentQuestion.questionNumber, answer)}
          />
        );
      
      case 'TRUE_FALSE_NOT_GIVEN':
        const tfngAnswer = userAnswer && Array.isArray(userAnswer.answer) 
          ? userAnswer.answer[0] || '' 
          : userAnswer?.answer || '';
        return (
          <TrueFalseNotGivenQuestion
            question={currentQuestion}
            selectedAnswer={tfngAnswer as string}
            onAnswerChange={(answer: string) => handleAnswerChange(currentQuestion.questionNumber, answer)}
          />
        );
      
      case 'SENTENCE_COMPLETION':
      case 'SHORT_ANSWER':
        const textAnswer = userAnswer && Array.isArray(userAnswer.answer) 
          ? userAnswer.answer[0] || '' 
          : userAnswer?.answer || '';
        return (
          <SentenceCompletionQuestion
            question={currentQuestion}
            selectedAnswer={textAnswer as string}
            onAnswerChange={(answer: string) => handleAnswerChange(currentQuestion.questionNumber, answer)}
          />
        );
      
      case 'MATCHING_HEADINGS':
        const matchingAnswers = userAnswer?.answer && typeof userAnswer.answer === 'object' && !Array.isArray(userAnswer.answer)
          ? userAnswer.answer as { [key: string]: string }
          : {};
        
        return (
          <MatchingHeadingsQuestion
            question={currentQuestion}
            selectedAnswers={matchingAnswers}
            onAnswerChange={handleMatchingAnswerChange}
          />
        );
      
      case 'PARAGRAPH_MATCHING':
        const paragraphAnswer = userAnswer && Array.isArray(userAnswer.answer) 
          ? userAnswer.answer[0] || '' 
          : userAnswer?.answer || '';
        return (
          <ParagraphMatchingQuestion
            question={currentQuestion}
            selectedAnswer={paragraphAnswer as string}
            onAnswerChange={(answer: string) => handleAnswerChange(currentQuestion.questionNumber, answer)}
          />
        );
      
      case 'MATCH_SENTENCE_ENDINGS':
        const sentenceMatchingAnswers = userAnswer?.answer && typeof userAnswer.answer === 'object' && !Array.isArray(userAnswer.answer)
          ? userAnswer.answer as { [key: string]: string }
          : {};
        
        return (
          <MatchSentenceEndingsQuestion
            question={currentQuestion}
            selectedAnswers={sentenceMatchingAnswers}
            onAnswerChange={handleMatchingAnswerChange}
          />
        );
      
      case 'IDENTIFYING_WRITERS_VIEWS':
        const writersViewAnswer = userAnswer && Array.isArray(userAnswer.answer) 
          ? userAnswer.answer[0] || '' 
          : userAnswer?.answer || '';
        return (
          <IdentifyingWritersViewsQuestion
            question={currentQuestion}
            selectedAnswer={writersViewAnswer as string}
            onAnswerChange={(answer: string) => handleAnswerChange(currentQuestion.questionNumber, answer)}
          />
        );
      
      case 'IDENTIFYING_INFORMATION':
        const identifyingInfoAnswer = userAnswer && Array.isArray(userAnswer.answer) 
          ? userAnswer.answer[0] || '' 
          : userAnswer?.answer || '';
        return (
          <IdentifyingInformationQuestion
            question={currentQuestion}
            selectedAnswer={identifyingInfoAnswer as string}
            onAnswerChange={(answer: string) => handleAnswerChange(currentQuestion.questionNumber, answer)}
          />
        );
      
      case 'MATCHING_FEATURES':
        const matchingFeaturesAnswers = userAnswer?.answer && typeof userAnswer.answer === 'object' && !Array.isArray(userAnswer.answer)
          ? userAnswer.answer as { [key: string]: string }
          : {};
        
        return (
          <MatchingFeaturesQuestion
            question={currentQuestion}
            selectedAnswers={matchingFeaturesAnswers}
            onAnswerChange={handleMatchingAnswerChange}
          />
        );
      
      default:
        return (
          <Alert severity="info">
            Question type "{currentQuestion.questionType}" is not yet implemented.
          </Alert>
        );
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', position: 'relative' }}>
      {/* Left Sidebar Progress Indicator */}
      <ProgressIndicator
        currentSectionIndex={testState.currentSectionIndex}
        currentPassageIndex={testState.currentPassageIndex}
        currentQuestionIndex={testState.currentQuestionIndex}
        totalSections={testData.sections.length}
        totalPassagesInSection={currentSection?.passages.length || 0}
        totalQuestionsInPassage={currentPassage?.questions.length || 0}
        answeredQuestions={getAnsweredCount()}
        totalQuestions={getTotalQuestions()}
        userAnswers={testState.userAnswers}
        currentQuestionNumber={currentQuestion?.questionNumber}
        onNavigateToQuestion={handleNavigateToQuestion}
        testData={testData}
      />

      {/* Compact Timer positioned below Progress Indicator */}
      <Box
        sx={{
          position: 'fixed',
          left: 16,
          top: 708, // Position below the progress indicator (660 + 32 + 16 for spacing)
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            width: 220,
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Clock size={18} color="#6b7280" />
          <Typography
            variant="body2"
            fontWeight="bold"
            sx={{
              color: '#374151',
              fontFamily: 'monospace',
            }}
          >
            {(() => {
              const minutes = Math.floor(testState.timeRemaining / 60);
              const seconds = testState.timeRemaining % 60;
              return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            })()}
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area - Fixed passage width with flexible questions area */}
      <Container maxWidth={false} sx={{ py: 4, px: 0, ml: '260px', width: 'calc(100vw - 260px)' }}>
        <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
          {/* Reading Passage - Fixed 45% width of total screen */}
          <Box sx={{ 
            width: '45vw', 
            minWidth: '500px',
            maxWidth: '45vw',
            flexShrink: 0,
            px: 2
          }}>
            {currentPassage && (
              <ReadingPassage
                passage={currentPassage}
                sectionNumber={testState.currentSectionIndex + 1}
              />
            )}
          </Box>

          {/* Question Area - Takes remaining space */}
          <Box sx={{ 
            flex: 1, 
            minWidth: 0,
            px: 2,
            maxWidth: 'calc(43vw - 200px)' // Remaining space after sidebar and passage
          }}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${testState.currentSectionIndex}-${testState.currentPassageIndex}-${testState.currentQuestionIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderCurrentQuestion()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<ChevronLeft size={20} />}
                  onClick={() => navigateToQuestion('prev')}
                  disabled={isFirstQuestion()}
                  sx={{ minWidth: 140 }}
                >
                  Previous
                </Button>

                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  {isLastQuestion() && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<Send size={20} />}
                      onClick={() => setShowSubmitDialog(true)}
                      sx={{ minWidth: 160, fontWeight: 'bold' }}
                    >
                      Submit Test
                    </Button>
                  )}
                </Box>

                <Button
                  variant="contained"
                  endIcon={<ChevronRight size={20} />}
                  onClick={() => navigateToQuestion('next')}
                  disabled={isLastQuestion()}
                  sx={{ minWidth: 140 }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Submit Confirmation Dialog */}
      <Dialog 
        open={showSubmitDialog} 
        onClose={() => setShowSubmitDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            minHeight: '400px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            gap: 2,
            textAlign: 'center'
          }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              <Send size={40} color="white" />
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
              Ready to Submit?
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', maxWidth: '300px' }}>
              Let's review your progress before submitting your IELTS Reading test
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ px: 4, py: 3 }}>
          {/* Progress Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <Box sx={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Typography variant="h3" fontWeight="bold" sx={{ color: '#10b981' }}>
                {getAnsweredCount()}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Answered
              </Typography>
            </Box>
            
            <Box sx={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>
                {getTotalQuestions()}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Total Questions
              </Typography>
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Completion Progress
              </Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>
                {Math.round((getAnsweredCount() / getTotalQuestions()) * 100)}%
              </Typography>
            </Box>
            <Box sx={{
              width: '100%',
              height: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <Box sx={{
                width: `${(getAnsweredCount() / getTotalQuestions()) * 100}%`,
                height: '100%',
                backgroundColor: '#10b981',
                borderRadius: 4,
                transition: 'width 0.3s ease'
              }} />
            </Box>
          </Box>

          {/* Warning for unanswered questions */}
          {getAnsweredCount() < getTotalQuestions() && (
            <Box sx={{
              background: 'rgba(255, 152, 0, 0.2)',
              border: '1px solid rgba(255, 152, 0, 0.4)',
              borderRadius: 2,
              p: 2.5,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255, 152, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#ff9800' }}>
                  !
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>
                  {getTotalQuestions() - getAnsweredCount()} Questions Remaining
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  You can still go back and answer them, or submit as is.
                </Typography>
              </Box>
            </Box>
          )}

          {/* Final confirmation text */}
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            p: 2.5,
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
              Once submitted, you cannot change your answers.
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 0.5 }}>
              Are you ready to see your results?
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 4, gap: 2 }}>
          <Button 
            onClick={() => setShowSubmitDialog(false)} 
            variant="outlined"
            size="large"
            sx={{ 
              flex: 1,
              py: 1.5,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: 2,
              '&:hover': {
                borderColor: 'white',
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Back to Test
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            size="large"
            sx={{ 
              flex: 1.5,
              py: 1.5,
              background: 'linear-gradient(45deg, #10b981, #059669)',
              fontWeight: 'bold',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #059669, #047857)',
                boxShadow: '0 6px 25px rgba(16, 185, 129, 0.6)'
              }
            }}
          >
            Submit & View Results
          </Button>
        </DialogActions>
      </Dialog>

      {/* Time Up Dialog */}
      <Dialog open={showTimeUpDialog} disableEscapeKeyDown>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Clock size={24} color="#ef4444" />
          Time's Up!
        </DialogTitle>
        <DialogContent>
          <Typography>
            The allocated time for this test has expired. Your test will be submitted automatically.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={2000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />

      {/* Refresh Test Button */}
      <RefreshTestButton
        testType="reading test"
        isLoading={refreshLoading}
        onRefreshTest={confirmRefreshTest}
      />
    </Box>
  );
};

export default IeltsReadingTest; 