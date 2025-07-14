import { FoodItem } from '@/components/customer/FoodItem';
import { MenuItem } from '@/types/menu.types';
import { useMenuStore } from '@/store/menuStore';
import { SearchX } from 'lucide-react';

interface MenuGridProps {
  loading: boolean;
  items: MenuItem[];
}

export const MenuGrid = ({ loading, items }: MenuGridProps) => {
  const { searchQuery, menuItems } = useMenuStore();
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 pb-15">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-zinc-800 rounded-lg h-[160px] animate-pulse " />
        ))}
      </div>
    );
  }

  // Nếu không có món ăn nào và không tìm kiếm -> lỗi hệ thống
  if (items.length === 0 && menuItems.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-10 pb-15">
        <p className="text-lg font-medium mb-2">Không thể kết nối đến hệ thống</p>
        <p className="text-sm">Xin lỗi vì sự bất tiện này. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  // Nếu có tìm kiếm nhưng không tìm thấy kết quả
  if (items.length === 0 && searchQuery.trim() !== '') {
    return (
      <div className="text-center text-zinc-500 py-10 flex flex-col items-center pb-15">
        <SearchX size={48} className="text-zinc-600 mb-4" />
        <p className="text-lg font-medium mb-2">Không tìm thấy món ăn</p>
        <p className="text-sm">Không có món ăn nào phù hợp với từ khóa "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-0.5 pb-15">
      {items.map((item) => (
        <FoodItem key={item.id} item={item} />
      ))}
    </div>
  );
}; 