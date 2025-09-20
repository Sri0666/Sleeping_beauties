import React from 'react';
import { Typography, Box } from '@mui/material';

const Profile = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      <Typography variant="body1">
        User profile and sleep preferences coming soon...
      </Typography>
    </Box>
  );
};

export default Profile;