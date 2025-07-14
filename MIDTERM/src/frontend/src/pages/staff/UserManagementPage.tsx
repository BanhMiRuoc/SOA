import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { UserRoles, User } from '@/types/user.types';
import { toast } from 'sonner';
import { RefreshCw, Plus, Edit, UserCheck, UserX, Search, Filter } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Schema cho form tạo/sửa User
const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Tên nhân viên phải có ít nhất 2 ký tự.",
  }),
  email: z.string().email({
    message: "Email không hợp lệ.",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu phải có ít nhất 6 ký tự.",
  }).optional().or(z.literal('')),
  role: z.enum(["WAITER", "KITCHEN_STAFF", "MANAGER", "CASHIER", "ADMIN"], {
    message: "Vui lòng chọn vai trò nhân viên.",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export const UserManagementPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [editMode, setEditMode] = useState(false);

  // Khởi tạo form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'WAITER',
    },
  });

  // Hàm fetch users từ API
  const fetchUsers = useCallback(async () => {
    if (user?.role !== UserRoles.MANAGER) {
      toast.error('Bạn không có quyền truy cập chức năng này');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/users/all', {
        headers: { 'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Lọc users theo các tiêu chí tìm kiếm và lọc
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = 
      roleFilter === 'ALL' || 
      user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Hàm mở dialog để thêm nhân viên mới
  const handleAddUser = () => {
    setSelectedUser(null);
    setEditMode(false);
    form.reset({
      name: '',
      email: '',
      password: '',
      role: 'WAITER',
    });
    setIsUserDialogOpen(true);
  };

  // Hàm mở dialog để sửa thông tin nhân viên
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditMode(true);
    form.reset({
      name: user.name,
      email: user.email || '',
      password: '', // Không hiển thị mật khẩu hiện tại
      role: user.role as "WAITER" | "KITCHEN_STAFF" | "MANAGER" | "CASHIER" | "ADMIN",
    });
    setIsUserDialogOpen(true);
  };

  // Hàm xử lý vô hiệu hóa nhân viên
  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const endpoint = `http://localhost:8080/api/users/${userId}/${currentStatus ? 'deactivate' : 'activate'}`;
      
      await axios.post(endpoint, {}, {
        headers: { 'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}` }
      });
      
      toast.success(`Đã ${currentStatus ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản nhân viên`);
      
      // Refresh users list
      fetchUsers();
      
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Đã xảy ra lỗi khi thay đổi trạng thái tài khoản nhân viên');
    }
  };

  // Hàm submit form tạo/cập nhật nhân viên
  const onSubmit = async (values: UserFormValues) => {
    try {
      setIsSubmitting(true);
      
      const userData = {
        ...values,
        isActive: true,
      };
      
      // Nếu là edit mode và password trống, xóa trường password
      if (editMode && !values.password) {
        delete userData.password;
      }
      
      let endpoint, method;
      
      if (editMode && selectedUser) {
        endpoint = `http://localhost:8080/api/users/${selectedUser.id}`;
        method = 'put';
      } else {
        endpoint = 'http://localhost:8080/api/users';
        method = 'post';
      }
      
      await axios({
        method,
        url: endpoint,
        data: userData,
        headers: { 'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}` }
      });
      
      toast.success(editMode ? 'Đã cập nhật thông tin nhân viên' : 'Đã thêm nhân viên mới');
      
      // Reset form và đóng dialog
      form.reset();
      setIsUserDialogOpen(false);
      
      // Refresh users list
      fetchUsers();
      
    } catch (error: any) {
      console.error('Error saving user:', error);
      let errorMsg = 'Đã xảy ra lỗi khi lưu thông tin nhân viên';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mapping vai trò để hiển thị
  const roleMapping = {
    WAITER: 'Phục vụ',
    KITCHEN_STAFF: 'Nhân viên bếp',
    MANAGER: 'Quản lý',
    CASHIER: 'Thu ngân',
    ADMIN: 'Quản trị viên'
  };

  // Chỉ MANAGER mới có quyền truy cập trang này
  if (user?.role !== UserRoles.MANAGER) {
    return (
      <div className="container px-4 py-10">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Không có quyền truy cập</CardTitle>
            <CardDescription>
              Bạn không có quyền để xem trang quản lý nhân viên. Vui lòng liên hệ người quản trị để được hỗ trợ.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={handleAddUser}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Thanh tìm kiếm & lọc */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lọc theo vai trò" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                <SelectItem value="WAITER">Phục vụ</SelectItem>
                <SelectItem value="KITCHEN_STAFF">Nhân viên bếp</SelectItem>
                <SelectItem value="CASHIER">Thu ngân</SelectItem>
                <SelectItem value="MANAGER">Quản lý</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bảng nhân viên */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên</CardTitle>
          <CardDescription>Quản lý thông tin và trạng thái tài khoản của tất cả nhân viên</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên nhân viên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Không tìm thấy nhân viên nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className={!user.isActive ? 'opacity-60' : ''}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={
                          user.role === 'MANAGER' ? 'default' :
                          user.role === 'WAITER' ? 'outline' :
                          user.role === 'KITCHEN_STAFF' ? 'outline' :
                          user.role === 'CASHIER' ? 'destructive' : 'default'
                        }>
                          {roleMapping[user.role as keyof typeof roleMapping] || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge variant="success">
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Bị vô hiệu hóa
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={user.isActive ? "outline" : "default"} 
                            size="icon"
                            onClick={() => handleToggleUserStatus(Number(user.id), Boolean(user.isActive))}
                          >
                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog tạo/sửa nhân viên */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{editMode ? 'Cập nhật thông tin nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
                <DialogDescription>
                  {editMode ? 'Chỉnh sửa thông tin tài khoản nhân viên hiện có' : 'Tạo tài khoản mới cho nhân viên'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên nhân viên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên nhân viên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập email nhân viên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu {editMode && '(để trống nếu không thay đổi)'}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={editMode ? 'Nhập mật khẩu mới nếu cần thay đổi' : 'Nhập mật khẩu'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="WAITER">Phục vụ</SelectItem>
                          <SelectItem value="KITCHEN_STAFF">Nhân viên bếp</SelectItem>
                          <SelectItem value="CASHIER">Thu ngân</SelectItem>
                          <SelectItem value="MANAGER">Quản lý</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : editMode ? 'Cập nhật' : 'Thêm nhân viên'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};