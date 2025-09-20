import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Tooltip,
  Button,
  Alert,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ThermostatAuto as PressureIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const PressureMappingVisualization = ({ pressureData, onRefresh, isLoading }) => {
  const theme = useTheme();
  const [hoveredZone, setHoveredZone] = useState(null);

  // Default pressure data structure
  const defaultPressureData = {
    head: { pressure: 0, distribution: { left: 50, right: 50 } },
    neck: { pressure: 0 },
    upperTorso: { pressure: 0 },
    lowerTorso: { pressure: 0 },
    hips: { pressure: 0 },
    thighs: { pressure: 0 },
    knees: { pressure: 0 },
    calves: { pressure: 0 },
    feet: { pressure: 0 }
  };

  const data = pressureData || defaultPressureData;

  // Color coding for pressure levels
  const getPressureColor = (pressure) => {
    if (pressure === 0) return '#E0E0E0'; // No data
    if (pressure < 5) return '#4CAF50';   // Low pressure - green
    if (pressure < 10) return '#8BC34A';  // Light pressure - light green
    if (pressure < 15) return '#FFC107';  // Medium pressure - yellow
    if (pressure < 20) return '#FF9800';  // High pressure - orange
    return '#F44336';                     // Very high pressure - red
  };

  const getPressureIntensity = (pressure) => {
    return Math.min(pressure / 25, 1); // Normalize to 0-1 scale
  };

  const getPressureDescription = (pressure) => {
    if (pressure === 0) return 'No data';
    if (pressure < 5) return 'Minimal pressure';
    if (pressure < 10) return 'Light pressure';
    if (pressure < 15) return 'Normal pressure';
    if (pressure < 20) return 'High pressure';
    return 'Very high pressure';
  };

  // Calculate total pressure and distribution
  const totalPressure = Object.values(data).reduce((sum, zone) => {
    return sum + (zone?.pressure || 0);
  }, 0);

  const averagePressure = Object.keys(data).length > 0 ? totalPressure / Object.keys(data).length : 0;

  // Identify pressure issues
  const pressureIssues = Object.entries(data).filter(([zone, zoneData]) => 
    zoneData?.pressure > 20
  ).map(([zone, zoneData]) => ({
    zone,
    pressure: zoneData.pressure,
    severity: zoneData.pressure > 25 ? 'high' : 'medium'
  }));

  // Body diagram component
  const BodyDiagram = () => {
    const bodyZones = [
      { key: 'head', x: 130, y: 20, width: 60, height: 40, label: 'Head' },
      { key: 'neck', x: 140, y: 65, width: 40, height: 20, label: 'Neck' },
      { key: 'upperTorso', x: 120, y: 90, width: 80, height: 60, label: 'Upper Torso' },
      { key: 'lowerTorso', x: 125, y: 155, width: 70, height: 50, label: 'Lower Torso' },
      { key: 'hips', x: 115, y: 210, width: 90, height: 40, label: 'Hips' },
      { key: 'thighs', x: 110, y: 255, width: 100, height: 60, label: 'Thighs' },
      { key: 'knees', x: 125, y: 320, width: 70, height: 30, label: 'Knees' },
      { key: 'calves', x: 130, y: 355, width: 60, height: 50, label: 'Calves' },
      { key: 'feet', x: 135, y: 410, width: 50, height: 30, label: 'Feet' }
    ];

    return (
      <Box sx={{ position: 'relative', width: 320, height: 460, margin: '0 auto' }}>
        <svg width="320" height="460" style={{ border: '1px solid #e0e0e0', borderRadius: 8 }}>
          {/* Background body outline */}
          <path
            d="M 160 20 
               Q 180 20 190 40
               L 200 90
               Q 205 100 200 110
               L 205 150
               Q 210 200 205 210
               L 210 250
               Q 215 300 210 320
               L 205 360
               Q 200 400 195 410
               L 185 440
               Q 160 445 135 440
               L 125 410
               Q 120 400 115 360
               L 110 320
               Q 105 300 110 250
               L 115 210
               Q 110 200 115 150
               L 120 110
               Q 115 100 120 90
               L 130 40
               Q 140 20 160 20 Z"
            fill="#f5f5f5"
            stroke="#ddd"
            strokeWidth="2"
          />

          {/* Pressure zones */}
          {bodyZones.map(zone => {
            const zoneData = data[zone.key];
            const pressure = zoneData?.pressure || 0;
            const color = getPressureColor(pressure);
            const intensity = getPressureIntensity(pressure);

            return (
              <g key={zone.key}>
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  fill={color}
                  fillOpacity={0.7 + (intensity * 0.3)}
                  stroke={hoveredZone === zone.key ? '#2196f3' : '#ccc'}
                  strokeWidth={hoveredZone === zone.key ? 3 : 1}
                  rx={4}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredZone(zone.key)}
                  onMouseLeave={() => setHoveredZone(null)}
                />
                
                {/* Pressure value text */}
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + zone.height / 2 + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fill={intensity > 0.6 ? 'white' : 'black'}
                  fontWeight="bold"
                >
                  {pressure.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Zone details on hover */}
        {hoveredZone && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: 1,
              borderRadius: 1,
              fontSize: '0.875rem',
              zIndex: 10
            }}
          >
            <Typography variant="subtitle2">
              {bodyZones.find(z => z.key === hoveredZone)?.label}
            </Typography>
            <Typography variant="body2">
              Pressure: {data[hoveredZone]?.pressure?.toFixed(1) || 0} kPa
            </Typography>
            <Typography variant="caption">
              {getPressureDescription(data[hoveredZone]?.pressure || 0)}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <PressureIcon color="primary" />
            <Typography variant="h6">Pressure Mapping</Typography>
          </Box>
          <Button
            size="small"
            onClick={onRefresh}
            disabled={isLoading}
            startIcon={isLoading ? <LinearProgress sx={{ width: 20 }} /> : <RefreshIcon />}
          >
            {isLoading ? 'Scanning...' : 'Refresh'}
          </Button>
        </Box>

        {/* Pressure issues alert */}
        {pressureIssues.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              High pressure detected in {pressureIssues.length} zone(s)
            </Typography>
            <Typography variant="caption" display="block">
              {pressureIssues.map(issue => issue.zone).join(', ')}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Body diagram */}
          <Grid item xs={12} md={7}>
            <Box>
              <Typography variant="subtitle2" gutterBottom textAlign="center">
                Body Pressure Distribution
              </Typography>
              <BodyDiagram />
              
              {/* Pressure scale legend */}
              <Box mt={2} display="flex" alignItems="center" justifyContent="center" flexWrap="wrap" gap={1}>
                <Typography variant="caption" color="text.secondary">
                  Pressure Scale (kPa):
                </Typography>
                {[
                  { range: '0-5', color: '#4CAF50', label: 'Low' },
                  { range: '5-10', color: '#8BC34A', label: 'Light' },
                  { range: '10-15', color: '#FFC107', label: 'Normal' },
                  { range: '15-20', color: '#FF9800', label: 'High' },
                  { range: '20+', color: '#F44336', label: 'Very High' }
                ].map(item => (
                  <Chip
                    key={item.range}
                    label={`${item.range} (${item.label})`}
                    size="small"
                    sx={{
                      backgroundColor: item.color + '20',
                      color: item.color,
                      fontWeight: 'bold',
                      fontSize: '0.7rem'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Statistics and details */}
          <Grid item xs={12} md={5}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Pressure Analysis
              </Typography>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Total Pressure
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {totalPressure.toFixed(1)} kPa
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((totalPressure / 150) * 100, 100)}
                  sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                />
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Average Pressure
                  </Typography>
                  <Typography variant="h6">
                    {averagePressure.toFixed(1)} kPa
                  </Typography>
                </Box>
              </Box>

              {/* Asymmetry analysis for head */}
              {data.head?.distribution && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Head Pressure Distribution
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Box flex={1} textAlign="center">
                      <Typography variant="caption">Left</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={data.head.distribution.left || 50}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="info"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {data.head.distribution.left?.toFixed(0) || 50}%
                      </Typography>
                    </Box>
                    <Box flex={1} textAlign="center">
                      <Typography variant="caption">Right</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={data.head.distribution.right || 50}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="warning"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {data.head.distribution.right?.toFixed(0) || 50}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Zone-by-zone breakdown */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Zone Details
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {Object.entries(data).map(([zone, zoneData]) => (
                    <Box
                      key={zone}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={0.5}
                      sx={{
                        backgroundColor: hoveredZone === zone ? 'action.hover' : 'transparent',
                        borderRadius: 1,
                        px: 1
                      }}
                      onMouseEnter={() => setHoveredZone(zone)}
                      onMouseLeave={() => setHoveredZone(null)}
                    >
                      <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                        {zone.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption" fontWeight="bold">
                          {zoneData?.pressure?.toFixed(1) || 0} kPa
                        </Typography>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getPressureColor(zoneData?.pressure || 0)
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Recommendations */}
              {pressureIssues.length > 0 && (
                <Box mt={2} p={1} bgcolor="warning.main" borderRadius={1} sx={{ color: 'warning.contrastText' }}>
                  <Typography variant="caption" fontWeight="bold">
                    Recommendations:
                  </Typography>
                  <Typography variant="caption" display="block">
                    • Consider position adjustment for high-pressure zones
                  </Typography>
                  <Typography variant="caption" display="block">
                    • Use AI analysis for optimal positioning
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PressureMappingVisualization;
