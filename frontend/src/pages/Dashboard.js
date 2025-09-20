import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  LinearProgress,
  Stack,
  useTheme
} from '@mui/material';
import { Bedtime, TrendingUp, PlayArrow, Stop } from '@mui/icons-material';
import { motion } from 'framer-motion';

// Components
import RealtimeMetrics from '../components/RealtimeMetrics';
import QuickActions from '../components/QuickActions';
import SleepTrendChart from '../components/SleepTrendChart';
import SleepQualityChart from '../components/SleepQualityChart';
import AdaptivePillow from '../components/AdaptivePillow';
import VirtualPet from '../components/VirtualPet';

// Services
import { useWebSocket } from '../services/WebSocketService';
import sleepAPI from '../services/sleepAPI';

const Dashboard = () => {
  const theme = useTheme();
  const { socket, isConnected, realtimeData } = useWebSocket();
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [todaysMetrics, setTodaysMetrics] = useState(null);
  const [weeklyTrends, setWeeklyTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const metricsResponse = await sleepAPI.getUserSessions('user123', 1);
      if (metricsResponse.data.sessions.length > 0) {
        setTodaysMetrics(metricsResponse.data.sessions[0]);
      }
      const trendsResponse = await sleepAPI.getAnalytics('user123', '7d');
      setWeeklyTrends(trendsResponse.data.analytics);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSleepTracking = async () => {
    try {
      const response = await sleepAPI.startSleepSession({
        userId: 'user123',
        deviceId: 'ESP32_001',
        settings: { snoringDetection: true, positionTracking: true, smartAlarm: false },
      });
      setCurrentSession(response.data.session);
      setIsTracking(true);
    } catch (error) {
      console.error('Error starting sleep tracking:', error);
    }
  };

  const stopSleepTracking = async () => {
    try {
      if (currentSession) {
        await sleepAPI.stopSleepSession(currentSession.sessionId);
        setIsTracking(false);
        setCurrentSession(null);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error stopping sleep tracking:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getSleepQualityColor = (score) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 80) return theme.palette.info.main;
    if (score >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Loading Dashboard...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
  <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden', m: 0, p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 3, sm: 4 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: { xs: 2, sm: 0 } }}>
          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(45deg, #6366f1, #06b6d4)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {getGreeting()}!
              </Box>
              <Box component="span" aria-hidden="true" sx={{ color: 'text.primary' }}>😴</Box>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip icon={<span className={`status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`} />} label={isConnected ? 'Device Connected' : 'Device Disconnected'} color={isConnected ? 'success' : 'error'} variant="outlined" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
            {isTracking && (
              <Chip icon={<span className="status-indicator status-tracking" />} label="Tracking Active" color="warning" className="pulse" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />
            )}
          </Box>
        </Box>

        <Grid container sx={{ width: '100%', margin: 0 }} alignItems="flex-start">
          {/* Column 1: Sleep Tracking + Realtime */}
          <Grid item xs={12} lg={4} sx={{ pr: { lg: 1 } }}>
            <Stack spacing={2}>
              <Card className="metric-card">
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" gutterBottom>Sleep Tracking</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {!isTracking ? (
                      <Button variant="contained" color="primary" size="large" startIcon={<PlayArrow />} onClick={startSleepTracking} disabled={!isConnected} fullWidth sx={{ py: { xs: 1.5, sm: 2 } }}>
                        Start Sleep Tracking
                      </Button>
                    ) : (
                      <Button variant="contained" color="error" size="large" startIcon={<Stop />} onClick={stopSleepTracking} fullWidth>
                        Stop Sleep Tracking
                      </Button>
                    )}
                    {isTracking && currentSession && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">Session started: {new Date(currentSession.startTime).toLocaleTimeString()}</Typography>
                        <Typography variant="body2" color="text.secondary">Duration: {Math.floor((Date.now() - new Date(currentSession.startTime)) / 60000)} minutes</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
              <RealtimeMetrics data={realtimeData} />
            </Stack>
          </Grid>

          {/* Column 2: Last Night + Quick Stats */}
          <Grid item xs={12} lg={4} sx={{ px: { lg: 0.5 } }}>
            <Stack spacing={2}>
              {todaysMetrics && (
                <Card className="metric-card">
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Bedtime sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="h6">Last Night's Sleep</Typography>
                    </Box>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={5}>
                        <SleepQualityChart data={todaysMetrics} height={180} />
                      </Grid>
                      <Grid item xs={7}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h2" component="div" sx={{ color: getSleepQualityColor(todaysMetrics.quality), fontWeight: 'bold', mb: 0.5 }}>
                            {todaysMetrics.quality}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">Sleep Quality Score</Typography>
                          <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="h6">{Math.floor(todaysMetrics.duration / (1000 * 60 * 60))}h {Math.floor((todaysMetrics.duration % (1000 * 60 * 60)) / (1000 * 60))}m</Typography>
                              <Typography variant="caption" color="text.secondary">Duration</Typography>
                            </Box>
                            <Box>
                              <Typography variant="h6">{todaysMetrics.snoringEvents || 0}</Typography>
                              <Typography variant="caption" color="text.secondary">Snoring Events</Typography>
                            </Box>
                            <Box>
                              <Typography variant="h6">{todaysMetrics.positionChanges || 0}</Typography>
                              <Typography variant="caption" color="text.secondary">Position Changes</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
              <Card className="metric-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Quick Stats</Typography>
                  {weeklyTrends && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Average Quality:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{weeklyTrends.summary?.averageQuality || 0}%</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Average Duration:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{Math.floor((weeklyTrends.summary?.averageSleepDuration || 0) / (1000 * 60 * 60))}h {Math.floor(((weeklyTrends.summary?.averageSleepDuration || 0) % (1000 * 60 * 60)) / (1000 * 60))}m</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Sleep Efficiency:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{weeklyTrends.summary?.sleepEfficiency || 0}%</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Snoring Time:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{Math.floor((weeklyTrends.summary?.totalSnoringTime || 0) / (1000 * 60))}min</Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Column 3: Adaptive Pillow + Virtual Pet */}
          <Grid item xs={12} lg={4} sx={{ pl: { lg: 1 } }}>
            <Stack spacing={2}>
              <AdaptivePillow socket={socket} deviceConnected={isConnected} />
              <VirtualPet socket={socket} sleepData={todaysMetrics} currentTime={Date.now()} />
            </Stack>
          </Grid>

          {/* Trends row */}
          <Grid item xs={12}>
            <Card className="metric-card">
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" gutterBottom>
                  <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Sleep Quality Trends (7 Days)
                </Typography>
                <SleepTrendChart data={weeklyTrends} />
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <QuickActions />
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default Dashboard;