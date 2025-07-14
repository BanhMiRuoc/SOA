import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, Waiter } from '@/types/table.types';
import { TableCard } from './TableCard';

interface TableZoneProps {
  zone: string;
  tables: Table[];
  waiters: Waiter[];
  selectedTables: number[];
  selectedZones: string[];
  isWaiterOrManager: boolean;
  confirmSuccess: boolean;
  onZoneSelect: (zone: string) => void;
  onTableSelect: (tableId: number) => void;
  onViewOrder: (tableId: number) => void;
  onStatusChange: (table: Table, action: 'open' | 'occupy' | 'close') => void;
}
export const TableZone: React.FC<TableZoneProps> = ({
  zone,
  tables,
  waiters,
  selectedTables,
  selectedZones,
  isWaiterOrManager,
  confirmSuccess,
  onZoneSelect,
  onTableSelect,
  onViewOrder,
  onStatusChange
}) => {
  const tablesInZone = tables.filter(table => table.zone === zone);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox 
          id={`zone-${zone}`}
          checked={selectedZones.includes(zone)}
          onCheckedChange={() => onZoneSelect(zone)}
        />
        <h2 className="text-lg font-medium">Khu {zone}</h2>
        <span className="text-xs text-muted-foreground">
          ({tablesInZone.length} bàn)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {tablesInZone.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            waiters={waiters}
            isSelected={selectedTables.includes(table.id)}
            isWaiterOrManager={isWaiterOrManager}
            confirmSuccess={confirmSuccess}
            onSelect={onTableSelect}
            onViewOrder={onViewOrder}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
};