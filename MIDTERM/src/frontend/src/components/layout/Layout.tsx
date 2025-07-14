// src/components/layout/Layout.tsx
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();
  
  console.log('Layout - isAuthenticated:', isAuthenticated);
  
  // If not authenticated, don't show the sidebar
  if (!isAuthenticated) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[240px] p-6">
        {children}
      </main>
    </div>
  );
};