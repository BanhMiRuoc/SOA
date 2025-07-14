import React from 'react';
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

interface TopProductItem {
  menuItemId: number;
  menuItemName: string;
  category: string;
  price: number;
  quantitySold: number;
  totalSales: number;
}

interface TopProductsTableProps {
  products: TopProductItem[];
  formatCurrency: (amount: number) => string;
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({
  products,
  formatCurrency
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 món ăn bán chạy nhất</CardTitle>
      </CardHeader>
      <CardContent>
        {products && products.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Tên món</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Số lượng bán</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((item, index) => (
                  <TableRow key={item.menuItemId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.menuItemName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell>{item.quantitySold}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalSales)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Không có dữ liệu sản phẩm trong khoảng thời gian này
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 