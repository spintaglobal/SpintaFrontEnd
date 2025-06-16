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
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Target, MapPin, Search } from 'lucide-react';
import { IeltsQuestion } from '../../../../types/IeltsTypes';

interface ParagraphMatchingQuestionProps {
  question: IeltsQuestion;
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
}

const ParagraphMatchingQuestion: React.FC<ParagraphMatchingQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
}) => {
  // Get paragraph options - typically A through H for most IELTS tests
  const getParagraphOptions = () => {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Question Header */}
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
                icon={<Target size={14} />}
                label="PARAGRAPH MATCHING"
                size="small"
                color="warning"
                variant="outlined"
              />
            </Box>
            
            {/* Question Text */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                mb: 3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Search size={20} color="#2563eb" />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mb: 1, fontSize: '0.9rem' }}
                  >
                    Which paragraph contains the following information?
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    sx={{ lineHeight: 1.6, fontWeight: 'medium' }}
                  >
                    {question.questionText}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Instructions */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <MapPin size={16} style={{ display: 'inline', marginRight: 8 }} />
              Select the paragraph that contains the answer:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose the letter (A-H) of the paragraph that best matches the information described above.
            </Typography>
          </Box>

          {/* Answer Selection Grid */}
          <Box sx={{ mb: 4 }}>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup
                value={selectedAnswer}
                onChange={(e) => onAnswerChange(e.target.value)}
                sx={{ gap: 1 }}
              >
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: 2,
                  mb: 3
                }}>
                  {getParagraphOptions().map((option, index) => (
                    <motion.div
                      key={option}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <FormControlLabel
                        value={option}
                        control={<Radio sx={{ display: 'none' }} />}
                        label={
                          <Paper
                            elevation={selectedAnswer === option ? 3 : 1}
                            sx={{
                              p: 2,
                              textAlign: 'center',
                              border: '2px solid',
                              borderColor: selectedAnswer === option ? '#2563eb' : '#e5e7eb',
                              backgroundColor: selectedAnswer === option ? '#eff6ff' : 'white',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              minHeight: 60,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover': {
                                borderColor: '#2563eb',
                                backgroundColor: '#f8fafc',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                              },
                            }}
                          >
                            <Typography
                              variant="h5"
                              fontWeight="bold"
                              color={selectedAnswer === option ? 'primary' : 'text.secondary'}
                            >
                              {option}
                            </Typography>
                          </Paper>
                        }
                        sx={{
                          margin: 0,
                          width: '100%',
                          '& .MuiFormControlLabel-label': {
                            width: '100%',
                          },
                        }}
                      />
                    </motion.div>
                  ))}
                </Box>
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Alternative Dropdown */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Or select from dropdown:
            </Typography>
            <FormControl size="medium" sx={{ minWidth: 250 }}>
              <Select
                value={selectedAnswer}
                onChange={(e) => onAnswerChange(e.target.value)}
                displayEmpty
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: selectedAnswer ? '#2563eb' : '#d1d5db',
                  },
                  '& .MuiSelect-select': {
                    py: 1.5,
                  },
                }}
              >
                <MenuItem value="">
                  <em>Choose a paragraph...</em>
                </MenuItem>
                {getParagraphOptions().map((option) => (
                  <MenuItem key={option} value={option}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {option}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Paragraph {option}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Tips Section */}
          <Box sx={{ mt: 4, p: 3, backgroundColor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd' }}>
            <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>
              💡 Tips for Paragraph Matching:
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <ul style={{ margin: '8px 0', paddingLeft: '16px' }}>
                <li><strong>Read the question carefully</strong> - understand what specific information you need to find</li>
                <li><strong>Scan the passage</strong> - look for keywords, names, dates, or concepts mentioned in the question</li>
                <li><strong>Look for synonyms</strong> - the passage may use different words with the same meaning</li>
                <li><strong>Consider the context</strong> - make sure the paragraph actually contains the information described</li>
              </ul>
            </Typography>
          </Box>

          {/* Current Selection Display */}
          {selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#dcfce7', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                <Typography variant="body2" color="success.dark" fontWeight="medium">
                  ✓ Selected: Paragraph {selectedAnswer}
                </Typography>
              </Box>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ParagraphMatchingQuestion; 