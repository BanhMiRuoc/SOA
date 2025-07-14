// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { useEffect } from 'react';
import { Login } from './components/auth/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { UserRoles } from './types/user.types';
import { MenuPage } from '@/pages/staff/MenuPage';
import { CustomerOrderPage } from '@/pages/customer/CustomerOrderPage';
import { TableSelectionPage } from '@/pages/customer/TableSelectionPage';
import { CustomerProtectedRoute } from './components/auth/CustomerProtectedRoute';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { TableManagementPage } from '@/pages/staff/TableManagementPage';
import { KitchenPage } from '@/pages/staff/KitchenPage';
import { ReportsPage } from '@/pages/staff/ReportsPage';
import { HandleOrdersPage } from '@/pages/staff/HandleOrdersPage';
import { DashboardPage } from '@/pages/staff/DashboardPage';
import { UserManagementPage } from '@/pages/staff/UserManagementPage';
import { TableAdminPage } from '@/pages/staff/TableAdminPage';

// Tiêu đề tương ứng cho mỗi trang
const routeTitles: Record<string, string> = {
  '/': 'Dashboard - Nhà Hàng',
  '/login': 'Đăng Nhập - Nhà Hàng',
  '/menu': 'Thực Đơn - Nhà Hàng',
  '/orders': 'Đơn Hàng - Nhà Hàng',
  '/kitchen': 'Bếp - Nhà Hàng',
  '/tables': 'Quản Lý Bàn - Nhà Hàng',
  '/tables/admin': 'Quản Trị Bàn - Nhà Hàng',
  '/reports': 'Báo Cáo - Nhà Hàng',
  '/staff/handle-orders': 'Xử Lý Món - Nhà Hàng',
  '/users': 'Quản Lý Nhân Viên - Nhà Hàng',
  '/unauthorized': 'Không Có Quyền Truy Cập - Nhà Hàng',
  '/table-selection': 'Chọn Bàn - Nhà Hàng',
  '/customer/order': 'Đặt Món - Nhà Hàng',
  '/current-order': 'Đơn Hàng Hiện Tại - Nhà Hàng',
};

// Component để cập nhật tiêu đề
const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    // Tìm tiêu đề tương ứng với đường dẫn hiện tại
    const currentTitle = routeTitles[pathname] || 'Nhà Hàng';
    document.title = currentTitle;
  }, [location]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
          <Router>
            <TitleUpdater />
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <Layout>
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/menu" element={
                <Layout>
                  <ProtectedRoute>
                    <MenuPage />
                  </ProtectedRoute>
                </Layout>
              } />
              <Route path="/kitchen" element={
                <Layout>
                  <ProtectedRoute allowedRoles={[UserRoles.KITCHEN_STAFF, UserRoles.MANAGER]}>
                    <KitchenPage />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/tables" element={
                <Layout>
                  <ProtectedRoute allowedRoles={[UserRoles.WAITER, UserRoles.MANAGER]}>
                    <TableManagementPage />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/tables/admin" element={
                <Layout>
                  <ProtectedRoute allowedRoles={[UserRoles.MANAGER]}>
                    <TableAdminPage />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/reports" element={
                <Layout>
                  <ProtectedRoute allowedRoles={[UserRoles.MANAGER]}>
                    <ReportsPage />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/staff/handle-orders" element={
                <Layout>
                  <ProtectedRoute allowedRoles={[UserRoles.KITCHEN_STAFF, UserRoles.MANAGER, UserRoles.WAITER]}>
                    <HandleOrdersPage />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/users" element={
                <Layout>
                  <ProtectedRoute allowedRoles={[UserRoles.MANAGER]}>
                    <UserManagementPage />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/unauthorized" element={
                <Layout>
                  <Unauthorized />
                </Layout>
              } />
              
              <Route path="/table-selection" element={<TableSelectionPage />} />
              <Route path="/customer/order" element={
                <CustomerProtectedRoute>
                  <CustomerOrderPage />
                </CustomerProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/table-selection" replace />} />
            </Routes>
          </Router>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}

// Component cho trang Unauthorized
const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh]">
    <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
    <p>You don't have permission to access this page.</p>
  </div>
);

export default App;