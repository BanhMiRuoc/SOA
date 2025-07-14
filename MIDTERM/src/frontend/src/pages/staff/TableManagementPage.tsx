import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { UserRoles, User } from '@/types/user.types';
import { toast } from 'sonner';
import { Table, Waiter, Order } from '@/types/table.types';
import { TableZone } from '@/components/staff/TableZone';
import { OrderDialog } from '@/components/staff/OrderDialog';
import { AssignWaiterDialog } from '@/components/staff/AssignWaiterDialog';
import { ConfirmActionDialog } from '@/components/staff/ConfirmActionDialog';
import { RefreshCw } from 'lucide-react';

export const TableManagementPage = () => {
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'open' | 'occupy' | 'close' | 'assign'>('open');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  
  // State cho việc chọn bàn và nhân viên
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [selectedWaiter, setSelectedWaiter] = useState<Waiter | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // State cho việc chọn tất cả bàn trong khu vực
  const [selectedZones, setSelectedZones] = useState<string[]>([]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // State cho order và dialog hiển thị order
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Ref để giữ thông tin polling interval
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef<boolean>(false);
  const isFirstLoadRef = useRef<boolean>(true);

  // Memoize fetchTables để tránh recreate function mỗi khi component re-render
  const fetchTables = useCallback(async (showLoading: boolean = true) => {
    try {
    //   if (showLoading) {
    //     setLoading(true);
    //   }
      
      const response = await axios.get('http://localhost:8080/api/tables');
      setTables(response.data);
      
      // Nếu đang mở OrderDialog và có selectedTable, cập nhật thông tin currentOrders
      if (isOrderDialogOpen && selectedTable) {
        await silentFetchOrderForTable(selectedTable);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      if (isFirstLoadRef.current) {
        toast.error('Không thể tải danh sách bàn');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      isFirstLoadRef.current = false;
    }
  }, [isOrderDialogOpen, selectedTable]);

  // Polling function không hiển thị loading
  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;
    
    isPollingRef.current = true;
    pollingIntervalRef.current = setInterval(() => {
      fetchTables(false);
    }, 5000); // Poll mỗi 5 giây
    
    console.log('Polling started');
  }, [fetchTables]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      isPollingRef.current = false;
      console.log('Polling stopped');
    }
  }, []);

  // Thêm silent fetch cho orders
  const silentFetchOrderForTable = async (table: Table) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/orders/customer/${table.tableNumber}`);
      if (response.data) {
        setCurrentOrders([response.data]);
      } else {
        setCurrentOrders([]);
      }
    } catch (error) {
      console.error('Error in silent fetch order:', error);
      // Không hiện thông báo lỗi khi fetch ngầm
    }
  };

  // Hàm lấy danh sách nhân viên phục vụ
  const fetchWaiters = async () => {
    try {
      const response = await axios.get<User[]>('http://localhost:8080/api/users/active', {
        headers: {
          'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
        }
      });
      // Lọc người dùng vai trò WAITER, MANAGER, CASHIER và chuyển đổi sang kiểu Waiter
      const waitersList = response.data
        .filter((user: User) => user.role === UserRoles.WAITER || user.role === UserRoles.MANAGER || user.role === UserRoles.CASHIER)
        .map((user: User): Waiter => ({
          id: Number(user.id), // Chuyển đổi id từ string sang number
          name: user.name,
          email: user.email || ''
        }));
      setWaiters(waitersList);
    } catch (error) {
      console.error('Error fetching waiters:', error);
      toast.error('Không thể tải danh sách nhân viên');
    }
  };

  useEffect(() => {
    fetchTables(true);
    fetchWaiters();
    startPolling();
    
    // Cleanup khi unmount
    return () => {
      stopPolling();
    };
  }, [fetchTables, startPolling, stopPolling]);

  // Effect để xử lý khi mở/đóng OrderDialog
  useEffect(() => {
    if (isOrderDialogOpen) {
      // Khi mở dialog, tăng tần suất polling lên 3 giây
      stopPolling();
      pollingIntervalRef.current = setInterval(() => {
        if (selectedTable) {
          silentFetchOrderForTable(selectedTable);
        }
        fetchTables(false);
      }, 3000);
      isPollingRef.current = true;
    } else {
      // Khi đóng dialog, trở lại polling bình thường
      stopPolling();
      startPolling();
    }
  }, [isOrderDialogOpen, selectedTable, fetchTables, startPolling, stopPolling]);

  const handleActionClick = (table: Table, action: 'open' | 'occupy' | 'close' | 'assign') => {
    setSelectedTable(table);
    setActionType(action);
    setConfirmSuccess(false);
    setErrorMessage(null);
    setIsDialogOpen(true);
  };

  const executeTableAction = async () => {
    if (!selectedTable) {
      console.error('No table selected');
      return;
    }

    try {
      setIsSubmitting(true);
      let endpoint = '';
      let successMessage = '';

      switch (actionType) {
        case 'open':
          endpoint = `http://localhost:8080/api/tables/${selectedTable.id}/open`;
          successMessage = `Đã mở bàn ${selectedTable.tableNumber}`;
          break;
        case 'occupy':
          endpoint = `http://localhost:8080/api/tables/${selectedTable.id}/occupy`;
          successMessage = `Đã cập nhật bàn ${selectedTable.tableNumber} sang trạng thái Occupied`;
          break;
        case 'close':
          endpoint = `http://localhost:8080/api/tables/${selectedTable.id}/close`;
          successMessage = `Đã đóng bàn ${selectedTable.tableNumber}`;
          break;
        default:
          console.error('Invalid action type:', actionType);
          return;
      }

      let token = user?.token || localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        return;
      }

      const response = await axios.post(endpoint, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success(successMessage);
      setErrorMessage(null);
      setIsDialogOpen(false);
      await fetchTables(true);
    } catch (error: any) {
      console.error(`Error executing table action:`, error);
      if (error.response) {
        setErrorMessage(error.response.data?.message || error.response.data || 'Không thể thực hiện thao tác');
      } else if (error.request) {
        setErrorMessage('Không thể thực hiện thao tác');
      } else {
        setErrorMessage('Không thể thực hiện thao tác');
      }
      setConfirmSuccess(false);
      toast.error(errorMessage || 'Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isWaiterOrManager = user?.role === UserRoles.WAITER || user?.role === UserRoles.MANAGER || user?.role === UserRoles.CASHIER;

  // Hàm xử lý chọn/bỏ chọn bàn
  const handleTableSelect = (tableId: number) => {
    setSelectedTables(prev => {
      if (prev.includes(tableId)) {
        return prev.filter(id => id !== tableId);
      } else {
        return [...prev, tableId];
      }
    });
  };

  // Hàm xử lý chọn/bỏ chọn tất cả bàn trong khu vực
  const handleZoneSelect = (zone: string) => {
    setSelectedZones(prev => {
      if (prev.includes(zone)) {
        // Bỏ chọn tất cả bàn trong khu vực
        const tableIdsInZone = tables
          .filter(table => table.zone === zone)
          .map(table => table.id);
        setSelectedTables(prev => prev.filter(id => !tableIdsInZone.includes(id)));
        return prev.filter(z => z !== zone);
      } else {
        // Chọn tất cả bàn trong khu vực
        const tableIdsInZone = tables
          .filter(table => table.zone === zone)
          .map(table => table.id);
        setSelectedTables(prev => [...new Set([...prev, ...tableIdsInZone])]);
        return [...prev, zone];
      }
    });
  };

  // Hàm xử lý chọn nhân viên
  const handleWaiterSelect = (waiter: Waiter) => {
    setSelectedWaiter(waiter);
  };

  // Hàm mở dialog gán nhân viên
  const handleAssignWaiter = () => {
    if (selectedTables.length === 0) {
      toast.error('Vui lòng chọn ít nhất một bàn');
      return;
    }
    setIsAssignDialogOpen(true);
  };

  // Hàm xử lý gán nhân viên cho các bàn đã chọn
  const handleConfirmAssign = async () => {
    if (!selectedWaiter) {
      toast.error('Vui lòng chọn một nhân viên');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Gọi API để gán nhân viên cho từng bàn đã chọn
      await Promise.all(selectedTables.map(tableId => 
        axios.post(`http://localhost:8080/api/tables/${tableId}/assign/${selectedWaiter.id}`, {}, {
          headers: {
            'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
      ));

      toast.success('Đã gán nhân viên thành công');
      setIsAssignDialogOpen(false);
      setSelectedTables([]);
      setSelectedZones([]);
      setSelectedWaiter(null);
      await fetchTables(true);
    } catch (error) {
      console.error('Error assigning waiter:', error);
      toast.error('Không thể gán nhân viên cho các bàn đã chọn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewCurrentOrder = async (tableId: number) => {
    try {
      setLoadingOrders(true);
      const currentTableInfo = tables.find(t => t.id === tableId);
      if (!currentTableInfo) {
        toast.error('Không tìm thấy thông tin bàn');
        return;
      }
      
      setSelectedTable(currentTableInfo);
      
      // Sử dụng API customer endpoint không yêu cầu xác thực
      const response = await axios.get(`http://localhost:8080/api/orders/customer/${currentTableInfo.tableNumber}`);
      
      // API "/customer/{tableNumber}" trả về một OrderResponse đơn lẻ, không phải mảng
      if (response.data) {
        // Đặt vào mảng để hiển thị
        setCurrentOrders([response.data]);
      } else {
        setCurrentOrders([]);
      }
      
      setIsOrderDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching current order:', error);
      
      if (error.response && error.response.status === 204) {
        toast.info('Bàn hiện không có đơn đặt hàng nào');
      } else if (error.response && error.response.status === 404) {
        toast.error('Bàn hiện không có đơn đặt hàng nào');
      } else {
        toast.error('Không thể tải thông tin đơn hàng');
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  // Nhóm các bàn theo khu vực
  const tableZones = Array.from(new Set(tables.map(table => table.zone))).sort();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý bàn</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleAssignWaiter} 
            variant="outline" 
            disabled={selectedTables.length === 0}
            className="text-xs"
          >
            Gán nhân viên ({selectedTables.length} bàn)
          </Button>
          <Button 
            onClick={() => fetchTables(true)} 
            variant="outline"
            size="icon"
            className="h-9 w-9"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {tableZones.map(zone => (
            <TableZone
              key={zone}
              zone={zone}
              tables={tables}
              waiters={waiters}
              selectedTables={selectedTables}
              selectedZones={selectedZones}
              isWaiterOrManager={isWaiterOrManager}
              confirmSuccess={confirmSuccess}
              onZoneSelect={handleZoneSelect}
              onTableSelect={handleTableSelect}
              onViewOrder={viewCurrentOrder}
              onStatusChange={handleActionClick}
            />
          ))}
        </div>
      )}

      {/* Dialog components */}
      <AssignWaiterDialog
        isOpen={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        waiters={waiters}
        selectedWaiter={selectedWaiter}
        selectedTablesCount={selectedTables.length}
        isSubmitting={isSubmitting}
        onWaiterSelect={handleWaiterSelect}
        onConfirm={handleConfirmAssign}
      />

      <ConfirmActionDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        actionType={actionType}
        selectedTable={selectedTable}
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
        confirmSuccess={confirmSuccess}
        onConfirm={executeTableAction}
      />

      <OrderDialog
        isOpen={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        selectedTable={selectedTable}
        orders={currentOrders}
        isLoading={loadingOrders}
        onRefresh={() => viewCurrentOrder(selectedTable?.id || 0)}
      />
    </div>
  );
};