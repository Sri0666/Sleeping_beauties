import React, { useEffect, useState } from 'react';
import { Typography, Box, Card, CardContent, Button, Chip, Stack } from '@mui/material';
import sleepAPI from '../services/sleepAPI';

const Recommendations = () => {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    const load = async () => {
      const r = await sleepAPI.getRecommendations('user123');
      setRecs(r.data.recommendations || []);
    };
    load();
  }, []);

  const markDone = async (id) => {
    await sleepAPI.updateRecommendationStatus(id, 'done');
    setRecs(prev => prev.map(r => r.id === id ? { ...r, status: 'done' } : r));
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h4" gutterBottom>
        Sleep Recommendations
      </Typography>

      <Stack spacing={2}>
        {recs.map(rec => (
          <Card key={rec.id}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                <Box>
                  <Typography variant="h6">{rec.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{rec.description}</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={rec.category} color="info" variant="outlined" />
                  {rec.status !== 'done' ? (
                    <Button variant="contained" onClick={() => markDone(rec.id)}>Mark Done</Button>
                  ) : (
                    <Chip label="Done" color="success" />
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default Recommendations;