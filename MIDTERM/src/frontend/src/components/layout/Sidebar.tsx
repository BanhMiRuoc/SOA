// src/components/layout/Sidebar.tsx
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { UserRole } from '../../types/user.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DashboardIcon,
  ExitIcon,
  PersonIcon,
  TableIcon,
  ClipboardIcon,
  CookieIcon,
  BarChartIcon,
  HamburgerMenuIcon,
  UpdateIcon
} from "@radix-ui/react-icons";
import { useState } from "react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const navigation: NavItem[] = [
    {
      name: 'Trang Chủ',
      path: '/',
      icon: <DashboardIcon className="h-5 w-5" />,
      roles: ['WAITER', 'KITCHEN_STAFF', 'MANAGER', 'CASHIER', 'ADMIN']
    },
    {
      name: 'Thực Đơn',
      path: '/menu',
      icon: <HamburgerMenuIcon className="h-5 w-5" />,
      roles: ['WAITER', 'KITCHEN_STAFF', 'MANAGER', 'CASHIER', 'ADMIN']
    },
    {
      name: 'Bếp',
      path: '/kitchen',
      icon: <CookieIcon className="h-5 w-5" />,
      roles: ['KITCHEN_STAFF', 'MANAGER', 'ADMIN']
    },
    {
      name: 'Phục Vụ',
      path: '/staff/handle-orders',
      icon: <UpdateIcon className="h-5 w-5" />,
      roles: ['MANAGER', 'WAITER', 'CASHIER', 'ADMIN']
    },
    {
      name: 'Bàn Ăn',
      path: '/tables',
      icon: <TableIcon className="h-5 w-5" />,
      roles: ['MANAGER', 'CASHIER', 'ADMIN']
    },
    {
      name: 'Quản trị bàn',
      path: '/tables/admin',
      icon: <TableIcon className="h-5 w-5" />,
      roles: ['MANAGER', 'ADMIN']
    },
    {
      name: 'Báo Cáo',
      path: '/reports',
      icon: <BarChartIcon className="h-5 w-5" />,
      roles: ['MANAGER', 'CASHIER', 'ADMIN']
    },
    {
      name: 'Nhân Viên',
      path: '/users',
      icon: <PersonIcon className="h-5 w-5" />,
      roles: ['MANAGER', 'ADMIN']
    },
  ];

  // Chỉ hiển thị các menu items mà user có quyền truy cập
  const filteredNav = navigation.filter(item => 
    user?.role && item.roles.includes(user.role as UserRole)
  );

  return (
    <div className="fixed top-0 left-0 h-screen w-[240px] bg-[#1E2124] text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Nhà Hàng App</h2>
      </div>
      
      {user && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
              <PersonIcon className="h-4 w-4 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role?.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}
      
      <ScrollArea className="flex-1">
        <nav className="grid gap-1 p-2">
          {filteredNav.map((item) => (
            <Link 
              key={item.name}
              to={item.path} 
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-3 text-sm transition-colors",
                location.pathname === item.path 
                  ? "bg-primary text-white" 
                  : "text-gray-200 hover:bg-gray-700 hover:text-white"
              )}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {item.icon}
              </div>
              {item.name}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      
      <div className="p-2 mt-auto">
        <Separator className="my-2 bg-gray-700" />
        <Button
          variant="ghost"
          className="w-full justify-start text-sm text-gray-400 hover:bg-[#2E3236] hover:text-white"
          onClick={() => setShowLogoutDialog(true)}
        >
          <ExitIcon className="mr-2 h-4 w-4" />
          Đăng xuất
        </Button>
      </div>

      {/* Dialog Xác nhận đăng xuất */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận đăng xuất</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                logout();
                setShowLogoutDialog(false);
              }}
            >
              Đăng xuất
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Hủy bỏ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};