import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Bed as BedIcon,
  AutoMode as AutoIcon,
  Science as TestIcon,
  Psychology as AiIcon,
  Timeline as AnalyticsIcon
} from '@mui/icons-material';

import BodyPositionController from '../components/BodyPositionController';
import PressureMappingVisualization from '../components/PressureMappingVisualization';
import AdaptivePillow from '../components/AdaptivePillow';

const AdaptivePositionSystem = ({ socket, userId, sessionId }) => {
  // System state
  const [pressureData, setPressureData] = useState(null);
  const [currentPositions, setCurrentPositions] = useState({
    head: 0, torso: 0, legs: 0, feet: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testScenario, setTestScenario] = useState('normal');
  const [isConnected, setIsConnected] = useState(false);
  const [systemMode, setSystemMode] = useState('manual'); // manual, auto, test

  // Test scenarios
  const testScenarios = {
    normal: {
      name: 'Normal Sleep Position',
      description: 'Balanced pressure distribution with comfortable positioning',
      color: 'success'
    },
    side_sleeper_pressure: {
      name: 'Side Sleeper Issues',
      description: 'High pressure on one side, typical of side sleeping problems',
      color: 'warning'
    },
    back_sleeper_snoring: {
      name: 'Back Sleeper with Snoring',
      description: 'Back sleeping position with potential airway obstruction',
      color: 'error'
    },
    restless_sleeper: {
      name: 'Restless Sleep Pattern',
      description: 'Uneven pressure from frequent movement and restlessness',
      color: 'info'
    }
  };

  // Generate synthetic pressure data based on scenario
  const generateSyntheticPressureData = (scenario) => {
    const scenarios = {
      normal: {
        head: { pressure: 8.5 + Math.random() * 2, distribution: { left: 45 + Math.random() * 10, right: 45 + Math.random() * 10 } },
        neck: { pressure: 6.2 + Math.random() * 1.5 },
        upperTorso: { pressure: 12.3 + Math.random() * 3 },
        lowerTorso: { pressure: 15.7 + Math.random() * 2 },
        hips: { pressure: 18.9 + Math.random() * 2 },
        thighs: { pressure: 11.4 + Math.random() * 2 },
        knees: { pressure: 7.8 + Math.random() * 1.5 },
        calves: { pressure: 9.1 + Math.random() * 1.2 },
        feet: { pressure: 5.6 + Math.random() * 1 },
        currentPosition: currentPositions
      },
      side_sleeper_pressure: {
        head: { pressure: 12.1 + Math.random() * 3, distribution: { left: 75 + Math.random() * 10, right: 15 + Math.random() * 10 } },
        neck: { pressure: 8.7 + Math.random() * 2 },
        upperTorso: { pressure: 19.5 + Math.random() * 4 },
        lowerTorso: { pressure: 22.3 + Math.random() * 3 },
        hips: { pressure: 25.8 + Math.random() * 3 },
        thighs: { pressure: 18.2 + Math.random() * 3 },
        knees: { pressure: 14.6 + Math.random() * 2 },
        calves: { pressure: 8.9 + Math.random() * 1.5 },
        feet: { pressure: 6.1 + Math.random() * 1 },
        currentPosition: currentPositions
      },
      back_sleeper_snoring: {
        head: { pressure: 14.2 + Math.random() * 2, distribution: { left: 48 + Math.random() * 4, right: 48 + Math.random() * 4 } },
        neck: { pressure: 11.8 + Math.random() * 2 },
        upperTorso: { pressure: 16.4 + Math.random() * 2 },
        lowerTorso: { pressure: 18.9 + Math.random() * 2 },
        hips: { pressure: 21.2 + Math.random() * 2 },
        thighs: { pressure: 13.7 + Math.random() * 2 },
        knees: { pressure: 9.3 + Math.random() * 1.5 },
        calves: { pressure: 7.4 + Math.random() * 1 },
        feet: { pressure: 5.8 + Math.random() * 1 },
        currentPosition: currentPositions
      },
      restless_sleeper: {
        head: { pressure: 7.3 + Math.random() * 5, distribution: { left: 40 + Math.random() * 20, right: 40 + Math.random() * 20 } },
        neck: { pressure: 9.1 + Math.random() * 3 },
        upperTorso: { pressure: 14.8 + Math.random() * 5 },
        lowerTorso: { pressure: 17.6 + Math.random() * 4 },
        hips: { pressure: 20.4 + Math.random() * 4 },
        thighs: { pressure: 16.8 + Math.random() * 4 },
        knees: { pressure: 12.1 + Math.random() * 3 },
        calves: { pressure: 10.5 + Math.random() * 2 },
        feet: { pressure: 8.2 + Math.random() * 2 },
        currentPosition: currentPositions
      }
    };

    return scenarios[scenario] || scenarios.normal;
  };

  // Simulate pressure sensor reading
  const simulatePressureScan = async () => {
    setIsLoading(true);
    try {
      // Simulate sensor reading delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      const newPressureData = generateSyntheticPressureData(testScenario);
      setPressureData(newPressureData);
      
      // Add some noise and variation to make it more realistic
      const timestamp = new Date().toISOString();
      console.log('Pressure scan completed:', { timestamp, scenario: testScenario, data: newPressureData });
      
    } catch (error) {
      console.error('Pressure scan failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle position changes from the controller
  const handlePositionChange = (newPositions) => {
    setCurrentPositions(newPositions);
    
    // Update pressure data to reflect new positions (simulated effect)
    if (pressureData) {
      const updatedPressureData = {
        ...pressureData,
        currentPosition: newPositions
      };
      setPressureData(updatedPressureData);
    }
  };

  // Handle test scenario change
  const handleScenarioChange = (scenario) => {
    setTestScenario(scenario);
    // Auto-generate new data when scenario changes
    setTimeout(() => {
      const newData = generateSyntheticPressureData(scenario);
      setPressureData(newData);
    }, 500);
  };

  // Auto-scan in test mode
  useEffect(() => {
    if (systemMode === 'auto') {
      const interval = setInterval(simulatePressureScan, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [systemMode, testScenario]);

  // Initial data load
  useEffect(() => {
    simulatePressureScan();
  }, []);

  // WebSocket connection status
  useEffect(() => {
    if (socket) {
      setIsConnected(socket.connected);
      
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      
      // Listen for real pressure data
      socket.on('pressure_data', (data) => {
        setPressureData(data);
      });
      
      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('pressure_data');
      };
    }
  }, [socket]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <BedIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" component="h1">
                Adaptive Position System
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                AI-powered sleep position optimization with pressure mapping
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              label={isConnected ? 'Connected' : 'Simulated'}
              color={isConnected ? 'success' : 'warning'}
              variant="outlined"
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mode</InputLabel>
              <Select
                value={systemMode}
                onChange={(e) => setSystemMode(e.target.value)}
                label="Mode"
              >
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="auto">Auto</MenuItem>
                <MenuItem value="test">Test</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* System Status Alert */}
        {systemMode === 'test' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Test Mode Active
            </Typography>
            <Typography variant="caption">
              Using synthetic pressure data for demonstration. Switch to Manual or Auto mode for real operation.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Test Scenario Selector */}
      {systemMode === 'test' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <TestIcon color="primary" />
                <Typography variant="h6">Test Scenarios</Typography>
              </Box>
              <Button
                onClick={simulatePressureScan}
                disabled={isLoading}
                startIcon={<AiIcon />}
                variant="outlined"
                size="small"
              >
                Generate New Data
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {Object.entries(testScenarios).map(([key, scenario]) => (
                <Grid item xs={12} sm={6} md={3} key={key}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: testScenario === key ? 2 : 1,
                      borderColor: testScenario === key ? 'primary.main' : 'divider',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                    onClick={() => handleScenarioChange(key)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="between" mb={1}>
                        <Typography variant="subtitle2" noWrap>
                          {scenario.name}
                        </Typography>
                        <Chip 
                          size="small" 
                          color={scenario.color} 
                          label={key === testScenario ? 'Active' : 'Select'}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {scenario.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Pressure Mapping Visualization */}
        <Grid item xs={12} lg={6}>
          <PressureMappingVisualization
            pressureData={pressureData}
            onRefresh={simulatePressureScan}
            isLoading={isLoading}
          />
        </Grid>

        {/* Body Position Controller */}
        <Grid item xs={12} lg={6}>
          <BodyPositionController
            socket={socket}
            userId={userId}
            sessionId={sessionId}
            onPositionChange={handlePositionChange}
          />
        </Grid>

        {/* Adaptive Pillow Integration */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AutoIcon color="primary" />
                <Typography variant="h6">Integrated Sleep Systems</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" mb={2}>
                The Adaptive Position System works seamlessly with existing sleep tracking features:
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <AdaptivePillow 
                    socket={socket} 
                    deviceConnected={isConnected}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        System Integration
                      </Typography>
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Connected Systems
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          <Chip size="small" color="success" label="Pressure Sensors" />
                          <Chip size="small" color="success" label="Position Controllers" />
                          <Chip size="small" color="success" label="Adaptive Pillow" />
                          <Chip size="small" color="info" label="AI Analysis" />
                          <Chip size="small" color="warning" label="Sleep Tracking" />
                        </Box>
                      </Box>

                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Key Features
                        </Typography>
                        <Typography variant="body2">
                          • Real-time pressure monitoring<br/>
                          • AI-powered position optimization<br/>
                          • Automatic adjustment sequences<br/>
                          • Integration with sleep phases<br/>
                          • Personalized comfort profiles
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Setup Required
                        </Typography>
                        <Typography variant="caption" color="warning.main">
                          Add OPENROUTER_API_KEY to backend environment variables for AI analysis
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Statistics Footer */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <AnalyticsIcon color="primary" />
            <Typography variant="h6">Session Analytics</Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Total Pressure
              </Typography>
              <Typography variant="h6">
                {pressureData ? 
                  Object.values(pressureData).reduce((sum, zone) => sum + (zone?.pressure || 0), 0).toFixed(1) 
                  : '0'} kPa
              </Typography>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Active Scenario
              </Typography>
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {testScenario.replace(/_/g, ' ')}
              </Typography>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                System Mode
              </Typography>
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {systemMode}
              </Typography>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="h6">
                {pressureData ? new Date().toLocaleTimeString() : 'Never'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdaptivePositionSystem;
