import { ShoppingCart, X, Minus, Plus, CheckCircle, MessageSquare, AlertCircle, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/store/cartStore';
import { useTableStore } from '@/store/tableStore';
import { formatCurrency } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CartProps {
  open: boolean;
  onClose: () => void;
}

export function Cart({ open, onClose }: CartProps) {
  const { items, totalItems, totalAmount, updateQuantity, removeItem, clearCart, updateSpecialInstructions } = useCartStore();
  const { tableNumber } = useTableStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };
  
  const handleSpecialInstructionsChange = (itemId: number, instructions: string) => {
    updateSpecialInstructions(itemId, instructions);
  };
  
  const handleSubmitOrder = async () => {
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          note: item.specialInstructions || ''
        }))
      };
      
      console.log('Đang gửi dữ liệu:', JSON.stringify(orderData));
      console.log('Table Number:', tableNumber);
      
      // Gọi API đặt món
      const response = await fetch(`http://localhost:8080/api/orders/customer?tableNumber=${tableNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      console.log('Phản hồi từ server:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi gửi đơn hàng');
      }
      
      console.log('Đặt món thành công:', data);
      
      setOrderSuccess(true);
      // Xóa giỏ hàng sau khi đặt hàng thành công
      setTimeout(() => {
        clearCart();
        setOrderSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Lỗi khi đặt món:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt món');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!open) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white w-[90%] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <ShoppingCart className="h-5 w-5" />
            Giỏ hàng của bạn
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Bàn {tableNumber} | {totalItems} món
          </DialogDescription>
        </DialogHeader>
        
        {orderSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-medium text-white">Đặt món thành công!</h3>
            <p className="text-zinc-400 text-center mt-2">Đơn hàng của bạn đã được gửi đến nhà bếp.</p>
          </div>
        ) : errorMessage ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-medium text-white">Đặt món thất bại!</h3>
            <p className="text-zinc-400 text-center mt-2">{errorMessage}</p>
            <Button
              onClick={() => setErrorMessage(null)} 
              className="mt-4 bg-zinc-800 hover:bg-zinc-700"
            >
              Thử lại
            </Button>
          </div>
        ) : items.length > 0 ? (
          <>
            <ScrollArea className="max-h-[50vh]">
              <div className="flex flex-col gap-3 px-1">
                {items.map((item) => (
                  <Card key={item.menuItem.id} className="bg-zinc-800 border-zinc-700">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{item.menuItem.name}</h3>
                          <p className="text-xs text-zinc-400 mt-1">{formatCurrency(item.menuItem.price)}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleQuantityChange(item.menuItem.id, item.quantity - 1)}
                            className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-white w-5 text-center text-sm">{item.quantity}</span>
                          <Button 
                            variant="ghost"
                            size="icon" 
                            onClick={() => handleQuantityChange(item.menuItem.id, item.quantity + 1)}
                            className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700"
                              >
                                <MessageSquare className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 bg-zinc-800 border-zinc-700 text-white">
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
                            onClick={() => removeItem(item.menuItem.id)}
                            className="h-7 w-7 text-zinc-400 hover:text-red-500 hover:bg-zinc-700 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-xs text-zinc-500 mt-1">
                          Ghi chú: {item.specialInstructions}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            
            <div className="border-t border-zinc-800 pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-zinc-400">Tạm tính:</span>
                <span className="font-medium text-white">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Thành tiền:</span>
                <span className="font-bold text-lg text-red-500">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
            
            <DialogFooter className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={clearCart}
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Xóa giỏ hàng
              </Button>
              <Button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt món'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-zinc-700 mb-4" />
            <h3 className="text-lg font-medium text-zinc-400">Giỏ hàng trống</h3>
            <p className="text-zinc-500 text-center mt-2">Hãy thêm món ăn vào giỏ hàng</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 