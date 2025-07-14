import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList } from 'lucide-react';
import { Table, Waiter } from '@/types/table.types';

interface TableCardProps {
  table: Table;
  waiters: Waiter[];
  isSelected: boolean;
  isWaiterOrManager: boolean;
  confirmSuccess?: boolean;
  onSelect: (tableId: number) => void;
  onViewOrder: (tableId: number) => void;
  onStatusChange: (table: Table, action: 'open' | 'occupy' | 'close') => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  waiters,
  isSelected,
  isWaiterOrManager,
  onSelect,
  onViewOrder,
  onStatusChange
}) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPENED':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'OCCUPIED':
        return 'bg-red-600';
      case 'CLOSED':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getBorderColor = (status: string) => {
    switch(status) {
      case 'OPENED':
        return 'ring-blue-600';
      case 'OCCUPIED':
        return 'ring-red-600';
      case 'CLOSED':
        return 'ring-gray-600';
      default:
        return 'ring-gray-600';
    }
  };
  
  const getBackgroundColor = (status: string) => {
    switch(status) {
      case 'OPENED':
        return 'bg-blue-50';
      case 'OCCUPIED':
        return 'bg-red-50';
      case 'CLOSED':
        return 'bg-gray-50';
      default:
        return '';
    }
  };
  
  // Loại bỏ console log không cần thiết
  const waiterName = table.currentWaiterId 
    ? waiters.find(w => w.id === Number(table.currentWaiterId))?.name || "" 
    : "";

  return (
    <Card 
      key={table.id} 
      className={`overflow-hidden cursor-pointer transition-all border-2 border-gray-300 ${
        isSelected ? `ring-2 ${getBorderColor(table.status)}` : getBorderColor(table.status)
      } ${getBackgroundColor(table.status)}`}
      onClick={() => onSelect(table.id)}
    >
      <CardHeader className="p-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Bàn {table.tableNumber}</CardTitle>
          <Badge className={getStatusColor(table.status)}>
            {table.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Khu vực:</span>
            <div className="font-medium">{table.zone}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Sức chứa:</span>
            <div className="font-medium">{table.capacity} người</div>
          </div>
          <div>
            <span className="text-muted-foreground">Phục vụ:</span>
            <div className="font-medium truncate min-h-5">{waiterName || "\u00A0"}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Thời gian:</span>
            <div className="font-medium">
              {table.occupiedAt ? new Date(table.occupiedAt).toLocaleTimeString() : ""}
            </div>
          </div>
        </div>

        {isWaiterOrManager && (
          <div className="mt-3 space-y-2">
            <div className="w-full">
              <Select
                value={table.status}
                onValueChange={(value) => {
                  const action = value === "OPENED" ? "open" :
                                value === "CLOSED" ? "close" : "";
                  if (action && value !== table.status) {
                    onStatusChange(table, action as any);
                  }
                }}
                disabled={table.status === "OCCUPIED"}
                // Select sẽ tự động hiển thị đúng giá trị từ props.table khi component render lại
                // Không cần xử lý đặc biệt vì value={table.status} sẽ hiển thị giá trị hiện tại của bàn từ server
              >
                <SelectTrigger className={`w-full text-xs h-8 ${table.status === "OCCUPIED" ? "opacity-75 cursor-not-allowed" : ""}`}>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLOSED" className={table.status === "CLOSED" ? "bg-gray-600/20" : ""}>
                    Đóng (CLOSED)
                  </SelectItem>
                  <SelectItem value="OPENED" className={table.status === "OPENED" ? "bg-blue-600/20" : ""}>
                    Mở (OPENED)
                  </SelectItem>
                  {table.status === "OCCUPIED" && (
                    <SelectItem value="OCCUPIED" className="bg-red-600/20">
                      Có khách (OCCUPIED)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 w-full h-8 flex gap-1 items-center justify-center text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onViewOrder(table.id);
              }}
            >
              <ClipboardList className="h-3 w-3" />
              <span>Order</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};