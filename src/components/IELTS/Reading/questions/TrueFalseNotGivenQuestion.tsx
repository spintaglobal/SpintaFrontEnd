import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';
import { IeltsQuestion } from '../../../../types/IeltsTypes';

interface TrueFalseNotGivenQuestionProps {
  question: IeltsQuestion;
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
}

const TrueFalseNotGivenQuestion: React.FC<TrueFalseNotGivenQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
}) => {
  const options = [
    {
      value: 'TRUE',
      label: 'True',
      icon: <Check size={16} />,
      color: '#10b981',
      bgColor: '#ecfdf5',
    },
    {
      value: 'FALSE',
      label: 'False',
      icon: <X size={16} />,
      color: '#ef4444',
      bgColor: '#fef2f2',
    },
    {
      value: 'NOT GIVEN',
      label: 'Not Given',
      icon: <Minus size={16} />,
      color: '#f59e0b',
      bgColor: '#fffbeb',
    },
  ];

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
                label="TRUE / FALSE / NOT GIVEN"
                size="small"
                color="secondary"
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

          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={selectedAnswer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAnswerChange(e.target.value)}
              sx={{ gap: 1 }}
            >
              {options.map((option, index) => (
                <motion.div
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <FormControlLabel
                    value={option.value}
                    control={
                      <Radio
                        sx={{
                          color: '#d1d5db',
                          '&.Mui-checked': {
                            color: option.color,
                          },
                        }}
                      />
                    }
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          py: 2,
                          px: 2,
                          flex: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: selectedAnswer === option.value ? option.bgColor : '#f8fafc',
                            color: selectedAnswer === option.value ? option.color : '#6b7280',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {option.icon}
                        </Box>
                        <Typography
                          variant="body1"
                          fontWeight={selectedAnswer === option.value ? 'bold' : 'normal'}
                          sx={{
                            color: selectedAnswer === option.value ? option.color : 'text.primary',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {option.label}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      margin: 0,
                      width: '100%',
                      borderRadius: 2,
                      border: '2px solid transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: option.bgColor,
                        borderColor: option.color + '40',
                      },
                      ...(selectedAnswer === option.value && {
                        backgroundColor: option.bgColor,
                        borderColor: option.color,
                      }),
                    }}
                  />
                </motion.div>
              ))}
            </RadioGroup>
          </FormControl>

          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Tip:</strong> Choose TRUE if the statement agrees with the passage, 
              FALSE if it contradicts the passage, or NOT GIVEN if the information is not mentioned.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TrueFalseNotGivenQuestion; 