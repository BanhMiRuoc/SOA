// Định nghĩa kiểu dữ liệu cho bàn
export interface Table {
  id: number;
  tableNumber: string;
  zone: string;
  capacity: number;
  status: string;
  currentWaiterId: string | null;
  occupiedAt: string | null;
  isActive?: boolean;
}

// Định nghĩa kiểu dữ liệu cho nhân viên
export interface Waiter {
  id: number;
  name: string;
  email: string;
}

// Định nghĩa kiểu dữ liệu cho order item
export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
  note?: string;
  status: string;
}

// Định nghĩa kiểu dữ liệu cho order
export interface Order {
  id: number;
  tableId?: number;
  tableNumber?: string;
  orderTime: string;
  status: string;
  isPaid: boolean;
  totalAmount: number;
  items: OrderItem[];
}