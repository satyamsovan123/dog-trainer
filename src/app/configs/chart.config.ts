import { ChartConfiguration } from 'chart.js';

export const DashboardChartConfiguration: ChartConfiguration['options'] = {
  responsive: true,
  scales: {
    x: {
      title: {
        padding: 10,
        display: window.innerWidth > 500,
        text: 'Date (YYYY-MM-DD)',
        font: {
          size: 12,
          family: 'Quicksand, sans-serif',
        },
        color: '#000000',
        align: 'center',
      },
      min: 0,
      ticks: {
        maxRotation: 90,
        minRotation: 90,
        color: '#000000',
        font: {
          size: 12,
          family: 'Quicksand, sans-serif',
        },
      },
      grid: {
        color: '#000000',
        lineWidth: 0.2,
      },
    },
    y: {
      title: {
        padding: 10,
        display: window.innerWidth > 500,
        text: 'Weight (KGs)',
        font: {
          size: 12,
          family: 'Quicksand, sans-serif',
        },
        color: '#000000',
        align: 'center',
      },
      min: 0,
      ticks: {
        stepSize: 2,
        color: '#000000',
        font: {
          size: 12,
          family: 'Quicksand, sans-serif',
        },
      },
      grid: {
        color: '#000000',
        lineWidth: 0.2,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
      labels: {
        font: {
          size: 12,
          family: 'Quicksand, sans-serif',
        },
      },
    },
    datalabels: {
      display: false,
      anchor: 'end',
      align: 'end',
      color: '#000000',
      font: {
        size: 12,
        family: 'Quicksand, sans-serif',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(142, 110, 53, 0.7)',
      titleColor: '#000000',
      bodySpacing: 10,
      padding: 10,
      bodyColor: '#000000',
      bodyFont: {
        size: 12,
        family: 'Quicksand, sans-serif',
      },
      titleFont: {
        size: 12,
        family: 'Quicksand, sans-serif',
      },
      titleMarginBottom: 12,
    },
  },
};
