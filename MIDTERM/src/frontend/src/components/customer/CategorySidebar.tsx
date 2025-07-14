import { cn } from '@/lib/utils';
import { useMenuStore } from '@/store/menuStore';
import { Utensils } from 'lucide-react';
import { useEffect } from 'react';

export const CategorySidebar = () => {
  const { 
    categories,
    selectedCategory,
    setSelectedCategory,
    fetchMenuItemsByCategory
  } = useMenuStore();

  // Khi click vào danh mục, đảm bảo đã load dữ liệu cho danh mục đó
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Không cần gọi fetchMenuItemsByCategory ở đây nữa
    // vì đã xử lý bằng useEffect trong CustomerOrderPage
  };

  // Lọc danh mục để không hiển thị lại "Tất Cả"
  const filteredCategories = categories.filter(category => category.id !== 'all');

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 h-full flex flex-col">
      <div className="p-6 border-b border-zinc-800 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <Utensils className="h-10 w-10 text-red-500" />
          <span className="text-white text-lg font-bold mt-2">Food Order</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="py-2 pt-0">
          <button
            onClick={() => handleSelectCategory('all')}
            className={cn(
              "w-full text-left px-4 py-3 mb-1 transition-colors",
              selectedCategory === 'all' 
                ? "bg-red-600 text-white font-medium" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
          >
            Tất Cả
          </button>
          
          {filteredCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSelectCategory(category.id)}
              className={cn(
                "w-full text-left px-4 py-3 mb-1 transition-colors",
                selectedCategory === category.id 
                  ? "bg-red-600 text-white font-medium" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              )}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}; 