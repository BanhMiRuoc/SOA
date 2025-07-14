import { useState } from "react";
import { MenuItem } from "@/types/menu.types";
import { updateMenuItem } from "@/components/menu/menuService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EditMenuItemProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedItem: MenuItem) => void;
}

export const EditMenuItem = ({ item, isOpen, onClose, onUpdate }: EditMenuItemProps) => {
  // Initialize form with ALL existing values to prevent null values
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    isSpicy: item.isSpicy,
    kitchenType: item.kitchenType,
    isAvailable: item.isAvailable, // Preserve isAvailable
    isHidden: item.isHidden, // Preserve isHidden
    imageUrl: item.imageUrl // Preserve imageUrl
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(item.imageUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview for the image
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Không cần cập nhật imageUrl ở đây, sẽ lấy từ response API sau khi upload
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Create a copy of formData to work with, giữ nguyên imageUrl cũ nếu không upload file mới
      let updatedFormData = { ...formData };
      
      // If there's a new image file, we need to handle it first
      if (imageFile) {
        // Create a FormData object for file upload
        const fileData = new FormData();
        fileData.append("file", imageFile);
        
        // Upload the file - you'll need an API endpoint for this
        try {
          const response = await fetch("http://localhost:8080/api/upload", {
            method: "POST",
            body: fileData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error("Failed to upload image");
          }
          
          // If successful, the backend should return the file URL
          const data = await response.json();
          if (data.imageUrl) {
            // Update the imageUrl in our local copy với tên file đã được server tạo
            updatedFormData = { ...updatedFormData, imageUrl: data.imageUrl };
          }
        } catch (error) {
          toast("Lỗi tải ảnh lên", {
            description: "Không thể tải ảnh lên. Vui lòng thử lại sau.",
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Now update the menu item with all fields preserved
      const updatedItem = await updateMenuItem(item.id, updatedFormData);
      
      toast("Cập nhật thành công", {
        description: `Món ${updatedItem.name} đã được cập nhật.`,
      });
      
      // Update formData with the latest values
      setFormData(updatedItem);
      
      // Set the previewImage to the new imageUrl
      if (updatedItem.imageUrl) {
        // If we uploaded a new image, the preview is already set as a data URL
        // Only update if we didn't upload a new image
        if (!imageFile) {
          setPreviewImage(updatedItem.imageUrl);
        }
      }
      
      // Reset the imageFile
      setImageFile(null);
      
      onUpdate(updatedItem);
      onClose();
    } catch (error) {
      toast("Lỗi cập nhật", {
        description: "Không thể cập nhật món ăn. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa món ăn</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin chi tiết của món ăn. Nhấn lưu để áp dụng thay đổi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Tên món
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Giá
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={handleNumberChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Mô tả
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Danh mục
              </label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="kitchenType" className="text-sm font-medium">
                Loại bếp
              </label>
              <Select
                value={formData.kitchenType}
                onValueChange={(value) => handleSelectChange("kitchenType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại bếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOT_KITCHEN">Bếp nóng</SelectItem>
                  <SelectItem value="COLD_KITCHEN">Bếp lạnh</SelectItem>
                  <SelectItem value="BAR">Quầy bar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image upload section */}
          <div className="space-y-2">
            <Label htmlFor="imageUpload" className="text-sm font-medium">
              Hình ảnh món ăn
            </Label>
            <div className="flex items-center gap-4">
              {previewImage && (
                <div className="relative w-24 h-24 rounded-md overflow-hidden">
                  <img 
                    src={previewImage.startsWith('data:') 
                      ? previewImage 
                      : `http://localhost:8080/api/images/${previewImage}`} 
                    alt={formData.name || 'Món ăn'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback image if the image doesn't load
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                </div>
              )}
              <Input
                id="imageUpload"
                name="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="max-w-[250px]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isSpicy"
              checked={formData.isSpicy}
              onCheckedChange={(checked) => 
                handleCheckboxChange("isSpicy", checked === true)
              }
            />
            <label
              htmlFor="isSpicy"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Món cay
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang cập nhật..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};