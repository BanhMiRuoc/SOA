import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Clock, CheckCircle2, ChefHat, Coffee, Wine, AlignLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu
interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  isSpicy: boolean;
  kitchenType: 'HOT_KITCHEN' | 'COLD_KITCHEN' | 'BAR';
}

interface OrderItem {
  id: number;
  menuItem: MenuItem;
  quantity: number;
  note: string;
  status: string;
  orderAt: string;
  order: {
    id: number;
    tableNumber: string;
    orderTime: string;
  };
}

interface Order {
  id: number;
  tableNumber?: string;
  orderTime: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  isPaid: boolean;
  table?: {
    id: number;
    tableNumber: string;
  };
}

// Interface cho thống kê OrderItem theo bàn
interface TableSummary {
  tableNumber: string;
  total: number;
  cooking: number;
  ready: number;
  served: number;
  timeElapsed: string;
}

export const KitchenPage = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingItemId, setProcessingItemId] = useState<number | null>(null);
  const [tableSummaries, setTableSummaries] = useState<TableSummary[]>([]);
  const pollingIntervalRef = useRef<number | null>(null);

  // Hàm để lấy dữ liệu đơn hàng từ API
  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const response = await axios.get('http://localhost:8080/api/orders/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('API Response:', response.data);
      
      // Lọc chỉ lấy các đơn hàng có trạng thái SERVING
      const filteredOrders = response.data.filter(
        (order: Order) => order.status === 'SERVING'
      );

      console.log('Filtered Orders:', filteredOrders);
      
      // Trích xuất tất cả OrderItem từ các đơn hàng và thêm thông tin bàn vào mỗi item
      const items = filteredOrders.flatMap((order: Order) => {
        // Xác định tableNumber từ nhiều nguồn khác nhau
        let tableNumber: string = 'Unknown';
        if (order.tableNumber) {
          tableNumber = order.tableNumber;
        } else if (order.table && order.table.tableNumber) {
          tableNumber = order.table.tableNumber;
        }
        
        if (!tableNumber || tableNumber === 'Unknown') {
          console.warn('Order without tableNumber:', order);
        }
        
        return order.items
          .filter(item => ['COOKING', 'READY', 'SERVED'].includes(item.status))
          .map(item => {
            console.log(`Processing item ${item.id} for table ${tableNumber}`);
            return {
              ...item,
              order: {
                id: order.id,
                tableNumber: tableNumber,
                orderTime: order.orderTime
              }
            };
          });
      });
      
      console.log('Processed items:', items);
      
      // Sắp xếp theo thời gian đặt hàng (cũ nhất lên đầu)
      items.sort((a: OrderItem, b: OrderItem) => {
        const aTime = a.orderAt ? new Date(a.orderAt).getTime() : new Date(a.order.orderTime).getTime();
        const bTime = b.orderAt ? new Date(b.orderAt).getTime() : new Date(b.order.orderTime).getTime();
        return aTime - bTime;
      });
      
      setOrderItems(items);
      
      // Tạo thống kê OrderItem theo bàn
      generateTableSummaries(items);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (showLoading) {
        toast.error('Không thể tải danh sách đơn hàng');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Tạo thống kê OrderItem theo bàn
  const generateTableSummaries = (items: OrderItem[]) => {
    const tableMap = new Map<string, TableSummary>();
    
    items.forEach(item => {
      const tableNumber = item.order.tableNumber;
      const orderTime = item.orderAt || item.order.orderTime;
      
      if (!tableMap.has(tableNumber)) {
        tableMap.set(tableNumber, {
          tableNumber,
          total: 0,
          cooking: 0,
          ready: 0,
          served: 0,
          timeElapsed: getTimeElapsed(orderTime)
        });
      }
      
      const summary = tableMap.get(tableNumber)!;
      summary.total += 1;
      
      if (item.status === 'COOKING') summary.cooking += 1;
      else if (item.status === 'READY') summary.ready += 1;
      else if (item.status === 'SERVED') summary.served += 1;
    });
    
    // Sắp xếp theo bàn có món đang chờ nhiều nhất
    const summaries = Array.from(tableMap.values()).sort((a, b) => {
      // Ưu tiên bàn có món đang chờ (COOKING) nhiều hơn
      const pendingA = a.cooking;
      const pendingB = b.cooking;
      if (pendingA !== pendingB) return pendingB - pendingA;
      
      // Nếu số món đang chờ bằng nhau, ưu tiên bàn có nhiều món READY hơn
      return b.ready - a.ready;
    });
    
    setTableSummaries(summaries);
  };

  // Thiết lập polling tự động cập nhật dữ liệu
  useEffect(() => {
    // Tải dữ liệu ban đầu
    fetchOrders();
    
    // Thiết lập polling mỗi 15 giây
    pollingIntervalRef.current = window.setInterval(() => {
      fetchOrders(false);
    }, 15000);
    
    // Dọn dẹp khi component unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Cập nhật trạng thái của OrderItem
  const updateOrderItemStatus = async (orderItemId: number, newStatus: string) => {
    try {
      setProcessingItemId(orderItemId);
      
      await axios.put(`http://localhost:8080/api/orderItems/${orderItemId}/status`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Cập nhật state cục bộ
      setOrderItems(prev => prev.map(item => 
        item.id === orderItemId ? { ...item, status: newStatus } : item
      ));
      
      toast.success('Đã cập nhật trạng thái món ăn');
      
      // Cập nhật lại thống kê
      generateTableSummaries(
        orderItems.map(item => 
          item.id === orderItemId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating order item status:', error);
      toast.error('Không thể cập nhật trạng thái món ăn');
    } finally {
      setProcessingItemId(null);
    }
  };

  // Lấy màu badge theo trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'COOKING':
        return 'bg-blue-500';
      case 'READY':
        return 'bg-green-500';
      case 'SERVED':
        return 'bg-purple-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Lấy icon theo loại nhà bếp
  const getKitchenIcon = (kitchenType: string) => {
    switch (kitchenType) {
      case 'HOT_KITCHEN':
        return <ChefHat className="h-4 w-4" />;
      case 'COLD_KITCHEN':
        return <Coffee className="h-4 w-4" />;
      case 'BAR':
        return <Wine className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Tính thời gian đã trôi qua từ khi đặt hàng
  const getTimeElapsed = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffInMs = now.getTime() - time.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    
    if (diffInMins < 60) {
      return `${diffInMins} phút`;
    } else {
      const hours = Math.floor(diffInMins / 60);
      const mins = diffInMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  // Lọc các món ăn theo bàn
  const filterItemsByTable = (tableNumber: string) => {
    return orderItems.filter(item => item.order.tableNumber === tableNumber);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center mb-3 py-2 border-b">
        <h1 className="text-2xl font-bold">Quản lý nhà bếp</h1>
        <Button onClick={() => fetchOrders(true)} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex h-[calc(100vh-80px)] gap-3">
        {/* Sidebar hiển thị thống kê theo bàn */}
        <div className="w-[300px] flex-shrink-0 overflow-auto border-r pr-3">
          <div className="sticky top-0 bg-white pb-2 mb-2 border-b">
            <h2 className="font-semibold text-sm flex items-center gap-1 mb-2">
              <AlignLeft className="h-4 w-4" /> Thống kê theo bàn
            </h2>
          </div>
          
          {loading && tableSummaries.length === 0 ? (
            <div className="flex justify-center items-center h-24">
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          ) : tableSummaries.length === 0 ? (
            <div className="flex justify-center items-center h-24">
              <p className="text-sm text-muted-foreground">Không có bàn nào đang sử dụng</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tableSummaries.map(summary => (
                <Card 
                  key={summary.tableNumber} 
                  className={`border ${summary.cooking > 0 ? 'border-blue-300 bg-blue-50' : 
                              summary.ready > 0 ? 'border-green-300 bg-green-50' : 
                              'border-gray-200'}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">Bàn {summary.tableNumber}</h3>
                      <Badge variant="outline" className="text-xs">
                        {summary.timeElapsed}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div className="flex flex-col items-center bg-blue-100 p-1.5 rounded-sm">
                        <span className="font-semibold text-blue-700">{summary.cooking}</span>
                        <span className="text-blue-700">Đang nấu</span>
                      </div>
                      <div className="flex flex-col items-center bg-green-100 p-1.5 rounded-sm">
                        <span className="font-semibold text-green-700">{summary.ready}</span>
                        <span className="text-green-700">Sẵn sàng</span>
                      </div>
                      <div className="flex flex-col items-center bg-purple-100 p-1.5 rounded-sm">
                        <span className="font-semibold text-purple-700">{summary.served}</span>
                        <span className="text-purple-700">Đã phục vụ</span>
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Tổng số món:</span>
                      <Badge>{summary.total}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Khu vực chính hiển thị danh sách món */}
        <div className="flex-1 overflow-auto">
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách món đang chờ chế biến</CardTitle>
                <Badge variant="outline">
                  {orderItems.filter(item => item.status === 'COOKING').length} món
                </Badge>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {loading ? (
                <div className="flex justify-center items-center h-24">
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : orderItems.filter(item => item.status === 'COOKING').length === 0 ? (
                <div className="flex justify-center items-center h-24">
                  <p className="text-muted-foreground">Không có món ăn nào đang chờ chế biến</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {orderItems
                    .filter(item => item.status === 'COOKING')
                    .map(item => (
                      <div 
                        key={item.id} 
                        className="border border-blue-300 bg-blue-50 p-3 rounded-md transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium line-clamp-1">
                              {item.quantity}x {item.menuItem.name}
                              {item.menuItem.isSpicy && ' 🌶️'}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Badge variant="outline" className="text-xs px-1.5 py-0 flex items-center gap-1">
                                {getKitchenIcon(item.menuItem.kitchenType)}
                                {item.menuItem.kitchenType === 'HOT_KITCHEN' ? 'Bếp nóng' : 
                                 item.menuItem.kitchenType === 'COLD_KITCHEN' ? 'Bếp lạnh' : 'Quầy bar'}
                              </Badge>
                            </div>
                          </div>
                          <Badge className={getStatusColor(item.status)}>
                            Đang chế biến
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1 font-semibold">
                            <span>Bàn {item.order.tableNumber}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {getTimeElapsed(item.orderAt || item.order.orderTime)}
                            </span>
                          </div>
                          {item.note && (
                            <p className="mt-1 line-clamp-2">Ghi chú: {item.note}</p>
                          )}
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full mt-1"
                          disabled={processingItemId === item.id}
                          onClick={() => updateOrderItemStatus(item.id, 'READY')}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Hoàn thành
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách món đã sẵn sàng phục vụ</CardTitle>
                <Badge variant="outline" className="bg-green-50">
                  {orderItems.filter(item => item.status === 'READY').length} món
                </Badge>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {loading ? (
                <div className="flex justify-center items-center h-24">
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : orderItems.filter(item => item.status === 'READY').length === 0 ? (
                <div className="flex justify-center items-center h-24">
                  <p className="text-muted-foreground">Không có món ăn nào sẵn sàng phục vụ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {orderItems
                    .filter(item => item.status === 'READY')
                    .map(item => (
                      <div 
                        key={item.id} 
                        className="border border-green-500 bg-green-50 p-3 rounded-md transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium line-clamp-1">
                              {item.quantity}x {item.menuItem.name}
                              {item.menuItem.isSpicy && ' 🌶️'}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <span className="font-semibold">Bàn {item.order.tableNumber}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="h-3 w-3" />
                                {getTimeElapsed(item.orderAt || item.order.orderTime)}
                              </span>
                            </div>
                            {item.note && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">Ghi chú: {item.note}</p>
                            )}
                          </div>
                          <Badge className={getStatusColor(item.status)}>
                            Sẵn sàng
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Món đã phục vụ gần đây</CardTitle>
                <Badge variant="outline" className="bg-purple-50">
                  {orderItems.filter(item => item.status === 'SERVED')
                    .slice(0, 8).length} món
                </Badge>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {loading ? (
                <div className="flex justify-center items-center h-16">
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : orderItems.filter(item => item.status === 'SERVED').length === 0 ? (
                <div className="flex justify-center items-center h-16">
                  <p className="text-muted-foreground">Không có món ăn nào mới phục vụ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                  {orderItems
                    .filter(item => item.status === 'SERVED')
                    .slice(0, 12) // Giới hạn số lượng hiển thị
                    .map(item => (
                      <div 
                        key={item.id} 
                        className="border border-purple-300 bg-purple-50 opacity-80 p-2 rounded-md"
                      >
                        <div className="flex flex-col">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium line-clamp-1">
                              {item.quantity}x {item.menuItem.name}
                            </h3>
                            <Badge className="scale-75 origin-right" variant="outline">Bàn {item.order.tableNumber}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {getTimeElapsed(item.orderAt || item.order.orderTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KitchenPage;