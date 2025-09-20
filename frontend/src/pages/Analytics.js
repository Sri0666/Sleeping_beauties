import React, { useEffect, useState } from 'react';
import { Typography, Box, Card, CardContent, Grid, LinearProgress } from '@mui/material';
import SleepTrendChart from '../components/SleepTrendChart';
import SleepQualityChart from '../components/SleepQualityChart';
import sleepAPI from '../services/sleepAPI';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [a, s] = await Promise.all([
        sleepAPI.getAnalytics('user123', '7d'),
        sleepAPI.getUserSessions('user123', 1),
      ]);
      setAnalytics(a.data.analytics);
      setToday(s.data.sessions[0]);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Sleep Analytics
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h4" gutterBottom>
        Sleep Analytics
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trends (7 days)
              </Typography>
              <SleepTrendChart data={analytics} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today Quality
              </Typography>
              <SleepQualityChart data={today} />
              {today && (
                <Box textAlign="center" mt={1}>
                  <Typography variant="h5">{today.quality}</Typography>
                  <Typography variant="caption" color="text.secondary">Quality Score</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Avg Quality
              </Typography>
              <Typography variant="h5">{analytics?.summary?.averageQuality}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Avg Duration
              </Typography>
              <Typography variant="h6">
                {Math.floor((analytics?.summary?.averageSleepDuration || 0) / 3600000)}h {Math.floor(((analytics?.summary?.averageSleepDuration || 0) % 3600000)/60000)}m
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Sleep Efficiency
              </Typography>
              <Typography variant="h5">{analytics?.summary?.sleepEfficiency}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;