import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { IeltsPassage } from '../../../types/IeltsTypes';

interface ReadingPassageProps {
  passage: IeltsPassage;
  sectionNumber: number;
}

const ReadingPassage: React.FC<ReadingPassageProps> = ({ passage, sectionNumber }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Function to format text with bold markers and improve paragraph handling
  const formatText = (text: string) => {
    // Clean up the text first - remove headings with ## and stray asterisks
    const cleanText = text
      .replace(/^##\s.*$/gm, '') // Remove lines starting with ##
      .replace(/^\s*\*\s*(?!\*)/gm, '') // Remove single asterisks at start of lines
      .replace(/^\s*\n/gm, '') // Remove empty lines at the start
      .trim();
    
    // Split text by bold markers and create JSX elements
    const parts = cleanText.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** markers and make it bold
        const boldText = part.slice(2, -2);
        return (
          <Typography
            key={index}
            component="div"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.15rem',
              color: '#1e40af',
              mt: index > 0 ? 3 : 0,
              mb: 1.5,
              lineHeight: 1.4,
              letterSpacing: '0.02em',
            }}
          >
            {boldText}
          </Typography>
        );
      }
      
      // Regular text - handle paragraphs properly
      if (part.trim()) {
        // Split by double line breaks to create paragraphs
        const paragraphs = part.split(/\n\s*\n/);
        
        return paragraphs.map((paragraph, paragraphIndex) => {
          if (paragraph.trim()) {
            // Split single line breaks within paragraph
            const lines = paragraph.trim().split('\n');
            
            return (
              <Typography
                key={`${index}-${paragraphIndex}`}
                component="div"
                sx={{
                  mb: 2,
                  lineHeight: 1.8,
                  textAlign: 'justify',
                }}
              >
                {lines.map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    {line.trim()}
                  </React.Fragment>
                ))}
              </Typography>
            );
          }
          return null;
        });
      }
      
      return null;
    }).filter(Boolean); // Remove null values
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        elevation={2}
        sx={{
          position: 'sticky',
          top: 16,
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          maxHeight: '85vh',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BookOpen size={24} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {passage.passageTitle}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 1, color: 'white', fontWeight: 500 }}>
                Section {sectionNumber} • Passage {passage.passageNumber}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<Eye size={14} />}
              label={isExpanded ? 'Expanded' : 'Collapsed'}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' },
              }}
            />
            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{ color: 'white' }}
              size="small"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <AnimatePresence initial={false}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <CardContent
              sx={{
                p: 4,
                maxHeight: 'calc(85vh - 80px)',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#cbd5e1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#94a3b8',
                  },
                },
              }}
            >
              <Box
                sx={{
                  '& > *': {
                    fontSize: '1rem',
                    color: '#374151',
                    fontFamily: '"Inter", "Segoe UI", sans-serif',
                    lineHeight: 1.8,
                  },
                }}
              >
                {formatText(passage.passageText)}
              </Box>
            </CardContent>
          </Collapse>
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default ReadingPassage; 