import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2 } from 'lucide-react';

interface ProgressIndicatorProps {
  currentSectionIndex: number;
  currentPassageIndex: number;
  currentQuestionIndex: number;
  totalSections: number;
  totalPassagesInSection: number;
  totalQuestionsInPassage: number;
  answeredQuestions: number;
  totalQuestions: number;
  userAnswers: Map<number, any>;
  currentQuestionNumber?: number;
  onNavigateToQuestion: (sectionIndex: number, passageIndex: number, questionIndex: number) => void;
  testData: any; // Will be properly typed
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  answeredQuestions,
  totalQuestions,
  userAnswers,
  currentQuestionNumber,
  onNavigateToQuestion,
  testData,
}) => {
  // Generate array of individual question numbers with their location info
  // For MATCHING_HEADINGS, expand into individual sub-questions
  const questionNumbers: Array<{
    questionNumber: number;
    sectionIndex: number;
    passageIndex: number;
    questionIndex: number;
    isSubQuestion?: boolean;
    parentQuestionNumber?: number;
  }> = [];

  testData.sections.forEach((section: any, sectionIndex: number) => {
    section.passages.forEach((passage: any, passageIndex: number) => {
      passage.questions.forEach((question: any, questionIndex: number) => {
        // Handle multi-item question types that need to be expanded into individual question numbers
        const multiItemTypes = ['MATCHING_HEADINGS', 'MATCH_SENTENCE_ENDINGS', 'MATCHING_FEATURES'];
        
        if (multiItemTypes.includes(question.questionType) && question.items?.length > 0) {
          // For multi-item questions, create individual entries for each item
          question.items.forEach((item: any, itemIndex: number) => {
            questionNumbers.push({
              questionNumber: question.questionNumber + itemIndex,
              sectionIndex,
              passageIndex,
              questionIndex,
              isSubQuestion: itemIndex > 0,
              parentQuestionNumber: question.questionNumber,
            });
          });
        } else {
          // For all other question types, single entry
          questionNumbers.push({
            questionNumber: question.questionNumber,
            sectionIndex,
            passageIndex,
            questionIndex,
          });
        }
      });
    });
  });

  // Sort by question number to ensure proper order
  questionNumbers.sort((a, b) => a.questionNumber - b.questionNumber);

  const getCircleColor = (questionNumber: number) => {
    const isAnswered = userAnswers.has(questionNumber);
    const isCurrent = questionNumber === currentQuestionNumber;
    
    if (isCurrent) {
      return '#2563eb'; // Blue for current question
    } else if (isAnswered) {
      return '#10b981'; // Green for answered
    } else {
      return '#9ca3af'; // Gray for unanswered
    }
  };

  const getTextColor = (questionNumber: number) => {
    const isCurrent = questionNumber === currentQuestionNumber;
    const isAnswered = userAnswers.has(questionNumber);
    
    if (isCurrent || isAnswered) {
      return 'white';
    } else {
      return '#374151';
    }
  };

  const handleQuestionClick = (questionInfo: {
    questionNumber: number;
    sectionIndex: number;
    passageIndex: number;
    questionIndex: number;
    isSubQuestion?: boolean;
  }) => {
    onNavigateToQuestion(questionInfo.sectionIndex, questionInfo.passageIndex, questionInfo.questionIndex);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        elevation={2}
        sx={{
          position: 'fixed',
          left: 16,
          top: 32,
          height: 660, // Increased by 10% (600 * 1.1 = 660)
          width: 220,
          zIndex: 1000,
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            p: 2,
            borderRadius: '12px 12px 0 0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <BookOpen size={18} />
            <Typography variant="subtitle1" fontWeight="bold">
              IELTS Reading
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CheckCircle2 size={14} />
            <Typography variant="body2" sx={{ color: 'white', opacity: 1 }}>
              {answeredQuestions} / {totalQuestions} Completed
            </Typography>
          </Box>
          
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            sx={{ textAlign: 'center', color: 'white' }}
          >
            {Math.round((answeredQuestions / totalQuestions) * 100)}%
          </Typography>
        </Box>

        {/* Question Numbers Grid */}
        <CardContent 
          sx={{ 
            flex: 1, 
            p: 2,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f5f9',
              borderRadius: '2px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#cbd5e1',
              borderRadius: '2px',
              '&:hover': {
                backgroundColor: '#94a3b8',
              },
            },
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, fontWeight: 'medium', display: 'block' }}>
            Questions
          </Typography>
          
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 0.8,
              mb: 2,
            }}
          >
            {questionNumbers.map((questionInfo, index) => (
              <motion.div
                key={`${questionInfo.questionNumber}-${questionInfo.isSubQuestion ? 'sub' : 'main'}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.008, duration: 0.15 }}
              >
                <Box
                  onClick={() => handleQuestionClick(questionInfo)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: getCircleColor(questionInfo.questionNumber),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: questionInfo.questionNumber === currentQuestionNumber ? '3px solid #1d4ed8' : '2px solid transparent',
                    transform: questionInfo.questionNumber === currentQuestionNumber ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: questionInfo.questionNumber === currentQuestionNumber 
                      ? '0 4px 12px rgba(37, 99, 235, 0.3)' 
                      : userAnswers.has(questionInfo.questionNumber) 
                        ? '0 2px 8px rgba(16, 185, 129, 0.2)' 
                        : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      transform: 'scale(1.15)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    sx={{
                      color: getTextColor(questionInfo.questionNumber),
                      fontSize: '0.7rem',
                    }}
                  >
                    {questionInfo.questionNumber}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>

          {/* Legend */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium', display: 'block' }}>
              Legend
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    border: '2px solid #1d4ed8',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Current
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Answered
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#9ca3af',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Unanswered
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgressIndicator; 