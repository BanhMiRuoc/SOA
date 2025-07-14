import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TableState {
  tableNumber: string | null;
  isCalling: boolean;
  
  // Actions
  setTableNumber: (tableNumber: string) => void;
  clearTableNumber: () => void;
  callWaiter: () => void;
  cancelWaiterCall: () => void;
}

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      tableNumber: null,
      isCalling: false,
      
      setTableNumber: (tableNumber) => set({ tableNumber }),
      
      clearTableNumber: () => set({ tableNumber: null }),
      
      callWaiter: () => set({ isCalling: true }),
      
      cancelWaiterCall: () => set({ isCalling: false })
    }),
    {
      name: 'table-storage',
      partialize: (state) => ({ tableNumber: state.tableNumber }),
    }
  )
); 