import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const RealtimeMetrics = ({ data }) => {
  if (!data) {
    return (
      <Card className="metric-card">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Real-time Metrics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No real-time data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getPositionColor = (position) => {
    switch (position) {
      case 'back': return '#e74c3c';
      case 'side': return '#27ae60';
      case 'stomach': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="metric-card">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Real-time Metrics
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.position && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Position:</Typography>
                <Chip
                  label={data.position}
                  size="small"
                  sx={{ 
                    backgroundColor: getPositionColor(data.position),
                    color: 'white'
                  }}
                />
              </Box>
            )}
            
            {data.environment && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Temperature:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {data.environment.temperature}°C
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Humidity:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {data.environment.humidity}%
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Light:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {data.environment.light} lux
                  </Typography>
                </Box>
              </>
            )}
            
            {data.timestamp && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Last updated: {new Date(data.timestamp).toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RealtimeMetrics;