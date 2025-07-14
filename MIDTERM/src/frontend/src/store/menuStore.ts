import { create } from 'zustand';
import { MenuItem } from '@/types/menu.types';

interface Category {
  id: string;
  name: string;
}

interface CategoryCache {
  [key: string]: MenuItem[];
}

interface PendingRequests {
  [key: string]: boolean;
}

interface MenuState {
  // Dữ liệu
  categories: Category[];
  menuItems: MenuItem[];
  
  // Cache cho từng danh mục
  categoryCache: CategoryCache;
  lastFetchTime: number | null; // Thời gian fetch dữ liệu gần nhất
  pendingRequests: PendingRequests; // Theo dõi các request đang chờ
  
  // Trạng thái
  selectedCategory: string;
  searchQuery: string;
  loading: boolean;
  
  // Actions
  setCategories: (categories: Category[]) => void;
  setMenuItems: (items: MenuItem[]) => void;
  setSelectedCategory: (categoryId: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  
  // Thêm các action cho lazy loading và cache
  fetchMenuItems: () => Promise<void>;
  fetchMenuItemsByCategory: (categoryId: string) => Promise<void>;
  
  // Helper
  getFilteredItems: () => MenuItem[];
  clearCache: () => void;
  getCachedItems: (categoryId: string) => MenuItem[] | null;
  isCacheValid: () => boolean;
  isRequestPending: (key: string) => boolean;
  setPendingRequest: (key: string, isPending: boolean) => void;
}

// Thời gian cache hợp lệ (10 phút)
const CACHE_VALIDITY_DURATION = 10 * 60 * 1000;

export const useMenuStore = create<MenuState>((set, get) => ({
  // Trạng thái ban đầu
  categories: [{ id: 'all', name: 'Tất Cả' }],
  menuItems: [],
  categoryCache: {},
  lastFetchTime: null,
  pendingRequests: {},
  selectedCategory: 'all',
  searchQuery: '',
  loading: false,
  
  // Các phương thức setter
  setCategories: (categories) => set({ categories }),
  setMenuItems: (menuItems) => {
    // Lưu thời gian fetch dữ liệu
    const lastFetchTime = Date.now();
    
    // Cập nhật cache cho danh mục "all"
    const categoryCache = { ...get().categoryCache };
    categoryCache['all'] = menuItems;
    
    set({ menuItems, categoryCache, lastFetchTime });
  },
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (loading) => set({ loading }),
  
  // Kiểm tra request có đang chờ không
  isRequestPending: (key) => {
    return !!get().pendingRequests[key];
  },
  
  // Đặt trạng thái request
  setPendingRequest: (key, isPending) => {
    const pendingRequests = { ...get().pendingRequests };
    if (isPending) {
      pendingRequests[key] = true;
    } else {
      delete pendingRequests[key];
    }
    set({ pendingRequests });
  },
  
  // Kiểm tra cache có hợp lệ không (dưới 10 phút)
  isCacheValid: () => {
    const { lastFetchTime } = get();
    if (!lastFetchTime) return false;
    
    const currentTime = Date.now();
    return (currentTime - lastFetchTime) < CACHE_VALIDITY_DURATION;
  },
  
  // Lấy dữ liệu từ cache nếu có
  getCachedItems: (categoryId) => {
    const { categoryCache, isCacheValid } = get();
    
    // Cache hết hạn
    if (!isCacheValid()) return null;
    
    // Không có dữ liệu trong cache cho danh mục này
    if (!categoryCache[categoryId]) return null;
    
    return categoryCache[categoryId];
  },
  
  // Xóa toàn bộ cache
  clearCache: () => set({ categoryCache: {}, lastFetchTime: null }),
  
  // Fetch tất cả các món ăn
  fetchMenuItems: async () => {
    const { 
      isCacheValid, 
      getCachedItems,
      isRequestPending,
      setPendingRequest
    } = get();
    
    const requestKey = 'all_items';
    
    // Kiểm tra các điều kiện để bỏ qua request
    // 1. Nếu request đang chờ
    if (isRequestPending(requestKey)) {
      console.log('Request for all items already pending, skipping...');
      return;
    }
    
    // 2. Nếu cache còn hợp lệ và có dữ liệu
    if (isCacheValid() && getCachedItems('all')) {
      console.log('Using cached menu items');
      return;
    }
    
    try {
      set({ loading: true });
      setPendingRequest(requestKey, true);
      
      const response = await fetch('http://localhost:8080/api/menu/visible');
      if (!response.ok) throw new Error('Lỗi kết nối');
      
      const data = await response.json();
      
      // Lưu thời gian fetch dữ liệu
      const lastFetchTime = Date.now();
      
      // Cập nhật cache cho danh mục "all"
      const categoryCache = { ...get().categoryCache };
      categoryCache['all'] = data;
      
      set({ menuItems: data, categoryCache, lastFetchTime, loading: false });
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      set({ menuItems: [], loading: false });
    } finally {
      setPendingRequest(requestKey, false);
    }
  },
  
  // Fetch món ăn theo danh mục
  fetchMenuItemsByCategory: async (categoryId) => {
    const { 
      isCacheValid, 
      getCachedItems, 
      categoryCache,
      isRequestPending,
      setPendingRequest,
      fetchMenuItems
    } = get();
    
    // Nếu là "all", sử dụng fetchMenuItems
    if (categoryId === 'all') {
      await fetchMenuItems();
      return;
    }
    
    const requestKey = `category_${categoryId}`;
    
    // Kiểm tra nếu request đang chờ
    if (isRequestPending(requestKey)) {
      console.log(`Request for category ${categoryId} already pending, skipping...`);
      return;
    }
    
    // Kiểm tra cache cho danh mục này
    const cachedItems = getCachedItems(categoryId);
    if (cachedItems) {
      console.log(`Using cached items for category: ${categoryId}`);
      return;
    }
    
    try {
      set({ loading: true });
      setPendingRequest(requestKey, true);
      
      // Gọi API để lấy món ăn theo danh mục
      const response = await fetch(`http://localhost:8080/api/menu/category/${categoryId}`);
      if (!response.ok) throw new Error('Lỗi kết nối');
      
      const data = await response.json();
      
      // Cập nhật cache cho danh mục này
      const newCategoryCache = { ...categoryCache };
      newCategoryCache[categoryId] = data;
      
      // Nếu trước đó chưa tải tất cả món ăn, cập nhật cache 'all'
      if (!newCategoryCache['all']) {
        // Thay vì gọi fetchMenuItems() trực tiếp, chỉ cần lấy từ union các danh mục
        // để tránh gọi API thêm
        if (Object.keys(newCategoryCache).length > 1) {
          const allItems = Object.values(newCategoryCache).flat();
          const uniqueItemsMap = new Map();
          
          allItems.forEach(item => {
            uniqueItemsMap.set(item.id, item);
          });
          
          const uniqueItems = Array.from(uniqueItemsMap.values());
          newCategoryCache['all'] = uniqueItems;
        } else {
          // Nếu đây là danh mục đầu tiên được tải, vẫn cần tải tất cả món ăn
          await fetchMenuItems();
        }
      }
      
      set({ categoryCache: newCategoryCache, loading: false });
    } catch (error) {
      console.error(`Failed to fetch items for category ${categoryId}:`, error);
      set({ loading: false });
    } finally {
      setPendingRequest(requestKey, false);
    }
  },
  
  // Lọc các món ăn dựa trên danh mục và từ khóa tìm kiếm
  getFilteredItems: () => {
    const { menuItems, selectedCategory, searchQuery, categoryCache } = get();
    
    // Lấy danh sách món ăn dựa vào danh mục đã chọn
    let filteredItems = menuItems;
    
    // Nếu có cache cho danh mục và không phải "all", sử dụng cache
    if (selectedCategory !== 'all' && categoryCache[selectedCategory]) {
      filteredItems = categoryCache[selectedCategory];
    } else if (selectedCategory !== 'all') {
      // Lọc từ danh sách đầy đủ nếu không có cache
      filteredItems = menuItems.filter(item => item.category === selectedCategory);
    }
    
    // Nếu có từ khóa tìm kiếm, lọc theo từ khóa
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filteredItems = filteredItems.filter(
        item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)
      );
    }
    
    return filteredItems;
  }
})); 