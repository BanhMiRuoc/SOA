// src/contexts/CustomerAuthContext.tsx
import { createContext, useContext, useState } from 'react';

interface CustomerAuthContextType {
  tableNumber: string | null;
  loginTable: (tableNumber: string) => void;
  logoutTable: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

export const CustomerAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [tableNumber, setTableNumber] = useState<string | null>(
    localStorage.getItem('tableNumber')
  );

  const loginTable = (number: string) => {
    localStorage.setItem('tableNumber', number);
    setTableNumber(number);
  };

  const logoutTable = () => {
    localStorage.removeItem('tableNumber');
    setTableNumber(null);
  };

  return (
    <CustomerAuthContext.Provider value={{ tableNumber, loginTable, logoutTable }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};