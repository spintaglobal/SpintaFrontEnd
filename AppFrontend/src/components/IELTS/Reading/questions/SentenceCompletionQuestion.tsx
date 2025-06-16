import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Edit3 } from 'lucide-react';
import { IeltsQuestion } from '../../../../types/IeltsTypes';

interface SentenceCompletionQuestionProps {
  question: IeltsQuestion;
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
}

const SentenceCompletionQuestion: React.FC<SentenceCompletionQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
}) => {
  const maxWords = question.maxWords || 3;
  const wordCount = selectedAnswer.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isOverLimit = wordCount > maxWords;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography
                variant="body2"
                color="primary"
                fontWeight="bold"
              >
                Question {question.questionNumber}
              </Typography>
              <Chip
                icon={<Edit3 size={14} />}
                label={`Max ${maxWords} word${maxWords !== 1 ? 's' : ''}`}
                size="small"
                color="info"
                variant="outlined"
              />
            </Box>
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ lineHeight: 1.5 }}
            >
              {question.questionText}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              value={selectedAnswer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1rem',
                  '& fieldset': {
                    borderColor: isOverLimit ? '#ef4444' : '#d1d5db',
                  },
                  '&:hover fieldset': {
                    borderColor: isOverLimit ? '#ef4444' : '#9ca3af',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isOverLimit ? '#ef4444' : '#2563eb',
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Enter your answer using words from the passage
            </Typography>
            <Chip
              label={`${wordCount}/${maxWords} words`}
              size="small"
              color={isOverLimit ? 'error' : wordCount === 0 ? 'default' : 'success'}
              variant="outlined"
            />
          </Box>

          {isOverLimit && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Your answer exceeds the {maxWords}-word limit. Please revise your response.
            </Alert>
          )}

          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Tips:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '16px' }}>
                <li>Use words directly from the passage</li>
                <li>Copy the spelling exactly as it appears</li>
                <li>Don't change the form of the words</li>
                <li>Hyphenated words count as one word</li>
              </ul>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SentenceCompletionQuestion; 