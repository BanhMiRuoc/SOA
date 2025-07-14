import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface MenuFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    spicy: boolean;
    available: boolean;
    kitchenType: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const MenuFilters = ({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange
}: MenuFiltersProps) => {
  const categories = [
    { label: 'Tất cả', value: 'all' },
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Tìm kiếm món ăn..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={selectedCategory}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <Switch
            checked={filters.spicy}
            onCheckedChange={(checked) => 
              onFiltersChange({ ...filters, spicy: checked })}
          />
          <span>Món cay</span>
        </label>

        <label className="flex items-center gap-2">
          <Switch
            checked={filters.available}
            onCheckedChange={(checked) => 
              onFiltersChange({ ...filters, available: checked })}
          />
          <span>Còn món</span>
        </label>
      </div>
    </div>
  );
}; 