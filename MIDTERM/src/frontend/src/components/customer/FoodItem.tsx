import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/types/menu.types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/store/cartStore';

interface FoodItemProps {
  item: MenuItem;
}

export const FoodItem = ({ item }: FoodItemProps) => {
  const [imageError, setImageError] = useState(false);
  const { items, addItem, removeItem, updateQuantity } = useCartStore();
  
  // Tìm món trong giỏ hàng nếu có
  const cartItem = items.find(cartItem => cartItem.menuItem.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddItem = () => {
    addItem(item, 1);
  };

  const handleRemoveItem = () => {
    if (quantity > 1) {
      updateQuantity(item.id, quantity - 1);
    } else if (quantity === 1) {
      removeItem(item.id);
    }
  };

  return (
    <Card className="bg-white text-black overflow-hidden h-[160px] flex flex-row p-0 rounded-none">
      <div className="relative w-[160px] h-full bg-black">
        {!imageError ? (
          <img 
            src={`http://localhost:8080/api/images/${item.imageUrl}`} 
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
            <div className="text-center px-4">
              <p className="text-zinc-600 font-medium text-sm">{item.name}</p>
            </div>
          </div>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-medium">Hết món</span>
          </div>
        )}
      </div>
      <CardContent className="flex-1 p-4">
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-black text-lg line-clamp-1">{item.name}</h3>
              <span className="font-medium text-red-500 text-lg">{formatCurrency(item.price)}</span>
            </div>
            <p className="text-sm text-zinc-600 line-clamp-2 mt-2">{item.description}</p>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-zinc-600 border-zinc-300">
                {item.category}
              </Badge>
              {item.isSpicy && (
                <Badge variant="destructive">
                  Cay
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {quantity > 0 ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleRemoveItem}
                    className="h-9 w-9 text-zinc-600 hover:text-black hover:bg-zinc-100"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span className="text-black w-4 text-center text-lg">{quantity}</span>
                </>
              ) : null}
              <Button 
                size="icon" 
                onClick={handleAddItem}
                className="h-9 w-9 bg-red-600 hover:bg-red-700 text-white"
                disabled={!item.isAvailable}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 