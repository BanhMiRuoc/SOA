import { Button } from '@/components/ui/button';
import { LogOut, Search, HelpCircle, Bell } from 'lucide-react';
import { useTableStore } from '@/store/tableStore';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useMenuStore } from '@/store/menuStore';
import { useOrderStore } from '@/store/orderStore';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';

export const OrderHeader = () => {
  const { tableNumber, clearTableNumber } = useTableStore();
  const { searchQuery, setSearchQuery } = useMenuStore();
  const { 
    currentOrder, 
    requestAssistance, 
    startPolling, 
    stopPolling 
  } = useOrderStore();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [assistanceRequested, setAssistanceRequested] = useState(false);

  // Khởi động polling API khi component mount để cập nhật trạng thái theo thời gian thực
  useEffect(() => {
    if (tableNumber) {
      // Bắt đầu polling mỗi 3 giây
      startPolling(tableNumber, 3);
      
      // Cleanup khi component unmount
      return () => {
        stopPolling();
      };
    }
  }, [tableNumber, startPolling, stopPolling]);

  // Cập nhật trạng thái local khi currentOrder thay đổi
  useEffect(() => {
    if (currentOrder) {
      setAssistanceRequested(currentOrder.needAssistance || false);
    }
  }, [currentOrder]);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    clearTableNumber();
    localStorage.removeItem('tableNumber');
    navigate('/table-selection');
  };

  const handleRequestAssistance = async () => {
    if (!tableNumber) return;
    
    const isSuccess = await requestAssistance(tableNumber, true);
    
    if (isSuccess) {
      setAssistanceRequested(true);
      toast.success('Đã gọi nhân viên. Nhân viên sẽ đến hỗ trợ bạn ngay.');
    } else {
      toast.error('Không thể gọi nhân viên. Vui lòng thử lại sau.');
    }
  };

  const handleCancelAssistance = async () => {
    if (!tableNumber) return;
    
    const isSuccess = await requestAssistance(tableNumber, false);
    
    if (isSuccess) {
      setAssistanceRequested(false);
      toast.success('Đã hủy yêu cầu gọi nhân viên.');
    } else {
      toast.error('Không thể hủy yêu cầu. Vui lòng thử lại sau.');
    }
  };

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Bàn {tableNumber}</h1>
          {assistanceRequested ? (
            <Button
              variant="destructive"
              size="sm"
              className="text-white"
              onClick={handleCancelAssistance}
            >
              <Bell className="h-4 w-4 mr-2 animate-pulse" />
              Đã gọi nhân viên
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              onClick={handleRequestAssistance}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Gọi nhân viên
            </Button>
          )}
        </div>
        
        <div className="relative max-w-md w-full mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Tìm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white pl-10 pr-4 w-full"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Xác nhận thoát</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Bạn có chắc chắn muốn thoát khỏi đơn hàng hiện tại?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="ghost" 
              onClick={confirmLogout}
              className="text-zinc-400 hover:text-red-500 hover:bg-zinc-800"
            >
              Xác nhận
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowLogoutDialog(false)}
              className="hover:bg-red-700 transition-colors duration-200"
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}; 