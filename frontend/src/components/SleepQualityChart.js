import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend
} from 'chart.js';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const SleepQualityChart = ({ data, height = 220 }) => {
  const score = data?.quality ?? 0;
  const chartData = useMemo(() => ({
    labels: ['Quality', 'Remaining'],
    datasets: [
      {
        label: 'Sleep Quality',
        data: [score, Math.max(0, 100 - score)],
        backgroundColor: ['#10b981', '#334155'],
        borderWidth: 0,
      },
    ],
  }), [score]);

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    cutout: '70%',
    maintainAspectRatio: false,
  };

  return (
    <Box sx={{ height }}>
      <Doughnut data={chartData} options={options} />
    </Box>
  );
};

export default SleepQualityChart;