import { useState, useEffect } from 'react';
import { useTableStore } from '@/store/tableStore';
import { formatCurrency } from '@/lib/utils';
import { ClipboardList, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  note: string;
  status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED' | 'CANCELLED' | 'OUT_OF_STOCK';
  price: number;
}

interface Order {
  id: number;
  tableNumber: string;
  orderTime: string;
  status: string;
  totalAmount: number;
  isPaid: boolean;
  items: OrderItem[];
}

interface ApiResponse {
  result: string;
  message: string;
  data: Order | null;
}

interface CurrentOrderDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CurrentOrderDialog({ open, onClose }: CurrentOrderDialogProps) {
  const { tableNumber } = useTableStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (open) {
      fetchCurrentOrder();
    }
  }, [open, tableNumber]);
  
  const fetchCurrentOrder = async () => {
    if (!tableNumber || !open) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8080/api/orders/customer/current?tableNumber=${tableNumber}`);
      const data: ApiResponse = await response.json();
      
      if (data.result === 'SUCCESS') {
        if (data.data) {
          setOrder(data.data);
        } else {
          setOrder(null);
        }
      } else {
        setError(data.message || 'Không thể lấy thông tin đơn hàng');
      }
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng:', error);
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-500 text-[10px] font-medium py-0 h-5">Đang chờ</Badge>;
      case 'COOKING':
        return <Badge className="bg-orange-500 text-[10px] font-medium py-0 h-5">Đang chế biến</Badge>;
      case 'READY':
        return <Badge className="bg-green-500 text-[10px] font-medium py-0 h-5">Sẵn sàng phục vụ</Badge>;
      case 'SERVED':
        return <Badge className="bg-blue-500 text-[10px] font-medium py-0 h-5">Đã phục vụ</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-500 text-[10px] font-medium py-0 h-5">Đã hủy</Badge>;
      case 'OUT_OF_STOCK':
        return <Badge className="bg-gray-500 text-[10px] font-medium py-0 h-5">Hết nguyên liệu</Badge>;
      default:
        return <Badge className="bg-gray-500 text-[10px] font-medium py-0 h-5">{status}</Badge>;
    }
  };
  
  if (!open) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white w-[90%] max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <ClipboardList className="h-5 w-5" />
              Đơn hàng hiện tại
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Bàn {tableNumber} {order && `| ${new Date(order.orderTime).toLocaleString('vi-VN')}`}
            </DialogDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={fetchCurrentOrder}
            className="h-9 w-9 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <RefreshCw className="h-12 w-12 animate-spin text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-white">Đang tải đơn hàng...</h3>
          </div>
        ) : error ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-medium text-white">Không thể tải đơn hàng</h3>
            <p className="text-zinc-400 text-center mt-2">{error}</p>
            <Button
              onClick={fetchCurrentOrder} 
              className="mt-4 bg-zinc-800 hover:bg-zinc-700"
            >
              Thử lại
            </Button>
          </div>
        ) : !order ? (
          <div className="py-10 flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-zinc-700 mb-4" />
            <h3 className="text-lg font-medium text-zinc-400">Không có đơn hàng nào</h3>
            <p className="text-zinc-500 text-center mt-2">Bạn chưa đặt món hoặc đơn hàng đã được hoàn thành</p>
          </div>
        ) : (
          <>
            <div className="space-y-1 mb-2">
              <div className="text-sm text-zinc-400">Trạng thái đơn hàng</div>
              {getStatusBadge(order.status)}
            </div>
            
            <ScrollArea className="max-h-[50vh] w-full pr-4">
              <div className="flex flex-col gap-2">
                {order.items.map((item) => (
                  <div key={item.id} className="bg-zinc-800 border border-zinc-700 rounded-md p-2">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 items-center">
                            <span className="font-medium text-white">{item.menuItemName}</span>
                            <span className="text-xs text-zinc-400">x{item.quantity}</span>
                          </div>
                          <span className="font-medium text-white text-right">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-400">{formatCurrency(item.price)}/phần</span>
                            {item.note && (
                              <span className="text-xs text-zinc-500">"{item.note}"</span>
                            )}
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="border-t border-zinc-800 pt-4 mt-4">
              <div className="flex justify-between">
                <span className="text-zinc-400">Thành tiền:</span>
                <span className="font-bold text-lg text-red-500">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 