import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardsProps {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topCategory: string;
  formatCurrency: (amount: number) => string;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalRevenue,
  totalOrders,
  averageOrderValue,
  topCategory,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Số đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Giá trị trung bình đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalOrders > 0 ? formatCurrency(averageOrderValue) : '0 ₫'}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topCategory || 'N/A'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 