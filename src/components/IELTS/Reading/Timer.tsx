import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  totalMinutes: number;
  onTimeUp: () => void;
  isRunning: boolean;
  isCompact?: boolean;
}

const Timer: React.FC<TimerProps> = ({ totalMinutes, onTimeUp, isRunning, isCompact = false }) => {
  const [timeRemaining, setTimeRemaining] = useState(totalMinutes * 60);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (): string => {
    const percentage = (timeRemaining / (totalMinutes * 60)) * 100;
    if (percentage <= 10) return '#ef4444'; // Red
    if (percentage <= 25) return '#f59e0b'; // Orange
    return '#10b981'; // Green
  };

  const getProgressValue = (): number => {
    return ((totalMinutes * 60 - timeRemaining) / (totalMinutes * 60)) * 100;
  };

  const isLowTime = (): boolean => {
    const percentage = (timeRemaining / (totalMinutes * 60)) * 100;
    return percentage <= 25;
  };

  if (isCompact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          elevation={2}
          sx={{
            width: 220,
            backgroundColor: 'white',
            border: `1px solid ${getTimeColor()}`,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <motion.div
                animate={isLowTime() ? { rotate: [0, -10, 10, -10, 0] } : {}}
                transition={{ duration: 0.5, repeat: isLowTime() ? Infinity : 0, repeatDelay: 2 }}
              >
                {isLowTime() ? (
                  <AlertTriangle size={16} color={getTimeColor()} />
                ) : (
                  <Clock size={16} color={getTimeColor()} />
                )}
              </motion.div>
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{ color: getTimeColor() }}
              >
                Time Remaining
              </Typography>
            </Box>

            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                color: getTimeColor(),
                textAlign: 'center',
                mb: 1,
                fontFamily: 'monospace',
              }}
            >
              {formatTime(timeRemaining)}
            </Typography>

            <LinearProgress
              variant="determinate"
              value={getProgressValue()}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: '#f1f5f9',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getTimeColor(),
                  borderRadius: 3,
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Chip
                label={isRunning ? 'Running' : 'Paused'}
                size="small"
                color={isRunning ? 'success' : 'default'}
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            </Box>

            {isLowTime() && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    mt: 0.5,
                    color: getTimeColor(),
                    fontWeight: 'bold',
                    fontSize: '0.65rem',
                  }}
                >
                  ⚠️ Time is running out!
                </Typography>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      <Card
        elevation={4}
        sx={{
          minWidth: 200,
          backgroundColor: 'white',
          border: `2px solid ${getTimeColor()}`,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <motion.div
              animate={isLowTime() ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: isLowTime() ? Infinity : 0, repeatDelay: 2 }}
            >
              {isLowTime() ? (
                <AlertTriangle size={20} color={getTimeColor()} />
              ) : (
                <Clock size={20} color={getTimeColor()} />
              )}
            </motion.div>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ color: getTimeColor() }}
            >
              Time Remaining
            </Typography>
          </Box>

          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: getTimeColor(),
              textAlign: 'center',
              mb: 2,
              fontFamily: 'monospace',
            }}
          >
            {formatTime(timeRemaining)}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={getProgressValue()}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#f1f5f9',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getTimeColor(),
                borderRadius: 4,
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Chip
              label={isRunning ? 'Running' : 'Paused'}
              size="small"
              color={isRunning ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>

          {isLowTime() && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  mt: 1,
                  color: getTimeColor(),
                  fontWeight: 'bold',
                }}
              >
                ⚠️ Time is running out!
              </Typography>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Timer; 