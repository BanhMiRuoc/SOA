import React from 'react';
import { DonutChart } from '@/components/ui/charts/donut-chart';

interface PaymentMethod {
  method: string;
  count: number;
  amount: number;
}

interface PaymentAnalysisProps {
  paymentMethods: PaymentMethod[];
  getPaymentMethodLabel: (method: string) => string;
}

export const PaymentAnalysis: React.FC<PaymentAnalysisProps> = ({ 
  paymentMethods,
  getPaymentMethodLabel
}) => {
  // Chuẩn bị dữ liệu cho biểu đồ phương thức thanh toán
  const chartData = {
    labels: paymentMethods.map(item => getPaymentMethodLabel(item.method)),
    datasets: [
      {
        label: 'Doanh thu theo phương thức thanh toán',
        data: paymentMethods.map(item => item.amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',    // Hồng đậm
          'rgba(54, 162, 235, 0.8)',    // Xanh dương
          'rgba(255, 206, 86, 0.8)',    // Vàng
          'rgba(75, 192, 192, 0.8)',    // Xanh lá
          'rgba(153, 102, 255, 0.8)',   // Tím
          'rgba(255, 159, 64, 0.8)',    // Cam
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
        hoverOffset: 8,
      },
    ],
  };

  // Tùy chỉnh options cho biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const formattedValue = new Intl.NumberFormat('vi-VN', { 
              style: 'currency', 
              currency: 'VND' 
            }).format(value);
            return `${label}: ${formattedValue}`;
          }
        }
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  return (
    <DonutChart 
      title="Phân tích phương thức thanh toán"
      data={chartData}
      emptyMessage="Không có dữ liệu thanh toán"
      options={chartOptions}
    />
  );
}; 