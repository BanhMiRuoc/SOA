import { useState } from "react";
import { MenuItem } from "@/types/menu.types";
import { addMenuItem } from "@/components/menu/menuService";
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

interface CreateMenuItemProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newItem: MenuItem) => void;
}

export const CreateMenuItem = ({ isOpen, onClose, onCreated }: CreateMenuItemProps) => {
  // Initialize form with default values
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    category: "",
    isSpicy: false,
    kitchenType: "HOT_KITCHEN",
    isAvailable: true,
    isHidden: false,
    imageUrl: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
      
      // Create a copy of formData without imageUrl nếu có file mới
      // imageUrl sẽ được cập nhật sau khi upload file
      let updatedFormData: Omit<MenuItem, 'id'> = {
        name: formData.name || '',
        description: formData.description || '',
        price: formData.price || 0,
        category: formData.category || '',
        isSpicy: formData.isSpicy || false,
        kitchenType: formData.kitchenType || 'HOT_KITCHEN',
        isAvailable: formData.isAvailable !== undefined ? formData.isAvailable : true,
        isHidden: formData.isHidden !== undefined ? formData.isHidden : false,
        imageUrl: ''  // Sẽ được cập nhật sau nếu có file
      };
      
      // If there's an image file, we need to handle it first
      if (imageFile) {
        // Create a FormData object for file upload
        const fileData = new FormData();
        fileData.append("file", imageFile);
        
        // Upload the file
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
      
      // Create the menu item
      const newItem = await addMenuItem(updatedFormData);
      
      toast("Thêm món thành công", {
        description: `Món ${newItem.name} đã được thêm vào thực đơn.`,
      });
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "",
        isSpicy: false,
        kitchenType: "HOT_KITCHEN",
        isAvailable: true,
        isHidden: false,
        imageUrl: ""
      });
      setPreviewImage(null);
      setImageFile(null);
      
      onCreated(newItem);
      onClose();
    } catch (error) {
      toast("Lỗi thêm món", {
        description: "Không thể thêm món ăn. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm món ăn mới</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết của món ăn mới. Nhấn lưu để thêm vào thực đơn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Tên món
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Giá
              </Label>
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
            <Label htmlFor="description" className="text-sm font-medium">
              Mô tả
            </Label>
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
              <Label htmlFor="category" className="text-sm font-medium">
                Danh mục
              </Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kitchenType" className="text-sm font-medium">
                Loại bếp
              </Label>
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
                    src={previewImage} 
                    alt={formData.name || 'Món ăn mới'} 
                    className="w-full h-full object-cover"
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
            <Label
              htmlFor="isSpicy"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Món cay
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang thêm..." : "Thêm món ăn"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 