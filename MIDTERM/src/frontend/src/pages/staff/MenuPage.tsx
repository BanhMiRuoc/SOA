import { useState } from 'react';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateMenuItem } from '@/components/menu/CreateMenuItem';
import { MenuItem } from '@/types/menu.types';

const CATEGORIES = [
    { label: 'Danh mục', value: 'all' },
    { label: 'Sushi', value: 'sushi' },
    { label: 'Sashimi', value: 'sashimi' },
    { label: 'Mì', value: 'mì' },
    { label: 'Món Nướng', value: 'món nướng' },
    { label: 'Món Chiên', value: 'món chiên' },
    { label: 'Cơm', value: 'cơm' },
    { label: 'Salad', value: 'salad' },
    { label: 'Món Phụ', value: 'món phụ' },
    { label: 'Đồ Uống', value: 'đồ uống' }
];

interface Filters {
  spicy: boolean;
  available: boolean | null;
  kitchenType: string;
}

export const MenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    spicy: false,
    available: null,
    kitchenType: 'all'
  });

  const handleAvailabilityChange = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      available: value === "available" ? true : value === "unavailable" ? false : null 
    }));
  };

  const handleCreateSuccess = (newItem: MenuItem) => {
    setIsCreateDialogOpen(false);
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quản lý Thực Đơn</h1>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm món ăn mới
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Input
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.available === true ? "available" : filters.available === false ? "unavailable" : "all"}
            onValueChange={handleAvailabilityChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Còn/Hết</SelectItem>
              <SelectItem value="available">Còn món</SelectItem>
              <SelectItem value="unavailable">Hết món</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isSpicy"
              checked={filters.spicy}
              onCheckedChange={(checked) => 
                setFilters(prev => ({ ...prev, spicy: checked === true }))
              }
            />
            <label
              htmlFor="isSpicy"
              className="text-sm font-medium leading-none"
            >
              Món cay
            </label>
          </div>
        </div>
        {/* Menu Table */}
        <div className="rounded-lg border shadow-sm overflow-hidden">
          <MenuGrid
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            filters={filters}
            refreshKey={refreshKey}
          />
        </div>

        {/* Create Menu Item Dialog */}
        <CreateMenuItem 
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreated={handleCreateSuccess}
        />
      </div>
    </div>
  );
};