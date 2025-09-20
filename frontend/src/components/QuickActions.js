import React from 'react';
import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import {
  Lightbulb,
  DeviceHub,
  Settings,
  Assessment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'View Analytics',
      description: 'Detailed sleep insights',
      icon: <Assessment />,
      color: '#3498db',
      action: () => navigate('/analytics')
    },
    {
      title: 'Get Recommendations',
      description: 'Personalized tips',
      icon: <Lightbulb />,
      color: '#f39c12',
      action: () => navigate('/recommendations')
    },
    {
      title: 'Manage Devices',
      description: 'ESP32 configuration',
      icon: <DeviceHub />,
      color: '#27ae60',
      action: () => navigate('/devices')
    },
    {
      title: 'Sleep Settings',
      description: 'Tracking preferences',
      icon: <Settings />,
      color: '#9b59b6',
      action: () => navigate('/settings')
    }
  ];

  return (
    <Card className="metric-card">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Button
                variant="outlined"
                fullWidth
                onClick={action.action}
                aria-label={action.title}
                sx={{
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: action.color,
                  '&:hover': {
                    borderColor: action.color,
                    backgroundColor: action.color + '10',
                  },
                }}
              >
                <Box sx={{ color: action.color }}>
                  {action.icon}
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" display="block">
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {action.description}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActions;