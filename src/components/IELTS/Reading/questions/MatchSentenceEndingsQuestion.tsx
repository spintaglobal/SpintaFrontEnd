import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link2, ArrowRight } from 'lucide-react';
import { IeltsQuestion } from '../../../../types/IeltsTypes';

interface MatchSentenceEndingsQuestionProps {
  question: IeltsQuestion;
  selectedAnswers: { [key: string]: string };
  onAnswerChange: (answers: { [key: string]: string }) => void;
}

const MatchSentenceEndingsQuestion: React.FC<MatchSentenceEndingsQuestionProps> = ({
  question,
  selectedAnswers,
  onAnswerChange,
}) => {
  const handleSelectionChange = (stemText: string, ending: string) => {
    const newAnswers = { ...selectedAnswers };
    if (ending === '') {
      delete newAnswers[stemText];
    } else {
      newAnswers[stemText] = ending;
    }
    onAnswerChange(newAnswers);
  };

  const getUsedEndings = () => {
    return Object.values(selectedAnswers);
  };

  const isEndingUsed = (ending: string) => {
    return getUsedEndings().includes(ending);
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
                Questions {question.questionNumber}-{question.questionNumber + (question.items?.length || 1) - 1}
              </Typography>
              <Chip
                icon={<Link2 size={14} />}
                label="MATCH SENTENCE ENDINGS"
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

          {/* Available Endings */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Available Endings:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {question.endings?.map((ending: { [key: string]: string }, index: number) => {
                const endingKey = Object.keys(ending)[0];
                const endingText = ending[endingKey];
                return (
                  <motion.div
                    key={endingKey}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: isEndingUsed(endingKey) ? '#2563eb' : '#e2e8f0',
                        borderRadius: 2,
                        backgroundColor: isEndingUsed(endingKey) ? '#eff6ff' : 'white',
                        opacity: isEndingUsed(endingKey) ? 0.7 : 1,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold" color="primary" display="inline">
                        {endingKey}.
                      </Typography>
                      <Typography variant="body2" display="inline" sx={{ ml: 1 }}>
                        {endingText}
                      </Typography>
                    </Box>
                  </motion.div>
                );
              })}
            </Box>
          </Box>

          {/* Sentence Stems */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Complete each sentence with the correct ending:
            </Typography>
            
            {question.items?.map((item: { itemText: string; correctAnswer?: string }, index: number) => (
              <motion.div
                key={item.itemText}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    mb: 2,
                    border: '2px solid',
                    borderColor: selectedAnswers[item.itemText] ? '#2563eb' : '#e2e8f0',
                    borderRadius: 2,
                    backgroundColor: selectedAnswers[item.itemText] ? '#eff6ff' : 'white',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="primary"
                    sx={{ minWidth: 30 }}
                  >
                    {question.questionNumber + index}.
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{ flex: 1, minWidth: 200 }}
                  >
                    {item.itemText}
                  </Typography>
                  
                  <ArrowRight size={20} color="#6b7280" />
                  
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select
                      value={selectedAnswers[item.itemText] || ''}
                      onChange={(e) => handleSelectionChange(item.itemText, e.target.value)}
                      displayEmpty
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: selectedAnswers[item.itemText] ? '#2563eb' : '#d1d5db',
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Select...</em>
                      </MenuItem>
                      {question.endings?.map((ending: { [key: string]: string }) => {
                        const endingKey = Object.keys(ending)[0];
                        const isUsed = isEndingUsed(endingKey) && selectedAnswers[item.itemText] !== endingKey;
                        return (
                          <MenuItem
                            key={endingKey}
                            value={endingKey}
                            disabled={isUsed}
                            sx={{
                              opacity: isUsed ? 0.5 : 1,
                              fontSize: '0.875rem',
                            }}
                          >
                            {endingKey}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>
              </motion.div>
            ))}
          </Box>

          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Tips:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '16px' }}>
                <li>Read all the sentence endings before attempting to match them</li>
                <li>Look for grammatical clues that help identify the correct ending</li>
                <li>Each ending can only be used once</li>
                <li>Consider the logical flow and meaning of the complete sentence</li>
              </ul>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MatchSentenceEndingsQuestion; 