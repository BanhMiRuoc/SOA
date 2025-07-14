import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Check, X, Eye, EyeOff } from "lucide-react";
import { MenuItem as MenuItemType } from '@/types/menu.types';
import { formatCurrency } from '@/lib/utils';
import { toggleAvailability, toggleVisibility } from '@/components/menu/menuService';
import { toast } from "sonner";
import { EditMenuItem } from "./EditMenuItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MenuItemProps {
  item: MenuItemType;
  onEdit?: (item: MenuItemType) => void;
  onRefresh?: () => void;
}

export const MenuItem = ({ item: initialItem, onEdit, onRefresh }: MenuItemProps) => {
  const [item, setItem] = useState<MenuItemType>(initialItem);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<{
    edit: boolean;
    availability: boolean;
    visibility: boolean;
  }>({
    edit: false,
    availability: false,
    visibility: false
  });

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = (updatedItem: MenuItemType) => {
    setItem(updatedItem);
    if (onRefresh) {
      onRefresh();
    }
  };


  const handleToggleAvailability = async () => {
    try {
      setIsLoading(prev => ({ ...prev, availability: true }));
      const updatedItem = await toggleAvailability(item.id);
      setItem(updatedItem);
      toast(
        updatedItem.isAvailable ? "Món ăn đã được kích hoạt" : "Món ăn đã hết",
        {
          description: updatedItem.isAvailable
            ? `${item.name} đã được thêm vào menu.`
            : `${item.name} đã được báo hết.`,
        }
      );
    } catch (error) {
      // Error toast đã được xử lý trong toggleAvailability
    } finally {
      setIsLoading(prev => ({ ...prev, availability: false }));
    }
  };

  const handleToggleVisibility = async () => {
    try {
      setIsLoading(prev => ({ ...prev, visibility: true }));
      const updatedItem = await toggleVisibility(item.id);
      setItem(updatedItem);
      toast(
        updatedItem.isHidden ? "Món ăn đã được ẩn" : "Món ăn đã được hiện",
        {
          description: updatedItem.isHidden
            ? `${item.name} sẽ không hiển thị trong menu đặt món.`
            : `${item.name} sẽ hiển thị trong menu đặt món.`,
        }
      );
    } catch (error) {
      // Error toast đã được xử lý trong toggleVisibility
    } finally {
      setIsLoading(prev => ({ ...prev, visibility: false }));
    }
  };

  return (
    <>
      <TableRow className={!item.isAvailable ? "opacity-60" : ""}>
        <TableCell>
          <div className="w-14 h-14 rounded-md overflow-hidden">
            <img
              src={`http://localhost:8080/api/images/${item.imageUrl}`}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback image if the image doesn't load
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image";
              }}
            />
          </div>
        </TableCell>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell className="max-w-md">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm text-muted-foreground">{item.description}</p>
            {item.isSpicy && (
              <Badge variant="secondary" className="w-fit bg-red-100 text-red-500">Cay</Badge>
            )}
          </div>
        </TableCell>
        <TableCell>{item.category}</TableCell>
        <TableCell className="font-semibold">{formatCurrency(item.price)}</TableCell>
        <TableCell>
          <div className="flex flex-col gap-2">
            <Select
              defaultValue={item.isAvailable ? "available" : "unavailable"}
              onValueChange={async (value) => {
                if ((value === "available" && !item.isAvailable) ||
                    (value === "unavailable" && item.isAvailable)) {
                  await handleToggleAvailability();
                }
              }}
            >
              <SelectTrigger className={`w-[130px] ${item.isAvailable ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">
                  <div className="flex items-center">
                    <Check className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-600">Còn món</span>
                  </div>
                </SelectItem>
                <SelectItem value="unavailable">
                  <div className="flex items-center">
                    <X className="mr-1 h-3 w-3 text-red-500" />
                    <span className="text-red-600">Hết món</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={isLoading.edit}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4 mr-1" />
              Sửa
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleVisibility}
              disabled={isLoading.visibility}
              className={item.isHidden 
                ? "border border-purple-500 text-purple-600 hover:bg-purple-100 hover:text-purple-700" 
                : "border border-orange-500 text-orange-600 hover:bg-orange-100 hover:text-orange-700"}
            >
              {isLoading.visibility ? (
                'Đang xử lý...'
              ) : item.isHidden ? (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Hiện món
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Ẩn món
                </>
              )}
            </Button>
          </div>
        </TableCell>
      </TableRow>
      
      <EditMenuItem
        item={item}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={handleUpdateItem}
      />
    </>
  );
};