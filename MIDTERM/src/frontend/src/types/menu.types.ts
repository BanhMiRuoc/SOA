// src/types/menu.types.ts
export enum KitchenType {
  HOT_KITCHEN = 'HOT_KITCHEN',    // Bếp nóng
  COLD_KITCHEN = 'COLD_KITCHEN',  // Bếp lạnh
  BAR = 'BAR'                     // Quầy bar
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  isSpicy: boolean;
  isHidden?: boolean; // Thuộc tính mới để xác định món ăn có hiển thị trên giao diện đặt món hay không
  kitchenType: string;
}

export type MenuCategory = {
  id: number;
  name: string;
};

// src/types/order.types.ts
export interface OrderItem {
  menuItemId: number;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id?: number;
  tableNumber: number;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  totalAmount: number;
  createdAt: Date;
}