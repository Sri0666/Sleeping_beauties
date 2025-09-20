import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const SleepTrendChart = ({ data }) => {
  const trends = data?.trends || [];
  const chartData = trends.map(d => ({
    date: d.date.slice(5),
    Quality: d.quality,
    DurationH: Math.round((d.durationMs / 3600000) * 10) / 10,
  }));

  if (!trends.length) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No trend data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis yAxisId="left" domain={[50, 100]} stroke="#94a3b8" />
          <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(99,102,241,0.3)' }} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="Quality" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
          <Line yAxisId="right" type="monotone" dataKey="DurationH" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default SleepTrendChart;