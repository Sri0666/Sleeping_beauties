import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Chip,
  Alert,
  Grid
} from '@mui/material';
import {
  Hotel as PillowIcon,
  RotateLeft as AdjustIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const AdaptivePillow = ({ socket, deviceConnected }) => {
  const USE_MOCK = (process.env.REACT_APP_USE_MOCK || 'true') === 'true';
  const [pillowAngle, setPillowAngle] = useState(0);
  const [lastAdjustment, setLastAdjustment] = useState(null);
  const [restlessMovements, setRestlessMovements] = useState(0);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [recentAdjustments, setRecentAdjustments] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handlePillowData = (data) => {
      try {
        const message = JSON.parse(data);
        
        if (message.type === 'pillow_adjustment') {
          setPillowAngle(message.angle);
          setLastAdjustment({
            time: new Date(message.timestamp),
            reason: message.reason,
            movementCount: message.movement_count
          });
          setIsAdjusting(false);
          
          // Add to recent adjustments
          setRecentAdjustments(prev => [
            {
              time: new Date(message.timestamp),
              angle: message.angle,
              reason: message.reason,
              id: Date.now()
            },
            ...prev.slice(0, 4) // Keep last 5 adjustments
          ]);
        }
        
        if (message.type === 'sensor_data' && message.movementCount !== undefined) {
          setRestlessMovements(message.movementCount);
        }
      } catch (error) {
        console.error('Error parsing pillow data:', error);
      }
    };

    socket.on('message', handlePillowData);
    return () => socket.off('message', handlePillowData);
  }, [socket]);

  const handleManualAdjustment = () => {
    if (isAdjusting) return;

    setIsAdjusting(true);

    if (deviceConnected && socket) {
      // Send manual adjustment command to ESP32
      socket.emit('pillow_command', { 
        type: 'manual_adjust',
        timestamp: Date.now()
      });
    } else if (USE_MOCK) {
      // Simulate an adjustment locally in mock mode
      const newAngle = Math.min(90, Math.max(0, pillowAngle + (Math.random() > 0.5 ? 10 : -10)));
      setTimeout(() => {
        setPillowAngle(newAngle);
        const ts = Date.now();
        setLastAdjustment({
          time: new Date(ts),
          reason: 'manual_adjust',
          movementCount: rand(0, 5)
        });
        setRecentAdjustments(prev => [
          { time: new Date(ts), angle: newAngle, reason: 'manual_adjust', id: ts },
          ...prev.slice(0, 4)
        ]);
        setIsAdjusting(false);
      }, 800);
      return;
    }

    // Reset adjusting state after timeout
    setTimeout(() => setIsAdjusting(false), 3000);
  };

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const getAngleColor = (angle) => {
    if (angle === 0) return 'primary';
    if (angle <= 45) return 'info';
    if (angle <= 90) return 'warning';
    return 'error';
  };

  const getRestlessnessLevel = (movements) => {
    if (movements === 0) return { level: 'Calm', color: 'success', icon: <CheckIcon /> };
    if (movements <= 3) return { level: 'Mild', color: 'info', icon: <SettingsIcon /> };
    if (movements <= 7) return { level: 'Moderate', color: 'warning', icon: <WarningIcon /> };
    return { level: 'High', color: 'error', icon: <WarningIcon /> };
  };

  const restlessnessStatus = getRestlessnessLevel(restlessMovements);

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <PillowIcon sx={{ mr: 1, fontSize: 28 }} />
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.25rem' },
              flexGrow: 1
            }}
          >
            Adaptive Pillow
          </Typography>
          <Chip
            icon={restlessnessStatus.icon}
            label={`${restlessnessStatus.level}`}
            color={restlessnessStatus.color}
            size="small"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          />
        </Box>

        {!deviceConnected && !USE_MOCK && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Device not connected. Pillow adjustment unavailable.
          </Alert>
        )}

        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Angle
              </Typography>
              <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}
                >
                  {pillowAngle}°
                </Typography>
                <Chip
                  label={pillowAngle === 0 ? 'Flat' : 'Elevated'}
                  color={getAngleColor(pillowAngle)}
                  size="small"
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(pillowAngle / 90) * 100} 
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                color={getAngleColor(pillowAngle)}
              />
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Movement Count (5min window)
              </Typography>
              <Typography 
                variant="h6"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {restlessMovements} movements
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((restlessMovements / 10) * 100, 100)} 
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
                color={restlessnessStatus.color}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Button
                variant="contained"
                startIcon={isAdjusting ? null : <AdjustIcon />}
                onClick={handleManualAdjustment}
                disabled={!deviceConnected || isAdjusting}
                fullWidth
                sx={{ 
                  mb: 1,
                  py: { xs: 1.5, sm: 2 }
                }}
              >
                {isAdjusting ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress sx={{ width: 60, height: 4 }} />
                    <span>Adjusting...</span>
                  </Box>
                ) : (
                  'Manual Adjust'
                )}
              </Button>
              
              <Typography 
                variant="caption" 
                display="block" 
                textAlign="center" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Simulate restlessness detection
              </Typography>
            </Box>

            {lastAdjustment && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Adjustment
                </Typography>
                <Typography variant="body2">
                  {lastAdjustment.time.toLocaleTimeString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reason: {lastAdjustment.reason.replace('_', ' ')}
                  {lastAdjustment.movementCount > 0 && 
                    ` (${lastAdjustment.movementCount} movements)`}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {recentAdjustments.length > 0 && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Recent Adjustments
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {recentAdjustments.map((adj) => (
                <Box key={adj.id} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption">
                    {adj.time.toLocaleTimeString()} - {adj.angle}°
                  </Typography>
                  <Chip 
                    label={adj.reason.replace('_', ' ')} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AdaptivePillow;