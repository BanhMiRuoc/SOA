import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Utensils, Key } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Table {
  id: string;
  tableNumber: string;
  zone: string;
  status: 'CLOSED' | 'OPENED' | 'OCCUPIED';
  capacity: number;
}

export const TableSelectionPage = () => {
  const { loginTable } = useCustomerAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isOpeningTable, setIsOpeningTable] = useState(false);

  // Kiểm tra localStorage khi component mount
  useEffect(() => {
    const storedTable = localStorage.getItem('tableNumber');
    if (storedTable) {
      navigate('/customer/order');
    }
  }, [navigate]);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/tables', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách bàn');
      }
      
      const data = await response.json();
      setTables(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  const selectTable = async (table: Table) => {
    setSelectedTable(table);
    
    if (table.status === 'CLOSED') {
      // Nếu bàn đóng, hiển thị dialog xác nhận để mở bàn
      setIsAuthDialogOpen(true);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/tables/number/${table.tableNumber}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Không có quyền truy cập bàn này');
        } else if (response.status === 404) {
          throw new Error('Không tìm thấy bàn');
        } else {
          throw new Error('Bàn không hợp lệ');
        }
      }
      
      loginTable(table.tableNumber);
      navigate('/customer/order');
    } catch (error) {
      console.error('Error validating table:', error);
      alert(error instanceof Error ? error.message : 'Số bàn không hợp lệ');
    }
  };

  const confirmStaffAction = () => {
    if (selectedTable) {
      openTable(selectedTable);
      setIsAuthDialogOpen(false);
    }
  };

  const openTable = async (table: Table) => {
    setIsOpeningTable(true);
    
    try {
      // Gọi API để mở bàn mà không cần token xác thực
      const response = await fetch(`http://localhost:8080/api/tables/${table.id}/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể mở bàn');
      }
      
      toast.success(`Đã mở bàn ${table.tableNumber} thành công`);
      
      // Làm mới danh sách bàn
      await fetchTables();
    } catch (error) {
      console.error('Error opening table:', error);
      toast.error('Không thể mở bàn, vui lòng thử lại');
    } finally {
      setIsOpeningTable(false);
    }
  };

  // Lấy tất cả các khu vực duy nhất và sắp xếp theo thứ tự
  const zones = Array.from(new Set(tables.map(table => table.zone))).sort();
  
  // Nếu không có bàn nào, thêm các khu vực mặc định
  const availableZones = zones.length > 0 ? zones : ['A', 'B', 'C'];

  // Hàm lấy màu nền cho bàn dựa vào trạng thái
  const getTableBackgroundColor = (status: string) => {
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

  // Hàm lấy tên trạng thái bằng tiếng Việt
  const getStatusText = (status: string) => {
    switch(status) {
      case 'OPENED':
        return 'Sẵn sàng';
      case 'OCCUPIED':
        return 'Đang sử dụng';
      case 'CLOSED':
        return 'Đóng';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 pb-10 text-white">
      <header className="bg-zinc-900 border-b border-zinc-800 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex-1"></div> {/* Phần này để căn giữa */}
          <div className="flex flex-col items-center">
            <Utensils className="h-10 w-10 text-red-500 mb-2" />
            <h1 className="text-2xl font-bold text-white">Chọn Bàn</h1>
          </div>
          <div className="flex-1 flex justify-end">
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-white">Đang tải danh sách bàn...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 p-4">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={fetchTables} 
              className="mt-4 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              Thử lại
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {availableZones.map(zone => (
              <div key={zone} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-8 bg-red-600"></div>
                  <h2 className="text-xl font-bold text-white">Khu {zone}</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {tables
                    .filter(table => table.zone === zone)
                    .map(table => {
                      const tableNumber = table.tableNumber.split('_')[1];
                      const backgroundColor = getTableBackgroundColor(table.status);
                      const statusText = getStatusText(table.status);
                      
                      return (
                        <div 
                          key={table.id} 
                          className={`
                            h-28 border border-zinc-700 rounded-md shadow-md flex flex-col items-center justify-center 
                            cursor-pointer transition-transform transform hover:scale-105
                            ${backgroundColor}
                          `}
                          onClick={() => selectTable(table)}
                        >
                          <span className="text-2xl font-bold">{tableNumber}</span>
                          <span className="text-xs mt-1 font-medium">{statusText}</span>
                          <span className="text-xs opacity-80 mt-1">Chỗ ngồi: {table.capacity}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-10 max-w-md mx-auto bg-zinc-800 p-4 rounded-lg shadow-md border border-zinc-700">
          <h3 className="text-xl font-medium text-white mb-4">Chú thích</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 rounded-sm mr-3"></div>
              <span className="text-zinc-300">Bàn sẵn sàng - Có thể sử dụng</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-600 rounded-sm mr-3"></div>
              <span className="text-zinc-300">Bàn đang sử dụng</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-600 rounded-sm mr-3 border border-zinc-700"></div>
              <span className="text-zinc-300">Bàn đóng - Mở để sử dụng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog xác nhận hành động nhân viên */}
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="bg-zinc-800 border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle>Xác nhận hành động nhân viên</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-zinc-400 mb-4">
              {selectedTable && selectedTable.status === 'CLOSED' 
                ? `Bạn muốn mở bàn ${selectedTable.tableNumber}?` 
                : 'Xác nhận thực hiện hành động nhân viên'}
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsAuthDialogOpen(false)}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              Hủy
            </Button>
            <Button 
              onClick={confirmStaffAction}
              disabled={isOpeningTable}
              className="bg-red-600 hover:bg-red-700"
            >
              {isOpeningTable ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 