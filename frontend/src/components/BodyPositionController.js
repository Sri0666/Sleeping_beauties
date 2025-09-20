import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Slider,
  Button,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AutoMode as AutoIcon,
  Tune as ManualIcon,
  Refresh as RefreshIcon,
  Psychology as AiIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Bed as BedIcon
} from '@mui/icons-material';

const BodyPositionController = ({ socket, userId, sessionId, onPositionChange }) => {
  // Position state
  const [positions, setPositions] = useState({
    head: 0,
    torso: 0,
    legs: 0,
    feet: 0
  });

  // AI recommendations
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [pressureData, setPressureData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Control state
  const [autoMode, setAutoMode] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [lastAdjustment, setLastAdjustment] = useState(null);
  
  // UI state
  const [showDetails, setShowDetails] = useState(false);

  // Position constraints
  const constraints = {
    head: { min: 0, max: 45, step: 1, unit: '°' },
    torso: { min: 0, max: 30, step: 1, unit: '°' },
    legs: { min: 0, max: 20, step: 1, unit: '°' },
    feet: { min: 0, max: 15, step: 1, unit: '°' }
  };

  // Body part display names and icons
  const bodyParts = {
    head: { label: 'Head & Neck', color: '#2196F3', description: 'Upper head support' },
    torso: { label: 'Torso', color: '#4CAF50', description: 'Back and chest area' },
    legs: { label: 'Legs', color: '#FF9800', description: 'Thigh and knee area' },
    feet: { label: 'Feet', color: '#9C27B0', description: 'Ankle and foot elevation' }
  };

  // Generate synthetic pressure data for testing
  const generateSyntheticData = useCallback(() => {
    const scenarios = ['normal', 'side_sleeper_pressure', 'back_sleeper_snoring', 'restless_sleeper'];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    return {
      scenario,
      head: { pressure: 5 + Math.random() * 10, distribution: { left: 30 + Math.random() * 40, right: 30 + Math.random() * 40 } },
      neck: { pressure: 3 + Math.random() * 8 },
      upperTorso: { pressure: 8 + Math.random() * 12 },
      lowerTorso: { pressure: 10 + Math.random() * 15 },
      hips: { pressure: 12 + Math.random() * 18 },
      thighs: { pressure: 8 + Math.random() * 15 },
      knees: { pressure: 5 + Math.random() * 10 },
      calves: { pressure: 4 + Math.random() * 8 },
      feet: { pressure: 3 + Math.random() * 7 },
      currentPosition: positions
    };
  }, [positions]);

  // Simulate AI analysis
  const simulateAiAnalysis = useCallback(async (pressureData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Generate realistic recommendations based on pressure data
    const recommendations = {
      recommendations: {
        head: {
          targetAngle: Math.max(0, Math.min(45, positions.head + (Math.random() - 0.5) * 20)),
          reasoning: 'Optimizing airway alignment and reducing neck strain'
        },
        torso: {
          targetAngle: Math.max(0, Math.min(30, positions.torso + (Math.random() - 0.5) * 15)),
          reasoning: 'Improving spinal alignment and reducing pressure points'
        },
        legs: {
          targetAngle: Math.max(0, Math.min(20, positions.legs + (Math.random() - 0.5) * 10)),
          reasoning: 'Enhancing circulation and reducing hip pressure'
        },
        feet: {
          targetAngle: Math.max(0, Math.min(15, positions.feet + (Math.random() - 0.5) * 8)),
          reasoning: 'Promoting better blood flow and comfort'
        }
      },
      overallAssessment: {
        pressureIssues: pressureData.hips?.pressure > 20 ? ['High hip pressure detected'] : [],
        comfortScore: 3 + Math.random() * 7,
        sleepQualityImpact: 'Position optimization may improve sleep quality by 15-25%',
        urgency: pressureData.hips?.pressure > 25 ? 'high' : Math.random() > 0.7 ? 'medium' : 'low'
      },
      adjustmentSequence: [
        { bodyPart: 'head', targetAngle: 10, delaySeconds: 0, priority: 'medium' },
        { bodyPart: 'torso', targetAngle: 8, delaySeconds: 5, priority: 'high' },
        { bodyPart: 'legs', targetAngle: 12, delaySeconds: 10, priority: 'medium' },
        { bodyPart: 'feet', targetAngle: 6, delaySeconds: 15, priority: 'low' }
      ],
      additionalTips: [
        'Maintain consistent sleep schedule',
        'Keep room temperature between 65-68°F',
        'Consider pillow adjustment for neck support'
      ],
      timestamp: new Date().toISOString(),
      source: 'ai_analysis'
    };

    return recommendations;
  }, [positions]);

  // Handle position changes
  const handlePositionChange = (bodyPart, newValue) => {
    const newPositions = { ...positions, [bodyPart]: newValue };
    setPositions(newPositions);
    
    if (onPositionChange) {
      onPositionChange(newPositions);
    }

    // Emit to socket if connected
    if (socket) {
      socket.emit('position_change', {
        userId,
        sessionId,
        bodyPart,
        newValue,
        positions: newPositions,
        timestamp: Date.now()
      });
    }
  };

  // Analyze current position with AI
  const analyzePosition = async () => {
    setIsAnalyzing(true);
    try {
      const currentPressureData = generateSyntheticData();
      setPressureData(currentPressureData);
      
      const recommendations = await simulateAiAnalysis(currentPressureData);
      setAiRecommendations(recommendations);
      
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply AI recommendations
  const applyRecommendations = async () => {
    if (!aiRecommendations) return;
    
    setIsAdjusting(true);
    const adjustments = aiRecommendations.adjustmentSequence || [];
    
    for (const adjustment of adjustments) {
      await new Promise(resolve => setTimeout(resolve, adjustment.delaySeconds * 1000));
      handlePositionChange(adjustment.bodyPart, adjustment.targetAngle);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Animation time
    }
    
    setLastAdjustment({
      timestamp: new Date(),
      source: 'ai_recommendations',
      adjustmentCount: adjustments.length
    });
    
    setIsAdjusting(false);
  };

  // Reset all positions
  const resetPositions = () => {
    const resetPos = { head: 0, torso: 0, legs: 0, feet: 0 };
    setPositions(resetPos);
    if (onPositionChange) onPositionChange(resetPos);
  };

  // Auto-mode toggle
  const handleAutoModeToggle = (checked) => {
    setAutoMode(checked);
    if (checked) {
      analyzePosition();
    }
  };

  // Periodic analysis in auto mode
  useEffect(() => {
    if (autoMode) {
      const interval = setInterval(analyzePosition, 300000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoMode]);

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <BedIcon color="primary" />
            <Typography variant="h6">Body Position Controller</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoMode}
                  onChange={(e) => handleAutoModeToggle(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  {autoMode ? <AutoIcon fontSize="small" /> : <ManualIcon fontSize="small" />}
                  {autoMode ? 'Auto' : 'Manual'}
                </Box>
              }
            />
          </Box>
        </Box>

        {/* AI Analysis Section */}
        {aiRecommendations && (
          <Alert 
            severity={getUrgencyColor(aiRecommendations.overallAssessment?.urgency)}
            sx={{ mb: 2 }}
            action={
              <Button 
                size="small" 
                onClick={applyRecommendations}
                disabled={isAdjusting}
                startIcon={<AiIcon />}
              >
                {isAdjusting ? 'Applying...' : 'Apply AI'}
              </Button>
            }
          >
            <Typography variant="body2" fontWeight="bold">
              AI Analysis Complete
            </Typography>
            <Typography variant="caption" display="block">
              Comfort Score: {aiRecommendations.overallAssessment?.comfortScore?.toFixed(1)}/10 • 
              Urgency: {aiRecommendations.overallAssessment?.urgency}
            </Typography>
          </Alert>
        )}

        {/* Position Controllers - Equalizer Style */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {Object.entries(bodyParts).map(([bodyPart, config]) => (
            <Grid item xs={3} key={bodyPart}>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  {config.label}
                </Typography>
                
                {/* Vertical Slider */}
                <Box 
                  sx={{ 
                    height: 200, 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    px: 2
                  }}
                >
                  <Slider
                    orientation="vertical"
                    value={positions[bodyPart]}
                    onChange={(e, value) => handlePositionChange(bodyPart, value)}
                    min={constraints[bodyPart].min}
                    max={constraints[bodyPart].max}
                    step={constraints[bodyPart].step}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}${constraints[bodyPart].unit}`}
                    sx={{
                      color: config.color,
                      '& .MuiSlider-thumb': {
                        width: 20,
                        height: 20,
                      },
                      '& .MuiSlider-track': {
                        width: 8,
                      },
                      '& .MuiSlider-rail': {
                        width: 8,
                        opacity: 0.3,
                      }
                    }}
                    disabled={isAdjusting && autoMode}
                  />
                </Box>

                {/* Value Display */}
                <Chip
                  label={`${positions[bodyPart]}${constraints[bodyPart].unit}`}
                  size="small"
                  sx={{ 
                    backgroundColor: config.color + '20',
                    color: config.color,
                    fontWeight: 'bold'
                  }}
                />

                {/* AI Recommendation Indicator */}
                {aiRecommendations?.recommendations[bodyPart] && (
                  <Box mt={1}>
                    <Tooltip title={aiRecommendations.recommendations[bodyPart].reasoning}>
                      <Chip
                        label={`AI: ${aiRecommendations.recommendations[bodyPart].targetAngle}°`}
                        size="small"
                        variant="outlined"
                        icon={<AiIcon />}
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Control Buttons */}
        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          <Button
            variant="outlined"
            onClick={analyzePosition}
            disabled={isAnalyzing}
            startIcon={isAnalyzing ? <LinearProgress sx={{ width: 20 }} /> : <AiIcon />}
            size="small"
          >
            {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={resetPositions}
            startIcon={<RefreshIcon />}
            size="small"
            disabled={isAdjusting}
          >
            Reset
          </Button>

          {pressureData && (
            <Chip
              label={`Scenario: ${pressureData.scenario}`}
              size="small"
              variant="outlined"
              icon={<InfoIcon />}
            />
          )}
        </Box>

        {/* Detailed Analysis */}
        {aiRecommendations && (
          <Accordion expanded={showDetails} onChange={() => setShowDetails(!showDetails)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Detailed Analysis</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Pressure Issues
                  </Typography>
                  {aiRecommendations.overallAssessment?.pressureIssues?.map((issue, index) => (
                    <Typography key={index} variant="body2" color="warning.main">
                      • {issue}
                    </Typography>
                  )) || <Typography variant="body2" color="success.main">No issues detected</Typography>}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Sleep Quality Impact
                  </Typography>
                  <Typography variant="body2">
                    {aiRecommendations.overallAssessment?.sleepQualityImpact}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Additional Tips
                  </Typography>
                  {aiRecommendations.additionalTips?.map((tip, index) => (
                    <Typography key={index} variant="body2">
                      • {tip}
                    </Typography>
                  ))}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Last Adjustment Info */}
        {lastAdjustment && (
          <Box mt={2} p={1} bgcolor="action.hover" borderRadius={1}>
            <Typography variant="caption" color="text.secondary">
              Last adjustment: {lastAdjustment.timestamp.toLocaleTimeString()} • 
              {lastAdjustment.adjustmentCount} changes • 
              Source: {lastAdjustment.source}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BodyPositionController;
