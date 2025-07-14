import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, CheckCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
interface OrderItemResponse {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  note: string;
  status: string;            
  price: number;
  orderAt: string;
}

interface OrderResponse {
  id: number;
  tableNumber: string;
  orderTime: string;
  status: string;
  totalAmount: number;
  isPaid: boolean;
  items: OrderItemResponse[];
  waiterId?: number;
  waiterName?: string;
  needAssistance?: boolean;
}

interface Table {
  id: number;
  tableNumber: string;
  capacity: number;
  status: 'CLOSED' | 'OCCUPIED' | 'OPENED'
  zone: string;
  currentWaiterId: number | null;
  waiterName: string | null;
}

export const HandleOrdersPage = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [processingAssistanceRequest, setProcessingAssistanceRequest] = useState<number | null>(null);
  // Thêm refs để theo dõi polling intervals
  const tablePollingIntervalRef = useRef<number | null>(null);
  const orderPollingIntervalRef = useRef<number | null>(null);
  const isInitialLoad = useRef(true);

  // Fetch tất cả các bàn
  const fetchTables = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await axios.get('http://localhost:8080/api/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      if (showLoading) {
        toast.error('Không thể tải danh sách bàn');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Fetch order hiện tại của bàn được chọn
  const fetchOrderForTable = async (table: Table, showLoading = true) => {
    try {
      if (showLoading) {
        setLoadingOrder(true);
        setCurrentOrder(null); // Xóa order hiện tại khi chọn bàn mới
      }
      
      const response = await axios.get(`http://localhost:8080/api/orders/customer/${table.tableNumber}`);
      setCurrentOrder(response.data);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      
      if (error.response?.status === 204 || error.response?.status === 404) {
        // Không có order nào cho bàn này
        setCurrentOrder(null);
      } else if (showLoading) {
        toast.error('Không thể tải thông tin đơn hàng');
      }
    } finally {
      if (showLoading) {
        setLoadingOrder(false);
      }
    }
  };

  // Cập nhật trạng thái của một OrderItem
  const updateOrderItemStatus = async (orderItemId: number, newStatus: string) => {
    try {
      setUpdatingItemId(orderItemId);
      await axios.put(`http://localhost:8080/api/orderItems/${orderItemId}/status`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Cập nhật state cục bộ
      if (currentOrder) {
        setCurrentOrder({
          ...currentOrder,
          items: currentOrder.items.map(item => 
            item.id === orderItemId ? { ...item, status: newStatus } : item
          )
        });
      }
      
      toast.success('Đã cập nhật trạng thái món ăn');
    } catch (error) {
      console.error('Error updating order item status:', error);
      toast.error('Không thể cập nhật trạng thái món ăn');
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Thêm phương thức xử lý yêu cầu hỗ trợ
  const handleAssistanceResponse = async (orderId: number) => {
    try {
      setProcessingAssistanceRequest(orderId);
      
      await axios.put(`http://localhost:8080/api/orders/${orderId}/assistance`, 
        null,
        {
          params: { needAssistance: false },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Cập nhật state cục bộ
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder({
          ...currentOrder,
          needAssistance: false
        });
      }
      
      // Cập nhật danh sách bàn
      fetchTables(false);
      
      toast.success('Đã xử lý yêu cầu hỗ trợ');
    } catch (error) {
      console.error('Error responding to assistance request:', error);
      toast.error('Không thể xử lý yêu cầu hỗ trợ');
    } finally {
      setProcessingAssistanceRequest(null);
    }
  };

  // Thiết lập polling cho danh sách bàn
  const setupPolling = () => {
    // Xóa polling intervals cũ nếu tồn tại
    if (tablePollingIntervalRef.current) {
      clearInterval(tablePollingIntervalRef.current);
    }
    
    // Thiết lập polling cho danh sách bàn (5 giây)
    tablePollingIntervalRef.current = window.setInterval(() => {
      fetchTables(false); // Không hiển thị loading khi polling
    }, 5000);
    
    return () => {
      if (tablePollingIntervalRef.current) {
        clearInterval(tablePollingIntervalRef.current);
      }
      if (orderPollingIntervalRef.current) {
        clearInterval(orderPollingIntervalRef.current);
      }
    };
  };

  // Thiết lập polling cho đơn hàng theo bàn đã chọn
  const setupOrderPolling = (table: Table) => {
    // Xóa polling interval cũ nếu tồn tại
    if (orderPollingIntervalRef.current) {
      clearInterval(orderPollingIntervalRef.current);
    }
    
    // Thiết lập polling cho đơn hàng (5 giây)
    orderPollingIntervalRef.current = window.setInterval(() => {
      fetchOrderForTable(table, false); // Không hiển thị loading khi polling
    }, 5000);
  };

  useEffect(() => {
    // Tải dữ liệu ban đầu và thiết lập polling
    fetchTables(isInitialLoad.current);
    isInitialLoad.current = false;
    
    // Thiết lập polling và dọn dẹp khi component unmount
    return setupPolling();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      // Tải đơn hàng ban đầu và thiết lập polling
      fetchOrderForTable(selectedTable);
      setupOrderPolling(selectedTable);
    } else if (orderPollingIntervalRef.current) {
      // Xóa polling nếu không có bàn nào được chọn
      clearInterval(orderPollingIntervalRef.current);
      orderPollingIntervalRef.current = null;
    }
    
    // Dọn dẹp khi component unmount hoặc selectedTable thay đổi
    return () => {
      if (orderPollingIntervalRef.current) {
        clearInterval(orderPollingIntervalRef.current);
        orderPollingIntervalRef.current = null;
      }
    };
  }, [selectedTable]);

  // Manual refresh button handler (shows loading)
  const handleManualRefresh = () => {
    fetchTables(true); // Force loading UI khi refresh thủ công
    if (selectedTable) {
      fetchOrderForTable(selectedTable, true);
    }
  };

  // Nhóm các bàn theo khu vực
  const tablesByZone = tables.reduce<Record<string, Table[]>>((acc, table) => {
    if (!acc[table.zone]) {
      acc[table.zone] = [];
    }
    acc[table.zone].push(table);
    return acc;
  }, {});

  // Xác định màu sắc hiển thị cho trạng thái OrderItem
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'COOKING':
        return 'bg-blue-500';
      case 'SERVING':
        return 'bg-blue-500';
      case 'READY':
        return 'bg-green-500';
      case 'SERVED':
        return 'bg-green-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Lấy danh sách trạng thái tiếp theo cho OrderItem
  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING':
        return [{ value: 'COOKING', label: 'Đang nấu' }];
      case 'COOKING':
        return [{ value: 'READY', label: 'Sẵn sàng phục vụ' }];
      case 'READY':
        return [{ value: 'SERVED', label: 'Đã phục vụ' }];
      default:
        return [];
    }
  };

  // Xác định màu sắc hiển thị cho trạng thái bàn
  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 border-green-300 text-green-700';
      case 'OCCUPIED':
        return 'bg-red-100 border-red-300 text-red-700';
      case 'OPENED':
        return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'MAINTENANCE':
        return 'bg-gray-100 border-gray-300 text-gray-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };
  console.log(currentOrder);
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Xử Lý Món</h1>
        <Button onClick={handleManualRefresh} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-row h-full gap-6">
        {/* Cột danh sách bàn */}
        <div className="w-1/3">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>Danh sách bàn</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto max-h-[calc(100vh-200px)]">
              {loading ? (
                <div className="py-4 text-center">Đang tải danh sách bàn...</div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(tablesByZone).map(([zone, zoneTables]) => (
                    <div key={zone}>
                      <h3 className="font-semibold text-sm text-gray-500 mb-2">Khu vực {zone}</h3>
                      <div className="space-y-2">
                        {zoneTables.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber)).map((table) => (
                          <div
                            key={table.id}
                            className={`p-3 border rounded-md cursor-pointer transition-colors ${
                              selectedTable?.id === table.id
                                ? 'border-4'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${getTableStatusColor(table.status)}`}
                            onClick={() => setSelectedTable(table)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">Bàn {table.tableNumber}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={table.status === 'OCCUPIED' ? 'default' : 'outline'}>
                                  {table.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cột chi tiết Order */}
        <div className="w-2/3">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>
                {selectedTable ? `Chi tiết đơn hàng - Bàn ${selectedTable.tableNumber}` : 'Chọn một bàn để xem chi tiết'}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto max-h-[calc(100vh-200px)]">
              {!selectedTable ? (
                <div className="py-4 text-center text-gray-500">Vui lòng chọn một bàn từ danh sách bên trái</div>
              ) : loadingOrder ? (
                <div className="py-4 text-center">Đang tải thông tin đơn hàng...</div>
              ) : !currentOrder ? (
                <div className="py-4 text-center text-gray-500">Bàn này hiện không có đơn hàng</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Thời gian đặt: {new Date(currentOrder.orderTime).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Trạng thái: <Badge className={getStatusColor(currentOrder.status)}>
                          {currentOrder.status === 'PAID' ? 'Đã thanh toán' : 
                           currentOrder.status === 'PENDING' ? 'Đang chờ' : 
                           currentOrder.status === 'SERVING' ? 'Đang phục vụ' : 
                           currentOrder.status}
                        </Badge>
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Thanh toán: <Badge className={currentOrder.isPaid ? 'bg-green-500' : 'bg-red-500'}>
                            {currentOrder.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Phục vụ: {currentOrder.waiterName || selectedTable?.waiterName || 'Chưa có nhân viên phục vụ'}
                      </p>
                      {currentOrder.needAssistance && (
                        <div className="mt-2">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex items-center gap-2"
                            onClick={() => handleAssistanceResponse(currentOrder.id)}
                            disabled={processingAssistanceRequest === currentOrder.id}
                          >
                            <Bell className="h-4 w-4 animate-pulse" />
                            {processingAssistanceRequest === currentOrder.id 
                              ? 'Đang xử lý...' 
                              : 'Khách yêu cầu hỗ trợ'}
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Tổng tiền:</p>
                      <p className="font-semibold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                          currentOrder.totalAmount
                        )}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Danh sách món</h3>
                    {currentOrder.items.map((item) => (
                      <div key={item.id} className="border p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h4 className="font-medium">
                              {item.quantity}x {item.menuItemName}
                            </h4>
                            {item.note && (
                              <p className="text-sm text-muted-foreground">Ghi chú: {item.note}</p>
                            )}
                            {item.orderAt && item.status !== 'SERVED' && (
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant="destructive" className="text-xs px-2 py-0">
                                  Đặt được {Math.floor((new Date().getTime() - new Date(item.orderAt).getTime()) / 60000)} phút
                                </Badge>
                              </div>
                            )}
                          </div>
                          <Badge className={getStatusColor(item.status)}>
                            {   item.status === 'PENDING' ? 'Đang chờ' :
                             item.status === 'COOKING' ? 'Đang nấu' :
                             item.status === 'READY' ? 'Sẵn sàng phục vụ' :
                             item.status === 'SERVED' ? 'Đã phục vụ' :
                             item.status}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          <p className="text-sm">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                              item.price * item.quantity
                            )}
                          </p>

                          {getNextStatusOptions(item.status).length > 0 && (
                            <div className="flex items-center gap-2">
                             
                              {/* Hiển thị nút "Đánh dấu đã phục vụ" cho trạng thái COOKING và READY */}
                              {(item.status === 'COOKING' || item.status === 'READY') && (
                                <Button
                                  size="sm"
                                  className="ml-2"
                                  onClick={() => updateOrderItemStatus(item.id, 'SERVED')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" /> Đánh dấu đã phục vụ
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HandleOrdersPage;