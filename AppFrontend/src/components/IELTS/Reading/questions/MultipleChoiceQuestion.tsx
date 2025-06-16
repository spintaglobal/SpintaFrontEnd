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
} from '@mui/material';
import { motion } from 'framer-motion';
import { IeltsQuestion } from '../../../../types/IeltsTypes';

interface MultipleChoiceQuestionProps {
  question: IeltsQuestion;
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              color="primary"
              fontWeight="bold"
              sx={{ mb: 1 }}
            >
              Question {question.questionNumber}
            </Typography>
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
              onChange={(e) => onAnswerChange(e.target.value)}
            >
              {question.options?.map((option, index) => {
                const [key, value] = Object.entries(option)[0];
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <FormControlLabel
                      value={key}
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
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1,
                            py: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="primary"
                            sx={{ minWidth: 20 }}
                          >
                            {key}.
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ lineHeight: 1.6 }}
                          >
                            {value}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        margin: 0,
                        width: '100%',
                        borderRadius: 2,
                        border: '1px solid transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f8fafc',
                          borderColor: '#e2e8f0',
                        },
                        ...(selectedAnswer === key && {
                          backgroundColor: '#eff6ff',
                          borderColor: '#2563eb',
                        }),
                      }}
                    />
                  </motion.div>
                );
              })}
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MultipleChoiceQuestion; 