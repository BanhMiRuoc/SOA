import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Đăng ký các thành phần Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface PieChartProps {
  title?: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string[];
      borderWidth?: number;
    }[];
  };
  className?: string;
  height?: number;
  options?: React.ComponentProps<typeof Pie>['options'];
  emptyMessage?: string;
}

export function PieChart({
  title,
  data,
  className,
  height = 300,
  options,
  emptyMessage = 'Không có dữ liệu',
}: PieChartProps) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        display: true,
        labels: {
          boxWidth: 12
        }
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  const hasData = data.datasets.some(dataset => dataset.data.length > 0);

  return (
    <Card className={cn('', className)}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div style={{ height: `${height}px` }} className="relative">
          {hasData ? (
            <Pie data={data} options={mergedOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 