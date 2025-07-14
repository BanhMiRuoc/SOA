import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderItem {
  id: number;
  tableNumber: string;
  orderTime: string;
  paymentTime: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
}

interface OrderTableProps {
  orders: OrderItem[];
  formatCurrency: (amount: number) => string;
  formatDateTime: (dateString: string) => string;
  getPaymentMethodLabel: (method: string) => string;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  formatCurrency,
  formatDateTime,
  getPaymentMethodLabel
}) => {
  const [sortBy, setSortBy] = useState<'time' | 'revenue'>('time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Hàm sắp xếp danh sách đơn hàng
  const getSortedOrders = () => {
    if (!orders?.length) return [];
    
    const sortedOrders = [...orders];
    
    if (sortBy === 'time') {
      sortedOrders.sort((a, b) => {
        const timeA = new Date(a.paymentTime).getTime();
        const timeB = new Date(b.paymentTime).getTime();
        return sortDirection === 'desc' ? timeB - timeA : timeA - timeB;
      });
    } else {
      sortedOrders.sort((a, b) => {
        return sortDirection === 'desc' ? 
          b.totalAmount - a.totalAmount : 
          a.totalAmount - b.totalAmount;
      });
    }
    
    return sortedOrders;
  };

  // Hàm xử lý thay đổi trường sắp xếp
  const handleSortChange = (newSortBy: 'time' | 'revenue') => {
    if (newSortBy === sortBy) {
      // Nếu đang sắp xếp theo cùng trường, đảo chiều sắp xếp
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Nếu đổi trường sắp xếp, mặc định là giảm dần (desc)
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };

  // Tạo className cho tiêu đề cột sắp xếp
  const getSortHeaderClass = (headerSortBy: 'time' | 'revenue') => {
    return `cursor-pointer flex items-center ${sortBy === headerSortBy ? 'text-primary font-bold' : ''}`;
  };

  // Hiển thị mũi tên sắp xếp
  const getSortArrow = (headerSortBy: 'time' | 'revenue') => {
    if (sortBy !== headerSortBy) return null;
    return sortDirection === 'desc' ? ' ↓' : ' ↑';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử đơn hàng</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đơn #</TableHead>
                  <TableHead>Bàn</TableHead>
                  <TableHead onClick={() => handleSortChange('time')}>
                    <div className={getSortHeaderClass('time')}>
                      Thời gian {getSortArrow('time')}
                    </div>
                  </TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead className="text-right" onClick={() => handleSortChange('revenue')}>
                    <div className={getSortHeaderClass('revenue')}>
                      Tổng tiền {getSortArrow('revenue')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSortedOrders().map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.tableNumber}</TableCell>
                    <TableCell>{formatDateTime(order.paymentTime)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Không có đơn hàng trong khoảng thời gian này
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 