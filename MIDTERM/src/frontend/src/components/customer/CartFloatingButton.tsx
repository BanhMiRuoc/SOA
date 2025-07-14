import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useTableStore } from '@/store/tableStore';
import { formatCurrency } from '@/lib/utils';

interface CartFloatingButtonProps {
  onClick: () => void;
}

export const CartFloatingButton = ({ onClick }: CartFloatingButtonProps) => {
  const { totalItems, totalAmount } = useCartStore();
  const { tableNumber } = useTableStore();

  return (
    <button
      onClick={onClick}
      className="fixed bottom-0 right-3.5 bg-red-600 rounded-none text-white py-4 px-8 flex items-center gap-3 z-50 shadow-xl hover:bg-red-700 transition-color text-lg"
    >
      <div className="flex items-center gap-3">
        <span className="font-medium text-lg">Bàn {tableNumber}</span>
        <span className="text-white/70 ">|</span>
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full h-5 w-5 flex items-center justify-center font-bold text-[12px]">
              {totalItems}
            </span>
          )}
        </div>
        <span className="font-medium text-lg">
          {formatCurrency(totalAmount)}
        </span>
      </div>
    </button>
  );
}; 