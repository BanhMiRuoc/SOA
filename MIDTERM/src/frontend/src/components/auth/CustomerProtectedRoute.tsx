// src/components/auth/CustomerProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

export const CustomerProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { tableNumber } = useCustomerAuth();

  if (!tableNumber) {
    return <Navigate to="/table-selection" replace />;
  }

  return <>{children}</>;
};