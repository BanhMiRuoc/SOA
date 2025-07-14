import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Order, Table as TableType } from '@/types/table.types';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTable: TableType | null;
  orders: Order[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export const OrderDialog: React.FC<OrderDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedTable,
  orders,
  isLoading,
  onRefresh
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [finishingOrder, setFinishingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePayment = (order: Order) => {
    setSelectedOrder(order);
    setShowPaymentConfirm(true);
  };

  const processPayment = async () => {
    if (!selectedOrder) return;

    setProcessingPayment(true);
    setErrorMessage(null);
    try {
      const response = await fetch('http://localhost:8080/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          paymentMethod: paymentMethod
        })
      });

      if (!response.ok) {
        throw new Error('Lỗi khi xử lý thanh toán');
      }

      toast.success('Thanh toán thành công', {
        description: `Đơn hàng #${selectedOrder.id} đã được thanh toán bằng ${paymentMethod === 'CASH' ? 'tiền mặt' : 'thẻ'}.`,
      });

      // Đóng dialog xác nhận
      setShowPaymentConfirm(false);
      
      // Làm mới dữ liệu đơn hàng (không đóng dialog)
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Lỗi thanh toán:', error);
      setErrorMessage('Không thể xử lý thanh toán. Vui lòng thử lại sau.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Hàm để kết thúc đơn hàng
  const finishOrder = async (orderId: number) => {
    if (!orderId || !selectedTable) return;
    
    setErrorMessage(null);

    // Kiểm tra xem có OrderItem nào đang ở trạng thái PENDING hoặc COOKING không
    const hasUnfinishedItems = orders[0]?.items?.some(item => 
      item.status === 'PENDING' || item.status === 'COOKING'
    );

    if (hasUnfinishedItems) {
      setErrorMessage('Vẫn còn món ăn đang chờ chuẩn bị hoặc đang chuẩn bị. Vui lòng đợi hoàn thành tất cả món ăn.');
      return;
    }

    setFinishingOrder(true);
    try {
      // Cập nhật trạng thái đơn hàng sang PAID
      const orderResponse = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'PAID'
        })
      });

      if (!orderResponse.ok) {
        // Thử đọc lỗi từ response
        try {
          const errorData = await orderResponse.json();
          throw new Error(errorData.message || 'Lỗi khi kết thúc đơn hàng');
        } catch (e) {
          try {
            const errorText = await orderResponse.text();
            throw new Error(errorText || 'Lỗi khi kết thúc đơn hàng');
          } catch (textError) {
            throw new Error('Lỗi khi kết thúc đơn hàng');
          }
        }
      }

      // Sau khi cập nhật Order thành công, đóng bàn
      const tableResponse = await fetch(`http://localhost:8080/api/tables/${selectedTable.id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!tableResponse.ok) {
        throw new Error('Đã cập nhật trạng thái đơn hàng nhưng không thể đóng bàn');
      }

      toast.success('Đơn hàng đã kết thúc thành công', {
        description: `Đơn hàng #${orderId} đã được đánh dấu là hoàn thành và bàn đã được đóng.`,
      });

      // Không đóng dialog, chỉ làm mới dữ liệu
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Lỗi kết thúc đơn hàng:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Không thể kết thúc đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setFinishingOrder(false);
    }
  };

  // Hàm lấy màu sắc cho trạng thái OrderItem
  const getOrderItemStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500 text-white';
      case 'COOKING':
        return 'bg-orange-500 text-white';
      case 'READY':
        return 'bg-blue-500 text-white';
      case 'SERVED':
        return 'bg-green-500 text-white';
      case 'CANCELLED':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTable && `Đơn hàng - Bàn ${selectedTable.tableNumber}`}
            </DialogTitle>
            <DialogDescription>
              Thông tin đơn hàng hiện tại
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <p>Đang tải...</p>
              </div>
            ) : orders.length === 0 ? (
              <p>Không có đơn hàng nào.</p>
            ) : (
              <ScrollArea className="h-[60vh] pr-3">
                <>
                  {orders.map((order, index) => (
                    <div key={order.id} className={index > 0 ? "mt-8 pt-8 border-t" : ""}>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                          <p className="font-medium">#{order.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Thời gian:</p>
                          <p className="font-medium">{new Date(order.orderTime).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Trạng thái:</p>
                          <Badge className={
                            order.status === 'PENDING' ? 'bg-yellow-500' :
                            order.status === 'SERVING' ? 'bg-blue-500' :
                            order.status === 'PAID' ? 'bg-green-600' :
                            'bg-gray-500'
                          }>
                            {order.status === 'PENDING' ? 'Đang chờ' :
                             order.status === 'SERVING' ? 'Đang phục vụ' :
                             order.status === 'PAID' ? 'Đã thanh toán' :
                             order.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Thanh toán:</p>
                          <Badge className={order.isPaid ? 'bg-green-500' : 'bg-red-500'}>
                            {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Danh sách món</h3>
                        <Table>
                          <thead>
                            <tr>
                              <th className="text-left">Món</th>
                              <th className="text-center">Số lượng</th>
                              <th className="text-center">Đơn giá</th>
                              <th className="text-center">Trạng thái</th>
                              <th className="text-right">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items?.map((item) => (
                              <tr key={item.id}>
                                <td className="py-2">
                                  <div>
                                    <div className="font-medium">{item.menuItemName}</div>
                                    {item.note && <div className="text-xs text-muted-foreground">{item.note}</div>}
                                  </div>
                                </td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-center">{item.price?.toLocaleString()}đ</td>
                                <td className="text-center">
                                  <Badge className={getOrderItemStatusColor(item.status)}>
                                    {item.status === 'PENDING' ? 'Đang chờ' :
                                     item.status === 'COOKING' ? 'Đang chuẩn bị' :
                                     item.status === 'READY' ? 'Đã sẵn sàng' :
                                     item.status === 'SERVED' ? 'Đã phục vụ' :
                                     item.status === 'CANCELLED' ? 'Đã hủy' :
                                     item.status}   
                                  </Badge>
                                </td>
                                <td className="text-right">{(item.price * item.quantity).toLocaleString()}đ</td>
                              </tr>
                            ))}
                            <tr className="border-t">
                              <td colSpan={4} className="py-2 text-right font-medium">Tổng tiền:</td>
                              <td className="text-right font-bold">{order.totalAmount?.toLocaleString()}đ</td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </>
              </ScrollArea>
            )}
          </div>
          
          {errorMessage && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <p>{errorMessage}</p>
            </div>
          )}
          
          <DialogFooter className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
            {orders.length > 0 && orders[0].isPaid && orders[0].status !== 'PAID' && (
              <Button 
                onClick={() => finishOrder(orders[0].id)}
                disabled={finishingOrder || !orders[0].isPaid}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {finishingOrder ? 'Đang xử lý...' : 'Kết Thúc Order'}
              </Button>
            )}
            {orders.length > 0 && !orders[0].isPaid && orders[0].status != 'PENDING' && (
              <Button 
                onClick={() => handlePayment(orders[0])}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Thanh toán
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showPaymentConfirm} onOpenChange={setShowPaymentConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thanh toán</AlertDialogTitle>
            <AlertDialogDescription>
              Xác nhận thanh toán đơn hàng #{selectedOrder?.id} với tổng tiền {selectedOrder?.totalAmount?.toLocaleString()}đ
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Phương thức thanh toán:</label>
            <Select defaultValue="CASH" onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phương thức thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Tiền mặt</SelectItem>
                <SelectItem value="CREDIT_CARD">Thẻ tín dụng/Thẻ ghi nợ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {errorMessage && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <p>{errorMessage}</p>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingPayment}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                processPayment();
              }}
              disabled={processingPayment}
              className="bg-green-600 hover:bg-green-700"
            >
              {processingPayment ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};