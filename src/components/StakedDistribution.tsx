import { useMemo } from 'react';

import { Bar } from 'react-chartjs-2';

export default function StakedDistribution({ data }) {
  const chartData = useMemo(() => {
    const labels = Array.from(Array(100).keys()).map((x) => x.toString());
    return {
      labels,
      datasets: [
        {
          label: 'Staked EDEN',
          data,
          backgroundColor: '#CAFF00',
        },
      ],
    };
  }, [data]);

  const chartOptions = useMemo(() => {
    return {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            beginAtZero: true,
          },
        },
        y: {
          grid: {
            display: false,
          },
          type: 'logarithmic',
        },
      },
    };
  }, []);

  return <Bar data={chartData} options={chartOptions} />;
}
