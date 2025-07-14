import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { UserRoles } from '@/types/user.types';
import { toast } from 'sonner';
import { Table } from '@/types/table.types';
import { RefreshCw, Plus, Eye, EyeOff, Edit } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const TableAdminPage = () => {
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State cho quản lý bàn
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [newTable, setNewTable] = useState<{
    tableNumber: string;
    zone: string;
    capacity: number;
  }>({
    tableNumber: '',
    zone: '',
    capacity: 4
  });
  const [editMode, setEditMode] = useState(false);

  // Hàm lấy tất cả bàn bao gồm cả đã ẩn cho quản lý
  const fetchTables = useCallback(async () => {
    if (user?.role !== UserRoles.MANAGER) return;
    
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/tables/all', {
        headers: { 'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}` }
      });
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching all tables:', error);
      toast.error('Không thể tải danh sách bàn đầy đủ');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === UserRoles.MANAGER) {
      fetchTables();
    }
  }, [fetchTables, user]);

  // Functions for table management
  const handleCreateTable = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate input
      if (!newTable.tableNumber || !newTable.zone || newTable.capacity <= 0) {
        toast.error('Vui lòng điền đầy đủ thông tin bàn');
        return;
      }
      
      const tableData = {
        tableNumber: newTable.tableNumber,
        zone: newTable.zone,
        capacity: newTable.capacity,
        status: 'AVAILABLE',
        isActive: true
      };
      
      let endpoint, method;
      
      if (editMode && selectedTable) {
        endpoint = `http://localhost:8080/api/tables/${selectedTable.id}`;
        method = 'put';
      } else {
        endpoint = 'http://localhost:8080/api/tables';
        method = 'post';
      }
      
      await axios({
        method,
        url: endpoint,
        data: tableData,
        headers: { 'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}` }
      });
      
      toast.success(editMode ? 'Đã cập nhật bàn thành công' : 'Đã thêm bàn mới thành công');
      
      // Reset form và đóng dialog
      setNewTable({ tableNumber: '', zone: '', capacity: 4 });
      setIsTableDialogOpen(false);
      setEditMode(false);
      
      // Refresh data
      fetchTables();
      
    } catch (error: any) {
      console.error('Error creating/updating table:', error);
      let errorMsg = 'Đã xảy ra lỗi khi lưu thông tin bàn';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditTable = (table: Table) => {
    setSelectedTable(table);
    setNewTable({
      tableNumber: table.tableNumber,
      zone: table.zone,
      capacity: table.capacity
    });
    setEditMode(true);
    setIsTableDialogOpen(true);
  };
  
  const handleToggleTableVisibility = async (table: Table) => {
    try {
      const endpoint = `http://localhost:8080/api/tables/${table.id}/${table.isActive ? 'hide' : 'show'}`;
      
      await axios.post(endpoint, {}, {
        headers: { 'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}` }
      });
      
      toast.success(`Đã ${table.isActive ? 'ẩn' : 'hiện'} bàn ${table.tableNumber}`);
      
      // Refresh data
      fetchTables();
      
    } catch (error) {
      console.error('Error toggling table visibility:', error);
      toast.error('Đã xảy ra lỗi khi thay đổi trạng thái hiển thị của bàn');
    }
  };

  // Chỉ MANAGER mới có quyền quản lý bàn
  if (user?.role !== UserRoles.MANAGER) {
    return (
      <div className="container px-4 py-10">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Không có quyền truy cập</CardTitle>
            <CardDescription>
              Bạn không có quyền để xem trang quản trị bàn. Vui lòng liên hệ người quản trị để được hỗ trợ.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản trị bàn</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchTables}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button 
            onClick={() => {
              setNewTable({ tableNumber: '', zone: '', capacity: 4 });
              setEditMode(false);
              setIsTableDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm bàn mới
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tất cả bàn</CardTitle>
          <CardDescription>Quản lý tất cả bàn trong nhà hàng, bao gồm cả bàn đã ẩn</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <UITable>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Mã bàn</TableHead>
                  <TableHead>Khu vực</TableHead>
                  <TableHead>Sức chứa</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hiển thị</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      Không có bàn nào được tìm thấy
                    </TableCell>
                  </TableRow>
                ) : (
                  tables.map(table => (
                    <TableRow key={table.id} className={!table.isActive ? 'opacity-60' : ''}>
                      <TableCell>{table.id}</TableCell>
                      <TableCell>{table.tableNumber}</TableCell>
                      <TableCell>{table.zone}</TableCell>
                      <TableCell>{table.capacity}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          table.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                          table.status === 'OCCUPIED' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {table.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {table.isActive ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Hiển thị</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Ẩn</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditTable(table)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={table.isActive ? "outline" : "default"} 
                            size="icon"
                            onClick={() => handleToggleTableVisibility(table)}
                          >
                            {table.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </UITable>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog thêm/sửa bàn */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Chỉnh sửa thông tin bàn' : 'Thêm bàn mới'}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? 'Chỉnh sửa thông tin bàn hiện có trong hệ thống' 
                : 'Thêm một bàn mới vào hệ thống quản lý nhà hàng'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tableNumber" className="text-right">
                Mã bàn
              </Label>
              <Input
                id="tableNumber"
                value={newTable.tableNumber}
                onChange={(e) => setNewTable({...newTable, tableNumber: e.target.value})}
                className="col-span-3"
                placeholder="A_01"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zone" className="text-right">
                Khu vực
              </Label>
              <Input
                id="zone"
                value={newTable.zone}
                onChange={(e) => setNewTable({...newTable, zone: e.target.value})}
                className="col-span-3"
                placeholder="A"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">
                Sức chứa
              </Label>
              <Input
                id="capacity"
                type="number"
                value={newTable.capacity}
                onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value) || 0})}
                className="col-span-3"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsTableDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleCreateTable} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : editMode ? 'Cập nhật' : 'Thêm bàn'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 