// src/components/menu/MenuGrid.tsx
import { useEffect, useState, useCallback } from 'react';
import { MenuItem as MenuItemType } from '@/types/menu.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MenuItem } from './MenuItem';
import { ArrowUpDown } from "lucide-react";

interface MenuGridProps {
  selectedCategory: string;
  searchQuery: string;
  filters: {
    spicy: boolean;
    available: boolean | null;
    kitchenType: string;
  };
  refreshKey?: number;
}

export const MenuGrid = ({
  selectedCategory,
  searchQuery,
  filters,
  refreshKey = 0
}: MenuGridProps) => {
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{column: string, direction: 'asc' | 'desc'}>({
    column: 'name',
    direction: 'asc'
  });

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/menu');
      if (!response.ok) throw new Error('Lỗi Kết Nối');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      const errorMessage = err instanceof Error && err.message === 'Failed to fetch' ? 'Lỗi Kết Nối' : (err instanceof Error ? err.message : 'Lỗi Kết Nối');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Làm mới danh sách món ăn
  const handleRefreshItems = useCallback(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems, refreshKey]);

  const sortItems = (a: MenuItemType, b: MenuItemType) => {
    const { column, direction } = sortConfig;
    
    let comparison = 0;
    if (column === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (column === 'price') {
      comparison = a.price - b.price;
    } else if (column === 'category') {
      comparison = a.category.localeCompare(b.category);
    }
    
    return direction === 'asc' ? comparison : -comparison;
  };

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredItems = items.filter(item => {
    if (selectedCategory !== 'all' && item.category.toLowerCase() !== selectedCategory) return false;
    if (searchQuery && !(
      item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')) || 
      item.description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    )) return false;
    if (filters.spicy && !item.isSpicy) return false;
    if (filters.available !== null && item.isAvailable !== filters.available) return false;
    return true;
  }).sort(sortItems);

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="w-full overflow-hidden rounded-lg border">
        <div className="h-16 bg-muted animate-pulse rounded-t-lg"></div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Hình ảnh</TableHead>
              <TableHead>
                <div className="flex items-center space-x-1 cursor-pointer" onClick={() => handleSort('name')}>
                  <span>Tên Món</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>
                <div className="flex items-center space-x-1 cursor-pointer" onClick={() => handleSort('category')}>
                  <span>Danh mục</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-1 cursor-pointer" onClick={() => handleSort('price')}>
                  <span>Giá</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item) => (
              <MenuItem 
                key={item.id} 
                item={item} 
                onRefresh={handleRefreshItems}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Phân trang */}
      <div className="flex justify-center gap-2 mt-4 mb-4">
        <Button
          variant="outline"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </Button>
        {[...Array(totalPages)].map((_, index) => (
          <Button
            key={index}
            variant={currentPage === index + 1 ? "default" : "outline"}
            onClick={() => paginate(index + 1)}
          >
            {index + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </Button>
      </div>
    </>
  );
};