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
import { Waiter } from '@/types/table.types';

interface AssignWaiterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  waiters: Waiter[];
  selectedWaiter: Waiter | null;
  selectedTablesCount: number;
  isSubmitting: boolean;
  onWaiterSelect: (waiter: Waiter) => void;
  onConfirm: () => void;
}

export const AssignWaiterDialog: React.FC<AssignWaiterDialogProps> = ({
  isOpen,
  onOpenChange,
  waiters,
  selectedWaiter,
  selectedTablesCount,
  isSubmitting,
  onWaiterSelect,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gán nhân viên phục vụ</DialogTitle>
          <DialogDescription>
            Chọn nhân viên phục vụ cho {selectedTablesCount} bàn đã chọn
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-2">
            {waiters.map(waiter => (
              <div
                key={waiter.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedWaiter?.id === waiter.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/30'
                }`}
                onClick={() => onWaiterSelect(waiter)}
              >
                <div className="font-medium text-sm">{waiter.name}</div>
                <div className="text-xs text-muted-foreground">{waiter.email}</div>
              </div>
            ))}
          </div>
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
            disabled={isSubmitting || !selectedWaiter}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};