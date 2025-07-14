export type UserRole = 'WAITER' | 'KITCHEN_STAFF' | 'MANAGER' | 'CASHIER' | 'ADMIN';

export enum UserRoles {
  WAITER = 'WAITER',
  KITCHEN_STAFF = 'KITCHEN_STAFF',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  token?: string;
  isActive?: boolean;
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}