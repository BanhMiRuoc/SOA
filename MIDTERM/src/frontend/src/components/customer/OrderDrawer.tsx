import { useEffect, useState } from 'react';
import { ShoppingCart, X, Minus, Plus, MessageSquare, CheckCircle, AlertCircle, RefreshCw, ClipboardX, Loader2, Trash2 } from 'lucide-react';
import { useState as useReactState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useTableStore } from '@/store/tableStore';
import { useOrderStore } from '@/store/orderStore';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';


interface OrderDrawerProps {
  open: boolean;
  onClose: () => void;
  initialTab?: Tab;
}

type Tab = 'cart' | 'order';

export function OrderDrawer({ open, onClose }: OrderDrawerProps) {
  // State cho việc quản lý tab và animation
  const [activeTab, setActiveTab] = useState<Tab>('cart');
  const [userChangedTab, setUserChangedTab] = useState(false);
  const [removingItemId, setRemovingItemId] = useReactState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  // State cho hộp thoại xác nhận đặt món và hủy đơn
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isConfirmCancelOrderDialogOpen, setIsConfirmCancelOrderDialogOpen] = useState(false);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  
  // Cart state từ store
  const { 
    items, 
    totalItems, 
    totalAmount, 
    updateQuantity, 
    removeCartItem, 
    clearCart, 
    updateSpecialInstructions 
  } = useCartStore();
  
  // Table state
  const { tableNumber } = useTableStore();
  
  // Order state
  const {
    currentOrder,
    error: orderError,
    orderSuccess,
    isSubmitting,
    submitError,
    fetchCurrentOrder,
    updateOrderItemStatus,
    submitOrder,
    cancelOrder,
    resetOrderSuccess,
    resetSubmitError,
    startPolling,
    stopPolling,
    resetPolling
  } = useOrderStore();

  // Effect để xử lý đếm ngược sau khi đặt đơn thành công
  useEffect(() => {
    let timer: NodeJS.Timeout;
      clearCart();
    if (orderSuccess && countdown > 0) {
      // Đếm ngược sau khi đặt đơn thành công
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Khi đếm ngược hoàn tất
      setCountdown(3);
      resetOrderSuccess();
      // Không cần resetPolling vì effect dưới đây sẽ lo việc đó
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [orderSuccess, countdown, clearCart, resetOrderSuccess, setActiveTab]);

  // Một Effect duy nhất để xử lý polling và tải dữ liệu
  useEffect(() => {
    if (open && tableNumber) {
      // Bắt đầu polling API
      startPolling(tableNumber, 5);
    } else {
      // Dừng polling khi drawer đóng
      stopPolling();
    }
    
    // Cleanup khi component unmount
    return () => {
      stopPolling();
    };
  }, [open, tableNumber, activeTab, startPolling, stopPolling]);
  // Hàm xử lý thay đổi số lượng món trong giỏ
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCartItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };
  
  // Hàm xử lý thay đổi ghi chú
  const handleSpecialInstructionsChange = (itemId: number, instructions: string) => {
    updateSpecialInstructions(itemId, instructions);
  };
  
  // Hàm mở hộp thoại xác nhận đặt món
  const handleOpenConfirmDialog = () => {
    if (items.length === 0 || !tableNumber) return;
    setIsConfirmDialogOpen(true);
  };
  
  // Hàm xử lý gửi đơn hàng
  const handleSubmitOrder = async () => {
    setIsConfirmDialogOpen(false);
    
    if (items.length === 0 || !tableNumber) return;
    
    // Chuẩn bị dữ liệu đơn hàng
    const orderItems = items.map(item => ({
      menuItemId: item.menuItem.id,
      quantity: item.quantity,
      note: item.specialInstructions || ''
    }));
    
    // Gửi đơn hàng
    await submitOrder(tableNumber, orderItems);
  };
  
  // Hàm xử lý hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    
    setIsConfirmCancelOrderDialogOpen(false);
    setIsCancellingOrder(true);
    
    try {
      const success = await cancelOrder(currentOrder.id);
      if (success && tableNumber) {
        // Nếu hủy thành công, tải lại thông tin đơn hàng
        resetPolling(tableNumber, 5);
      }
    } finally {
      setIsCancellingOrder(false);
    }
  };
  
  // Hàm lấy badge trạng thái
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-500 text-[10px] font-medium py-0 h-5">Đang chờ</Badge>;
      case 'COOKING':
        return <Badge className="bg-blue-500 text-[10px] font-medium py-0 h-5">Đang chế biến</Badge>;
      case 'READY':
        return <Badge className="bg-orange-500 text-[10px] font-medium py-0 h-5">Sẵn sàng phục vụ</Badge>;
      case 'SERVING':
        return <Badge className="bg-blue-500 text-[10px] font-medium py-0 h-5">Đang phục vụ</Badge>;
      case 'SERVED':
        return <Badge className="bg-green-500 text-[10px] font-medium py-0 h-5">Đã ra món</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-500 text-[10px] font-medium py-0 h-5">Đã hủy</Badge>;
      default:
        return <Badge className="bg-gray-500 text-[10px] font-medium py-0 h-5">{status}</Badge>;
    }
  };

  return (
    <>
      {/* Overlay màu xám khi drawer mở */}
      <div 
        className="fixed inset-0 bg-black/65 z-40 transition-opacity duration-300"
        onClick={onClose}
        style={{ opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden' }}
      />
      
      {/* Drawer chính */}
      <div 
        className="fixed top-0 right-0 bottom-0 w-[90%] max-w-5/12 bg-zinc-900 border-l border-zinc-800 text-white z-60 flex flex-col translate-x-full transition-transform duration-300 ease-in-out data-[state=open]:translate-x-0"
        data-state={open ? "open" : "closed"}
      >
        {/* Header với tabs */}
        <div className="border-b border-zinc-800">
          <div className="flex">
            <button
              className={cn(
                "flex-1 py-3 px-4 text-center font-medium",
                activeTab === 'cart' ? "border-b-2 border-red-600 text-white" : "text-zinc-400"
              )}
              onClick={() => setActiveTab('cart')}
            >
              Món đang gọi
            </button>
            <button
              className={cn(
                "flex-1 py-3 px-4 text-center font-medium",
                activeTab === 'order' ? "border-b-2 border-red-600 text-white" : "text-zinc-400"
              )}
              onClick={() => {
                setActiveTab('order');
                setUserChangedTab(true);
                // Tải lại dữ liệu khi chuyển sang tab đơn hàng
                if (tableNumber) {
                  resetPolling(tableNumber, 5);
                }
              }}
            >
              Món đã gọi
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4">
            <div>
              <h2 className="text-lg font-bold">Bàn {tableNumber}</h2>
              {activeTab === 'cart' && (
                <p className="text-sm text-zinc-400">{totalItems} món trong giỏ - {formatCurrency(totalAmount)}</p>
              )}
              {activeTab === 'order' && currentOrder && (
                <p className="text-sm text-zinc-400">
                  Đặt lúc: {new Date(currentOrder.orderTime).toLocaleTimeString('vi-VN', {
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Nội dung tab */}
        <div className="flex-1 overflow-hidden">
          {/* Tab giỏ hàng */}
          {activeTab === 'cart' && (
            <>
              {isSubmitting ? (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <RefreshCw className="h-16 w-16 animate-spin text-red-500 mb-4" />
                  <h3 className="text-xl font-medium text-white">Đang xử lý đơn hàng...</h3>
                  <p className="text-zinc-400 text-center mt-2">Vui lòng chờ trong giây lát</p>
                </div>
              ) : orderSuccess ? (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-medium text-white">Đặt món thành công!</h3>
                  <p className="text-zinc-400 text-center mt-2">
                    Đơn hàng của bạn đã được gửi đến nhà bếp.
                  </p>
                </div>
              ) : submitError ? (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                  <h3 className="text-xl font-medium text-white">Đặt món thất bại!</h3>
                  <p className="text-zinc-400 text-center mt-2">{submitError}</p>
                  <Button
                    onClick={resetSubmitError} 
                    className="mt-4 bg-zinc-800 hover:bg-zinc-700"
                  >
                    Thử lại
                  </Button>
                </div>
              ) : items.length > 0 ? (
                <ScrollArea className="h-full pb-16">
                  <div className="p-4 space-y-3">
                    {items.map(item => (
                      <div key={item.menuItem.id} className="bg-zinc-800 border border-zinc-700 rounded-md p-3">
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-white">{item.menuItem.name}</h3>
                              <p className="font-medium text-white">
                                {formatCurrency(item.menuItem.price * item.quantity)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-zinc-400">{formatCurrency(item.menuItem.price)}</p>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleQuantityChange(item.menuItem.id, item.quantity - 1)}
                                  className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-white w-5 text-center text-sm">{item.quantity}</span>
                                <Button 
                                  variant="ghost"
                                  size="icon" 
                                  onClick={() => handleQuantityChange(item.menuItem.id, item.quantity + 1)}
                                  className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-6 w-6 ml-1 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent 
                                    className="w-72 bg-zinc-800 border-zinc-700 text-white z-70" 
                                    align="end" 
                                    sideOffset={5}
                                  >
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-sm">Thêm ghi chú cho món ăn</h4>
                                      <Textarea
                                        placeholder="Ví dụ: Không hành, ít cay..."
                                        className="bg-zinc-900 border-zinc-700 text-white"
                                        value={item.specialInstructions || ''}
                                        onChange={(e) => handleSpecialInstructionsChange(item.menuItem.id, e.target.value)}
                                      />
                                      <p className="text-xs text-zinc-400">Ghi chú sẽ được gửi tới nhà bếp</p>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeCartItem(item.menuItem.id)}
                                  className='text-zinc-400 hover:text-red-500 hover:bg-zinc-700'
                                    title="Xóa món này"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {item.specialInstructions && (
                          <p className="text-xs text-zinc-300 mt-2 bg-zinc-900 p-2 rounded">
                            <span className="font-medium">Ghi chú:</span> {item.specialInstructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <ShoppingCart className="h-12 w-12 text-zinc-700 mb-4" />
                  <h3 className="text-lg font-medium text-zinc-400">Giỏ hàng trống</h3>
                  <p className="text-zinc-500 text-center mt-2">Hãy thêm món ăn vào giỏ hàng</p>
                </div>
              )}
            </>
          )}
          
          {/* Tab đơn hàng hiện tại */}
          {activeTab === 'order' && (
            <>
              {orderError ? (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                  <h3 className="text-xl font-medium text-white">Không thể tải đơn hàng</h3>
                  <p className="text-zinc-400 text-center mt-2">{orderError}</p>
                  <Button
                    onClick={() => tableNumber && fetchCurrentOrder(tableNumber)}
                    className="mt-4 bg-zinc-800 hover:bg-zinc-700"
                  >
                    Thử lại
                  </Button>
                </div>
              ) : !currentOrder ? (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <ClipboardX className="h-12 w-12 text-zinc-700 mb-4" />
                  <h3 className="text-lg font-medium text-zinc-400">Chưa có đơn hàng nào</h3>
                  <p className="text-zinc-500 text-center mt-2">Hãy đặt món từ mục "Món đang gọi"</p>
                </div>
              ) : (
                <>
                  <div className="p-4 mb-2">
                    <div className="flex items-center mb-2">
                      <div className="text-sm text-zinc-300">Trạng thái đơn hàng:</div>
                      <div className="flex items-center ms-1">
                        {getStatusBadge(currentOrder.status)}
                      </div>
                    </div>

                    <div className="flex items-center mb-2">
                      <div className="text-sm text-zinc-300">Thanh toán:</div>
                      <div className="flex items-center ms-1">
                        {currentOrder.isPaid ? 
                          <Badge className="bg-green-500 text-[10px] font-medium py-0 h-5">Đã thanh toán</Badge> : 
                          <Badge className="bg-yellow-500 text-[10px] font-medium py-0 h-5">Chưa thanh toán</Badge>
                        }
                      </div>
                    </div>
                    
                    {/* Nút hủy đơn hàng chỉ hiển thị khi đơn hàng đang ở trạng thái PENDING */}
                    {currentOrder.status === 'PENDING' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsConfirmCancelOrderDialogOpen(true)}
                        disabled={isCancellingOrder}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-1 h-8"
                      >
                        {isCancellingOrder ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        {isCancellingOrder ? 'Đang hủy đơn hàng...' : 'Hủy toàn bộ đơn hàng'}
                      </Button>
                    )}
                  </div>
                  
                  <ScrollArea className="h-full pb-16">
                    <div className="p-4 space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-zinc-400 mb-2">
                        <div className="col-span-6">Tên món</div>
                        <div className="col-span-2 text-center">SL</div>
                        <div className="col-span-4 text-right">Đơn giá</div>
                      </div>
                      
                      {currentOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className={`bg-zinc-800 border border-zinc-700 rounded-md p-2 transition-all duration-300 ${
                            removingItemId === item.id ? 'opacity-50 scale-95' : 'opacity-100'
                          }`}
                        >
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-6 font-medium text-white flex items-center">
                              {item.menuItemName}
                            </div>
                            <div className="col-span-2 text-center text-zinc-400">
                              x{item.quantity}
                            </div>
                            <div className="col-span-4 text-right font-medium text-white">
                              {formatCurrency(item.price)}
                            </div>
                          </div>
                          
                          <div className="mt-1 flex justify-between items-center">
                            <div className="flex-1">
                              {item.note ? (
                                <span className="text-xs text-zinc-300 italic">"{item.note}"</span>
                              ) : (
                                <span className="text-xs text-zinc-400">Không có ghi chú</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Hiển thị nút hủy món chỉ khi OrderItem ở trạng thái PENDING */}
                              {item.status === 'PENDING' && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={async () => {
                                    if (window.confirm('Bạn có chắc chắn muốn hủy món này?')) {
                                      setRemovingItemId(item.id);
                                      try {
                                        await updateOrderItemStatus(item.id, 'CANCELLED');
                                        // Delay một chút để hiển thị animation
                                        await new Promise(resolve => setTimeout(resolve, 300));
                                      } finally {
                                        setRemovingItemId(null);
                                      }
                                    }
                                  }}
                                  disabled={removingItemId === item.id}
                                  className="h-6 w-6 text-zinc-400 hover:text-red-500 hover:bg-zinc-700"
                                  title="Hủy món này"
                                >
                                  {removingItemId === item.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <X className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                              {getStatusBadge(item.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </>
          )}
        </div>
        
        {/* Footer cố định */}
        <div className="border-none border-zinc-800">
          <div className="flex items-center">
            <div 
              className="flex-1 py-4 px-4 border-r flex items-center gap-2 bg-neutral-500 text-white text-xl"
            >
              <ShoppingCart className="h-4 w-4" />
              {currentOrder ? (
                <span>{formatCurrency(currentOrder.totalAmount)}</span>
              ) : (
                <span>{formatCurrency(0)}</span>
              )}
              {items.length > 0 && activeTab === 'cart' && (
                <span className="text-xs ml-1 text-zinc-200">
                  + {formatCurrency(totalAmount)}
                </span>
              )}
            </div>
            <Button
              onClick={handleOpenConfirmDialog}
              disabled={activeTab === 'order' || items.length === 0 || isSubmitting}
              className="flex-1 h-full py-4 rounded-none bg-red-600 hover:bg-red-700 text-white text-xl [line-height:inherit]"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Gọi món'}
            </Button>
          </div>
        </div>
        
        {/* Hộp thoại xác nhận đặt món */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent className="bg-zinc-900 border border-zinc-800 text-white sm:max-w-[425px] z-80">
            <DialogHeader>
              <DialogTitle>Xác nhận gọi món</DialogTitle>
              <DialogDescription className="text-zinc-200">
                Bạn có chắc chắn muốn gọi <b>({totalItems})</b> món?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsConfirmDialogOpen(false)}
                className="text-zinc-400 hover:text-red-500 hover:bg-zinc-800"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                onClick={handleSubmitOrder}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Xác nhận
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Hộp thoại xác nhận hủy đơn hàng */}
        <Dialog open={isConfirmCancelOrderDialogOpen} onOpenChange={setIsConfirmCancelOrderDialogOpen}>
          <DialogContent className="bg-zinc-900 border border-zinc-800 text-white sm:max-w-[425px] z-80">
            <DialogHeader>
              <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
              <DialogDescription className="text-zinc-200">
                Bạn có chắc chắn muốn hủy toàn bộ đơn hàng này? Tất cả các món ăn sẽ được hủy và không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsConfirmCancelOrderDialogOpen(false)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                disabled={isCancellingOrder}
              >
                Không
              </Button>
              <Button
                type="submit"
                onClick={handleCancelOrder}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isCancellingOrder}
              >
                {isCancellingOrder ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isCancellingOrder ? 'Đang hủy...' : 'Xác nhận hủy'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
} 