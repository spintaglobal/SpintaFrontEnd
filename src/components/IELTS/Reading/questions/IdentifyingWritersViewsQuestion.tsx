import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Eye, CheckCircle } from 'lucide-react';
import { IeltsQuestion } from '../../../../types/IeltsTypes';

interface IdentifyingWritersViewsQuestionProps {
  question: IeltsQuestion;
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
}

const IdentifyingWritersViewsQuestion: React.FC<IdentifyingWritersViewsQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
}) => {
  const options = ['YES', 'NO', 'NOT GIVEN'];

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAnswerChange(event.target.value);
  };

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
                icon={<Eye size={14} />}
                label="IDENTIFYING WRITER'S VIEWS"
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Box>
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ lineHeight: 1.6, fontWeight: 500 }}
            >
              {question.questionText}
            </Typography>
          </Box>

          {/* Answer Options */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
              Choose your answer:
            </Typography>
            
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup
                value={selectedAnswer}
                onChange={handleAnswerChange}
                sx={{ gap: 1 }}
              >
                {options.map((option, index) => (
                  <motion.div
                    key={option}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <FormControlLabel
                      value={option}
                      control={
                        <Radio
                          sx={{
                            color: '#d1d5db',
                            '&.Mui-checked': {
                              color: '#2563eb',
                            },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body1"
                            fontWeight={selectedAnswer === option ? 'bold' : 'normal'}
                            color={selectedAnswer === option ? 'primary.main' : 'text.primary'}
                          >
                            {option}
                          </Typography>
                          {selectedAnswer === option && (
                            <CheckCircle size={16} color="#2563eb" />
                          )}
                        </Box>
                      }
                      sx={{
                        margin: 0,
                        p: 2,
                        border: '2px solid',
                        borderColor: selectedAnswer === option ? '#2563eb' : '#e2e8f0',
                        borderRadius: 2,
                        backgroundColor: selectedAnswer === option ? '#eff6ff' : 'white',
                        transition: 'all 0.2s ease',
                        width: '100%',
                        '&:hover': {
                          borderColor: '#2563eb',
                          backgroundColor: '#f8fafc',
                        },
                      }}
                    />
                  </motion.div>
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Guidelines:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '16px' }}>
                <li><strong>YES</strong> - The statement agrees with the author's views</li>
                <li><strong>NO</strong> - The statement contradicts the author's views</li>
                <li><strong>NOT GIVEN</strong> - The author's view on this statement is not expressed in the passage</li>
              </ul>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default IdentifyingWritersViewsQuestion; 