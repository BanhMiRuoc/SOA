import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenuStore } from '@/store/menuStore';
import { useTableStore } from '@/store/tableStore';
import { CategorySidebar } from '@/components/customer/CategorySidebar';
import { MenuGrid } from '@/components/customer/MenuGrid';
import { CartFloatingButton } from '@/components/customer/CartFloatingButton';
import { OrderHeader } from '@/components/customer/OrderHeader';
import { OrderDrawer } from '@/components/customer/OrderDrawer';

export const CustomerOrderPage = () => {
  // Sử dụng store thay vì local state
  const { 
    loading,
    setCategories,
    fetchMenuItems,
    fetchMenuItemsByCategory,
    selectedCategory,
    getFilteredItems
  } = useMenuStore();

  const { tableNumber, setTableNumber } = useTableStore();
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const navigate = useNavigate();

  // Fetch categories một lần duy nhất
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/categories');
      if (!response.ok) throw new Error('Lỗi kết nối');
      const data = await response.json();
      
      // API trả về Set<String> nên cần chuyển sang định dạng Category[]
      // data là mảng các chuỗi: ["Sushi", "Mì", "Cơm", ...]
      const categoriesFromAPI = data.map((categoryName: string) => ({
        id: categoryName,
        name: categoryName
      }));
      // Thêm "Tất Cả" vào đầu danh sách
      const allCategories = [
        { id: "all", name: "Tất Cả" },
        ...categoriesFromAPI
      ];
      
      setCategories(allCategories);
      console.log("Categories loaded:", allCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Không cần làm gì vì đã có danh mục mặc định
    }
  }, [setCategories]);

  // Xử lý khởi tạo dữ liệu
  useEffect(() => {
    if (isInitialized) return;

    const init = async () => {
      // Get table number from localStorage
      const storedTable = localStorage.getItem('tableNumber');
      if (storedTable && !tableNumber) {
        setTableNumber(storedTable);
      } else if (!tableNumber) {
        // Redirect to table selection if no table number
        navigate('/table-selection');
        return;
      }
      
      // Fetch data only once
      await fetchCategories();
      await fetchMenuItems();
      setIsInitialized(true);
    };

    init();
  }, [
    isInitialized, 
    navigate, 
    tableNumber, 
    setTableNumber, 
    fetchCategories, 
    fetchMenuItems
  ]);

  // Fetch món ăn theo danh mục chỉ khi selectedCategory thay đổi
  // và component đã được khởi tạo
  useEffect(() => {
    if (!isInitialized) return;
    
    if (selectedCategory !== 'all') {
      fetchMenuItemsByCategory(selectedCategory);
    }
  }, [selectedCategory, fetchMenuItemsByCategory, isInitialized]);

  // Lấy các món ăn đã lọc từ store
  const filteredItems = getFilteredItems();

  // Mở OrderDrawer
  const openOrderDrawer = () => {
    setIsOrderDrawerOpen(true)
  };

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      {/* Left Sidebar */}
      <CategorySidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - Chỉ giữ lại thanh tìm kiếm và nút đăng xuất */}
        <OrderHeader />

        {/* Menu Content */}
        <main className="flex-1 overflow-auto bg-neutral-900">
          <MenuGrid loading={loading} items={filteredItems} />
        </main>
        
        {/* Unified Order Drawer */}
        <OrderDrawer
          open={isOrderDrawerOpen}
          onClose={() => setIsOrderDrawerOpen(false)}
        />
        
        {/* Floating Cart Button */}
        <CartFloatingButton onClick={openOrderDrawer} />
      </div>
    </div>
  );
}; 