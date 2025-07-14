export interface User {
  id: string;
  username: string;
  email: string;
}

export interface DataItem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface OrderItem {
  id: number;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  items: OrderItem[];
  total: number;
  tableNumber: number;
}
