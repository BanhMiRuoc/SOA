import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table } from '@/types/table.types';

interface ConfirmActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'open' | 'occupy' | 'close' | 'assign';
  selectedTable: Table | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  confirmSuccess: boolean;
  onConfirm: () => void;
}

export const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
  isOpen,
  onOpenChange,
  actionType,
  selectedTable,
  errorMessage,
  isSubmitting,
  confirmSuccess,
  onConfirm
}) => {
  const getActionTitle = () => {
    switch (actionType) {
      case 'open': return "Mở bàn";
      case 'occupy': return "Bàn có khách";
      case 'close': return "Đóng bàn";
      case 'assign': return "Gán nhân viên";
      default: return "Xác nhận";
    }
  };

  const getActionDescription = () => {
    if (!selectedTable) return "";
    
    switch (actionType) {
      case 'open': return ` mở bàn ${selectedTable.tableNumber}`;
      case 'occupy': return ` chuyển trạng thái sang có khách cho bàn ${selectedTable.tableNumber}`;
      case 'close': return ` đóng bàn ${selectedTable.tableNumber}`;
      case 'assign': return ` gán nhân viên cho bàn ${selectedTable.tableNumber}`;
      default: return "";
    }
  };

  const getButtonColor = () => {
    switch (actionType) {
      case 'open': return 'bg-green-600 hover:bg-green-700';
      case 'occupy': return 'bg-blue-600 hover:bg-blue-700';
      case 'close': return 'bg-red-600 hover:bg-red-700';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {getActionTitle()}
          </DialogTitle>
          <DialogDescription>
            Xác nhận thao tác trên bàn
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {selectedTable && (
            <p>
              Bạn có chắc muốn{getActionDescription()}?
            </p>
          )}
          {errorMessage && (
            <p className="text-red-500 mt-2">{errorMessage}</p>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isSubmitting}
            className={getButtonColor()}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};