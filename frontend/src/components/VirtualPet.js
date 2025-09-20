import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Fade,
  Paper
} from '@mui/material';
import {
  Pets as PetIcon,
  Bedtime as SleepIcon,
  Restaurant as EatIcon,
  LightbulbOutlined as TipIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  TrendingUp as ProgressIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const VirtualPet = ({ socket, sleepData, currentTime }) => {
  const [petState, setPetState] = useState({
    mood: 'happy', // happy, sleepy, concerned, excited
    level: 5,
    experience: 65,
    name: 'Sleepy'
  });
  
  const [showReminders, setShowReminders] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Pet moods and their characteristics
  const petMoods = {
    happy: {
      emoji: '😊',
      color: '#4CAF50',
      message: "You're doing great with your sleep routine!",
      animation: 'bounce'
    },
    sleepy: {
      emoji: '😴',
      color: '#9C27B0',
      message: "Time to think about winding down for better sleep.",
      animation: 'pulse'
    },
    concerned: {
      emoji: '😟',
      color: '#FF9800',
      message: "I've noticed some patterns we should work on.",
      animation: 'shake'
    },
    excited: {
      emoji: '🎉',
      color: '#2196F3',
      message: "Amazing progress! Keep up the good work!",
      animation: 'bounce'
    }
  };

  // Calculate optimal sleep and meal times
  const getOptimalTimes = useCallback(() => {
    const now = new Date(currentTime || Date.now());
    const bedtime = new Date(now);
    bedtime.setHours(22, 30, 0, 0); // 10:30 PM default
    
    const wakeTime = new Date(bedtime);
    wakeTime.setHours(wakeTime.getHours() + 8); // 8 hours later
    
    const dinnerTime = new Date(bedtime);
    dinnerTime.setHours(dinnerTime.getHours() - 3); // 3 hours before bed
    
    return { bedtime, wakeTime, dinnerTime };
  }, [currentTime]);

  // Update pet state based on sleep data and time
  useEffect(() => {
    const updatePetState = () => {
      const now = new Date();
      const hour = now.getHours();
      const { dinnerTime } = getOptimalTimes();
      
      let newMood = 'happy';
      let newRecommendations = [];

      // Check if it's close to bedtime
      if (hour >= 21 || hour <= 1) {
        newMood = 'sleepy';
        if (hour >= 22) {
          newRecommendations.push({
            type: 'sleep',
            message: "It's getting late! Consider preparing for bed.",
            action: 'Set sleep reminder'
          });
        }
      }

      // Check if it's meal time
      if (Math.abs(now - dinnerTime) < 1800000) { // Within 30 minutes
        newRecommendations.push({
          type: 'eat',
          message: "Don't forget to have dinner 3 hours before bed for better sleep.",
          action: 'Set meal reminder'
        });
      }

      // Analyze sleep data if available
      if (sleepData) {
        if (sleepData.quality < 0.6) {
          newMood = 'concerned';
          newRecommendations.push({
            type: 'sleep_quality',
            message: "Your sleep quality could be improved. Try these tips!",
            action: 'View sleep tips'
          });
        } else if (sleepData.quality > 0.8) {
          newMood = 'excited';
        }
      }

      setPetState(prev => ({ ...prev, mood: newMood }));
      setRecommendations(newRecommendations);
    };

    updatePetState();
    const interval = setInterval(updatePetState, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [sleepData, currentTime, getOptimalTimes]);

  const handleReminderAction = (recommendation) => {
    // Here you could integrate with device notifications or calendar
    if (socket) {
      socket.emit('pet_reminder', {
        type: recommendation.type,
        message: recommendation.message,
        timestamp: Date.now()
      });
    }
  };

  const getSleepRecommendations = () => [
    "Keep your bedroom cool (60-67°F) for optimal sleep",
    "Avoid screens 1 hour before bedtime",
    "Try deep breathing or meditation before sleep",
    "Keep a consistent sleep schedule, even on weekends",
    "Avoid caffeine 6 hours before bedtime",
    "Get morning sunlight to regulate your circadian rhythm"
  ];

  const getCurrentRecommendation = () => {
    const tips = getSleepRecommendations();
    const timeBasedIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % tips.length;
    return tips[timeBasedIndex];
  };

  const petMoodData = petMoods[petState.mood];
  const { wakeTime, dinnerTime } = getOptimalTimes();

  return (
    <>
      <Card sx={{ overflow: 'visible' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
            <PetIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography 
              variant="h6" 
              component="h2"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.25rem' },
                flexGrow: 1
              }}
            >
              Sleep Assistant - {petState.name}
            </Typography>
            <Chip
              label={`Level ${petState.level}`}
              color="primary"
              size="small"
              icon={<ProgressIcon />}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            />
          </Box>

          <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
            <motion.div
              animate={petMoodData.animation}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            >
              <Avatar
                sx={{ 
                  width: { xs: 50, sm: 60 }, 
                  height: { xs: 50, sm: 60 }, 
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  bgcolor: petMoodData.color,
                }}
              >
                {petMoodData.emoji}
              </Avatar>
            </motion.div>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography 
                variant="body1" 
                fontWeight="bold"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  wordBreak: 'break-word'
                }}
              >
                {petMoodData.message}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Mood: {petState.mood} • XP: {petState.experience}/100
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
            <Button
              size="small"
              startIcon={<ScheduleIcon />}
              onClick={() => setShowReminders(true)}
              variant="outlined"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Schedule
            </Button>
            <Button
              size="small"
              startIcon={<TipIcon />}
              variant="outlined"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Daily Tip
            </Button>
          </Box>

          {/* Today's Tip */}
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'action.hover', mb: 2 }}>
            <Box display="flex" alignItems="start" gap={1}>
              <TipIcon sx={{ mt: 0.5, color: 'primary.main', fontSize: { xs: 20, sm: 24 } }} />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography 
                  variant="body2" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  Today's Sleep Tip
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  {getCurrentRecommendation()}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Active Recommendations */}
          <AnimatePresence>
            {recommendations.map((rec, index) => (
              <Fade key={index} in={true} timeout={500}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    mb: 1, 
                    bgcolor: 'warning.dark',
                    color: 'warning.contrastText'
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      {rec.type === 'sleep' && <SleepIcon sx={{ mr: 1 }} />}
                      {rec.type === 'eat' && <EatIcon sx={{ mr: 1 }} />}
                      {rec.type === 'sleep_quality' && <TipIcon sx={{ mr: 1 }} />}
                      <Typography variant="body2">
                        {rec.message}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => handleReminderAction(rec)}
                      sx={{ color: 'inherit' }}
                    >
                      {rec.action}
                    </Button>
                  </Box>
                </Paper>
              </Fade>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={showReminders} onClose={() => setShowReminders(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            Optimal Sleep Schedule
            <IconButton onClick={() => setShowReminders(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemIcon>
                <EatIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Dinner Time"
                secondary={`${dinnerTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Eat 3 hours before bedtime`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SleepIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Bedtime"
                secondary={`${getOptimalTimes().bedtime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Start winding down`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ScheduleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Wake Time"
                secondary={`${wakeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Aim for 8 hours of sleep`}
              />
            </ListItem>
          </List>
          
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              Consistent sleep schedules help regulate your circadian rhythm and improve sleep quality.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReminders(false)}>
            Close
          </Button>
          <Button variant="contained" onClick={() => setShowReminders(false)}>
            Set Reminders
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VirtualPet;