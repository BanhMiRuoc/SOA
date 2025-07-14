import { create } from 'zustand';

// Định nghĩa các kiểu dữ liệu
export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  note: string;
  status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED' | 'CANCELLED';
  price: number;
}

export interface Order {
  id: number;
  tableNumber: string;
  orderTime: string;
  status: string;
  totalAmount: number;
  isPaid: boolean;
  needAssistance: boolean;
  items: OrderItem[];
}

interface OrderState {
  // Dữ liệu
  currentOrder: Order | null;
  
  // Trạng thái
  error: string | null;
  orderSuccess: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  pollingInterval: number | null;

  // Actions
  fetchCurrentOrder: (tableNumber: string) => Promise<void>;
  submitOrder: (tableNumber: string, items: { menuItemId: number; quantity: number; note?: string }[]) => Promise<boolean>;
  removeOrderItem: (orderItemId: number) => Promise<boolean>;
  updateOrderItemStatus: (orderItemId: number, status: string) => Promise<boolean>;
  cancelOrder: (orderId: number) => Promise<boolean>;
  requestAssistance: (tableNumber: string, needAssistance: boolean) => Promise<boolean>;
  resetOrderSuccess: () => void;
  resetSubmitError: () => void;
  
  // Polling API
  startPolling: (tableNumber: string, intervalSeconds?: number) => void;
  stopPolling: () => void;
  resetPolling: (tableNumber: string, intervalSeconds?: number) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  // Dữ liệu ban đầu
  currentOrder: null,
  
  // Trạng thái ban đầu
  error: null,
  orderSuccess: false,
  isSubmitting: false,
  submitError: null,
  pollingInterval: null,

  // Fetch đơn hàng hiện tại
  fetchCurrentOrder: async (tableNumber: string) => {
    if (!tableNumber) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/orders/customer/${tableNumber}`);
      
      // Xử lý trường hợp 204 No Content (không có đơn hàng)
      if (response.status === 204) {
        set({ currentOrder: null, error: null });
        return;
      }
      
      // Xử lý lỗi
      if (!response.ok) {
        let errorMessage = 'Không thể lấy thông tin đơn hàng';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Nếu không thể parse JSON, sử dụng thông báo mặc định
          console.error('Không thể đọc phản hồi lỗi:', jsonError);
        }
        
        set({
          error: errorMessage,
          currentOrder: null
        });
        return;
      }
      
      // Lấy dữ liệu từ response khi là 200 OK
      const data = await response.json();
      set({ currentOrder: data, error: null });
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng:', error);
      set({
        error: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.',
        currentOrder: null
      });
    }
  },

  // Gửi đơn hàng mới
  submitOrder: async (tableNumber, items) => {
    if (items.length === 0) return false;
    
    set({ isSubmitting: true, submitError: null });
    
    try {
      // Chuẩn bị dữ liệu đơn hàng
      const orderData = { items };
      
      // Gọi API đặt món
      const response = await fetch(`http://localhost:8080/api/orders/customer/${tableNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        // Lấy clone của response để đọc nội dung
        const responseClone = response.clone();
        
        // Thử đọc response dưới dạng JSON
        let errorMessage;
        try {
          const errorData = await responseClone.json();
          errorMessage = errorData.message || `Lỗi ${response.status}: ${response.statusText}`;
        } catch (jsonError) {
          // Nếu không phải JSON, đọc dưới dạng text
          try {
            const errorText = await response.text();
            errorMessage = errorText || `Lỗi ${response.status}: ${response.statusText}`;
          } catch (textError) {
            // Nếu không thể đọc text, sử dụng thông tin HTTP status
            errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Đặt hàng thành công
      set({ orderSuccess: true, isSubmitting: false });
      return true;
    } catch (error) {
      console.error('Lỗi khi đặt món:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt món';
      
      // Xử lý thông báo lỗi riêng cho một số trường hợp cụ thể
      let displayError = errorMessage;
      if (errorMessage.includes('Order is already paid')) {
        displayError = 'Đơn hàng đã được thanh toán, không thể đặt thêm món.';
      } else if (errorMessage.includes('Failed to fetch') || error instanceof TypeError) {
        displayError = 'Không thể kết nối đến máy chủ.';
      }
      
      set({ 
        submitError: displayError,
        isSubmitting: false
      });
      return false;
    }
  },

  // Reset trạng thái đặt hàng thành công
  resetOrderSuccess: () => set({ orderSuccess: false }),

  // Reset lỗi khi submit
  resetSubmitError: () => set({ submitError: null }),
  
  // Xóa một OrderItem theo ID
  removeOrderItem: async (orderItemId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/items/${orderItemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Không thể xóa món ăn. Món ăn có thể đã được xử lý.');
      }
      
      // Nếu xóa thành công, cập nhật lại danh sách các món
      const { currentOrder, fetchCurrentOrder } = get();
      if (currentOrder) {
        await fetchCurrentOrder(currentOrder.tableNumber);
      }
      
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa món:', error);
      return false;
    }
  },
  
  // Cập nhật trạng thái của một OrderItem
  updateOrderItemStatus: async (orderItemId, status) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orderItems/${orderItemId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Không thể cập nhật trạng thái món ăn.');
      }
      
      // Nếu cập nhật thành công, cập nhật lại danh sách các món
      const { currentOrder, fetchCurrentOrder } = get();
      if (currentOrder) {
        await fetchCurrentOrder(currentOrder.tableNumber);
      }
      
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái món:', error);
      return false;
    }
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể hủy đơn hàng');
      }
      
      // Nếu hủy thành công, cập nhật lại trạng thái đơn hàng
      const { currentOrder, fetchCurrentOrder } = get();
      if (currentOrder) {
        await fetchCurrentOrder(currentOrder.tableNumber);
      }
      
      return true;
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      return false;
    }
  },
  
  // Bắt đầu polling API để cập nhật trạng thái real-time
  startPolling: (tableNumber: string, intervalSeconds = 5) => {
    // Trước tiên dừng polling hiện tại nếu có
    const currentInterval = get().pollingInterval;
    if (currentInterval) {
      clearInterval(currentInterval);
    }

    // Gọi API lần đầu ngay lập tức
    get().fetchCurrentOrder(tableNumber);

    // Thiết lập interval mới
    const interval = window.setInterval(() => {
      // Gọi API để cập nhật dữ liệu
      get().fetchCurrentOrder(tableNumber);
    }, intervalSeconds * 1000);

    // Lưu ID của interval
    set({ pollingInterval: interval });
  },

  // Dừng polling API
  stopPolling: () => {
    const interval = get().pollingInterval;
    if (interval) {
      clearInterval(interval);
      set({ pollingInterval: null });
    }
  },

  // Thiết lập lại polling API
  resetPolling: (tableNumber: string, intervalSeconds = 5) => {
    get().stopPolling();
    get().startPolling(tableNumber, intervalSeconds);
  },

  // Gọi API yêu cầu hỗ trợ
  requestAssistance: async (tableNumber: string, needAssistance: boolean) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/customer/${tableNumber}/assistance?needAssistance=${needAssistance}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể yêu cầu hỗ trợ');
      }
      
      // Cập nhật lại đơn hàng hiện tại
      await get().fetchCurrentOrder(tableNumber);
      
      return true;
    } catch (error) {
      console.error('Lỗi khi yêu cầu hỗ trợ:', error);
      return false;
    }
  }
}));