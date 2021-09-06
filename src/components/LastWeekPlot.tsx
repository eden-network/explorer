import { useMemo } from 'react';

import { Line } from 'react-chartjs-2';

export default function LastWeekPlot({
  data,
  label,
}: {
  data: number[];
  label: string;
}) {
  const chartData = useMemo(() => {
    const labels = Array(data.length).fill('');
    return {
      labels,
      datasets: [
        {
          label,
          data,
          pointStyle: 'line',
          borderColor: '#CAFF00',
          borderWidth: 3,
          pointRadius: 0,
        },
      ],
    };
  }, [data, label]);

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
            display: false,
          },
        },
        y: {
          grid: {
            display: false,
          },
        },
      },
    };
  }, []);

  return <Line data={chartData} options={chartOptions} />;
}
