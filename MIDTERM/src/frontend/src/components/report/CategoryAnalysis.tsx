import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DonutChart } from '@/components/ui/charts/donut-chart';

interface CategoryItem {
  category: string;
  totalSales: number;
  itemsSold: number;
}

interface CategoryAnalysisProps {
  categories: CategoryItem[];
  totalRevenue: number;
  formatCurrency: (amount: number) => string;
}

export const CategoryAnalysis: React.FC<CategoryAnalysisProps> = ({
  categories,
  totalRevenue,
  formatCurrency
}) => {
  // Chuẩn bị dữ liệu cho biểu đồ donut
  const chartData = {
    labels: categories.map(item => item.category),
    datasets: [
      {
        label: 'Doanh thu theo danh mục',
        data: categories.map(item => item.totalSales),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',    // Hồng đậm
          'rgba(54, 162, 235, 0.8)',    // Xanh dương
          'rgba(255, 206, 86, 0.8)',    // Vàng
          'rgba(75, 192, 192, 0.8)',    // Xanh lá
          'rgba(153, 102, 255, 0.8)',   // Tím
          'rgba(255, 159, 64, 0.8)',    // Cam
          'rgba(45, 220, 190, 0.8)',    // Ngọc lam
          'rgba(238, 130, 238, 0.8)',   // Tím nhạt
          'rgba(106, 90, 205, 0.8)',    // Chàm
          'rgba(60, 179, 113, 0.8)',    // Xanh lục
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(45, 220, 190, 1)',
          'rgba(238, 130, 238, 1)',
          'rgba(106, 90, 205, 1)',
          'rgba(60, 179, 113, 1)',
        ],
        borderWidth: 1,
        hoverOffset: 10,
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
            const formattedValue = formatCurrency(value);
            const percentage = totalRevenue > 0 
              ? `(${((value / totalRevenue) * 100).toFixed(1)}%)` 
              : '';
            return `${label}: ${formattedValue} ${percentage}`;
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu theo danh mục sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Số lượng bán</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                  <TableHead className="text-right">Tỷ lệ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories
                  .sort((a, b) => b.totalSales - a.totalSales)
                  .map((category) => (
                  <TableRow key={category.category}>
                    <TableCell className="font-medium">{category.category}</TableCell>
                    <TableCell>{category.itemsSold}</TableCell>
                    <TableCell className="text-right">{formatCurrency(category.totalSales)}</TableCell>
                    <TableCell className="text-right">
                      {totalRevenue > 0 
                        ? `${((category.totalSales / totalRevenue) * 100).toFixed(1)}%` 
                        : '0%'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              Không có dữ liệu danh mục trong khoảng thời gian này
            </div>
          )}
        </CardContent>
      </Card>

      <DonutChart 
        title="Tỷ lệ doanh thu theo danh mục"
        data={chartData}
        emptyMessage="Không có dữ liệu danh mục"
        options={chartOptions}
      />
    </div>
  );
}; 