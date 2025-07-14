import React from 'react';
import { LineChart } from '@/components/ui/charts/line-chart';

interface RevenueData {
  period: string;
  amount: number;
}

interface TrendChartProps {
  revenueData: RevenueData[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ revenueData }) => {
  // Chuẩn bị dữ liệu xu hướng doanh thu
  const chartData = {
    labels: revenueData.map(item => item.period),
    datasets: [
      {
        label: 'Xu hướng doanh thu',
        data: revenueData.map(item => item.amount),
        backgroundColor: 'rgba(53, 162, 235, 0.3)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(53, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(53, 162, 235)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Tùy chỉnh options cho biểu đồ
  const chartOptions = {
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <LineChart 
      title="Xu hướng doanh thu"
      data={chartData}
      height={400}
      options={chartOptions}
    />
  );
}; 