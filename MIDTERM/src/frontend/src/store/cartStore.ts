import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem } from '@/types/menu.types';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

interface CartState {
  items: CartItem[];
  tableNumber: string | null;
  totalItems: number;
  totalAmount: number;
  
  // Actions
  addItem: (menuItem: MenuItem, quantity?: number, specialInstructions?: string) => void;
  removeCartItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  updateSpecialInstructions: (menuItemId: number, instructions: string) => void;
  clearCart: () => void;
  setTableNumber: (tableNumber: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: null,
      totalItems: 0,
      totalAmount: 0,

      addItem: (menuItem, quantity = 1, specialInstructions) => {
        const { items } = get();
        
        // Kiểm tra xem món này đã có trong giỏ hàng chưa
        const existingItemIndex = items.findIndex(item => item.menuItem.id === menuItem.id);
        
        if (existingItemIndex >= 0) {
          // Nếu món đã tồn tại, tăng số lượng
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          
          if (specialInstructions) {
            updatedItems[existingItemIndex].specialInstructions = specialInstructions;
          }
          
          // Cập nhật tổng số lượng và tổng tiền
          set({
            items: updatedItems,
            totalItems: get().totalItems + quantity,
            totalAmount: get().totalAmount + (menuItem.price * quantity)
          });
        } else {
          // Nếu món chưa có trong giỏ hàng, thêm mới
          const newItem: CartItem = {
            menuItem,
            quantity,
            specialInstructions
          };
          
          // Cập nhật tổng số lượng và tổng tiền
          set({
            items: [...items, newItem],
            totalItems: get().totalItems + quantity,
            totalAmount: get().totalAmount + (menuItem.price * quantity)
          });
        }
      },

      removeCartItem: (menuItemId) => {
        const { items } = get();
        const itemToRemove = items.find(item => item.menuItem.id === menuItemId);
        
        if (itemToRemove) {
          // Cập nhật tổng số lượng và tổng tiền
          set({
            items: items.filter(item => item.menuItem.id !== menuItemId),
            totalItems: get().totalItems - itemToRemove.quantity,
            totalAmount: get().totalAmount - (itemToRemove.menuItem.price * itemToRemove.quantity)
          });
        }
      },

      updateQuantity: (menuItemId, quantity) => {
        const { items } = get();
        const itemIndex = items.findIndex(item => item.menuItem.id === menuItemId);
        
        if (itemIndex >= 0) {
          const updatedItems = [...items];
          const oldQuantity = updatedItems[itemIndex].quantity;
          const priceDifference = updatedItems[itemIndex].menuItem.price * (quantity - oldQuantity);
          
          updatedItems[itemIndex].quantity = quantity;
          
          set({
            items: updatedItems,
            totalItems: get().totalItems + (quantity - oldQuantity),
            totalAmount: get().totalAmount + priceDifference
          });
        }
      },

      updateSpecialInstructions: (menuItemId, instructions) => {
        const { items } = get();
        const itemIndex = items.findIndex(item => item.menuItem.id === menuItemId);
        
        if (itemIndex >= 0) {
          const updatedItems = [...items];
          updatedItems[itemIndex].specialInstructions = instructions;
          
          set({
            items: updatedItems,
          });
        }
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0
        });
      },

      setTableNumber: (tableNumber) => {
        set({ tableNumber });
      }
    }),
    {
      name: 'cart-storage', // tên của key trong localStorage
    }
  )
); 