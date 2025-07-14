import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import { CalendarIcon, DollarSign, Receipt, Users } from 'lucide-react';
import axios from 'axios';
import { getToken } from '@/utils/auth';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Hàm chuyển đổi mã phương thức thanh toán sang tên hiển thị
const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case 'CASH': return 'Tiền mặt';
    case 'CREDIT_CARD': return 'Thẻ tín dụng';
    case 'DEBIT_CARD': return 'Thẻ ghi nợ';
    case 'MOMO': return 'Ví MoMo';
    case 'VNPAY': return 'VNPay';
    case 'ZALOPAY': return 'ZaloPay';
    default: return method;
  }
};

interface HourlyData {
  hour: string;
  orderCount: number;
  totalAmount: number;
}

interface DashboardData {
  today: {
    totalRevenue: number;
    orderCount: number;
    averageOrderValue: number;
    activeTables: number;
    totalTables: number;
  };
  revenue: {
    period: string;
    amount: number;
  }[];
  topCategories: {
    category: string;
    totalSales: number;
  }[];
  paymentMethods: {
    method: string;
    count: number;
  }[];
  hourlyData: HourlyData[]; // Thêm dữ liệu theo giờ
}

// Định nghĩa các khung giờ/ca
const timeSlots = [
  { id: 'morning', label: 'Sáng (6h-11h)', hours: [6, 7, 8, 9, 10] },
  { id: 'lunch', label: 'Trưa (11h-14h)', hours: [11, 12, 13] },
  { id: 'afternoon', label: 'Chiều (14h-18h)', hours: [14, 15, 16, 17] },
  { id: 'evening', label: 'Tối (18h-22h)', hours: [18, 19, 20, 21] },
  { id: 'night', label: 'Đêm (22h-6h)', hours: [22, 23, 0, 1, 2, 3, 4, 5] }
];

export const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(['morning', 'lunch', 'afternoon', 'evening']);
  const [hourlyViewType, setHourlyViewType] = useState<'revenue' | 'count'>('revenue');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Lấy dữ liệu báo cáo hôm nay
      const todayResponse = await axios.get(`${API_URL}/reports/today`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      // Lấy dữ liệu báo cáo 7 ngày qua
      const weeklyResponse = await axios.get(`${API_URL}/reports/last7days`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      // Lấy thông tin bàn đang hoạt động
      const tablesResponse = await axios.get(`${API_URL}/tables`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      // Tạo dữ liệu cho dashboard
      const data: DashboardData = {
        today: {
          totalRevenue: todayResponse.data.totalRevenue || 0,
          orderCount: todayResponse.data.totalOrders || 0,
          averageOrderValue: todayResponse.data.averageOrderValue || 0,
          activeTables: tablesResponse.data.filter((table: any) => table.status === 'OCCUPIED').length,
          totalTables: tablesResponse.data.length
        },
        revenue: weeklyResponse.data.revenueByPeriod || [],
        topCategories: (weeklyResponse.data.categorySales || [])
          .sort((a: any, b: any) => b.totalSales - a.totalSales)
          .slice(0, 5),
        paymentMethods: countPaymentMethods(weeklyResponse.data.orders || []),
        hourlyData: todayResponse.data.hourlyData || [] // Lấy dữ liệu theo giờ từ API
      };
      
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
      toast.error('Không thể tải dữ liệu dashboard');
      setLoading(false);
    }
  };
  
  // Đếm số lượng theo phương thức thanh toán
  const countPaymentMethods = (orders: any[]) => {
    const methodCounts: Record<string, number> = {};
    
    orders.forEach(order => {
      const method = order.paymentMethod || 'UNKNOWN';
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    
    return Object.entries(methodCounts).map(([method, count]) => ({
      method,
      count
    }));
  };

  // Biểu đồ doanh thu theo ngày
  const revenueData = {
    labels: dashboardData?.revenue.map(item => item.period) || [],
    datasets: [
      {
        label: 'Doanh thu',
        data: dashboardData?.revenue.map(item => item.amount) || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };
  
  const revenueOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Doanh thu 7 ngày qua',
      },
    },
  };

  // Biểu đồ danh mục bán chạy
  const categoriesData = {
    labels: dashboardData?.topCategories.map(cat => cat.category) || [],
    datasets: [
      {
        label: 'Doanh thu',
        data: dashboardData?.topCategories.map(cat => cat.totalSales) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Biểu đồ phương thức thanh toán
  const paymentMethodsData = {
    labels: dashboardData?.paymentMethods.map(pm => getPaymentMethodLabel(pm.method)) || [],
    datasets: [
      {
        label: 'Số lượng thanh toán',
        data: dashboardData?.paymentMethods.map(pm => pm.count) || [],
        backgroundColor: [
          'rgba(255, 159, 64, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Xử lý khi chọn/bỏ chọn khung giờ
  const handleTimeSlotToggle = (timeSlotId: string) => {
    setSelectedTimeSlots(prev => {
      // Nếu đã chọn, bỏ chọn
      if (prev.includes(timeSlotId)) {
        return prev.filter(id => id !== timeSlotId);
      }
      // Nếu chưa chọn, thêm vào
      return [...prev, timeSlotId];
    });
  };

  // Lọc dữ liệu theo giờ dựa trên khung giờ đã chọn
  const getFilteredHourlyData = () => {
    if (!dashboardData?.hourlyData) return [];

    // Lấy tất cả các giờ từ các khung giờ đã chọn
    const selectedHours = timeSlots
      .filter(slot => selectedTimeSlots.includes(slot.id))
      .flatMap(slot => slot.hours);
    
    // Lọc dữ liệu theo giờ
    return dashboardData.hourlyData.filter(data => {
      const hour = parseInt(data.hour.split(':')[0]);
      return selectedHours.includes(hour);
    });
  };

  // Tạo dữ liệu cho biểu đồ phân tích theo giờ
  const hourlyChartData = {
    labels: getFilteredHourlyData().map(item => item.hour),
    datasets: [
      {
        label: hourlyViewType === 'revenue' ? 'Doanh thu' : 'Số đơn hàng',
        data: getFilteredHourlyData().map(item => 
          hourlyViewType === 'revenue' ? item.totalAmount : item.orderCount
        ),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Tổng hợp dữ liệu theo ca
  const getTimeSlotSummary = () => {
    if (!dashboardData?.hourlyData) return [];

    return timeSlots.map(slot => {
      // Lọc dữ liệu theo giờ thuộc khung giờ này
      const hoursData = dashboardData.hourlyData.filter(data => {
        const hour = parseInt(data.hour.split(':')[0]);
        return slot.hours.includes(hour);
      });

      // Tính tổng
      const totalRevenue = hoursData.reduce((sum, item) => sum + item.totalAmount, 0);
      const totalOrders = hoursData.reduce((sum, item) => sum + item.orderCount, 0);

      return {
        id: slot.id,
        label: slot.label,
        revenue: totalRevenue,
        orders: totalOrders,
        selected: selectedTimeSlots.includes(slot.id)
      };
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Tính giờ cao điểm
  const getPeakHour = () => {
    if (!dashboardData?.hourlyData || dashboardData.hourlyData.length === 0) return 'N/A';
    
    const sortedData = [...dashboardData.hourlyData].sort((a, b) => {
      return hourlyViewType === 'revenue' 
        ? b.totalAmount - a.totalAmount 
        : b.orderCount - a.orderCount;
    });
    
    return sortedData[0].hour;
  };

  // Tìm ca cao điểm
  const getPeakTimeSlot = () => {
    const summary = getTimeSlotSummary();
    if (!summary.length) return 'N/A';
    
    const sorted = [...summary].sort((a, b) => {
      return hourlyViewType === 'revenue'
        ? b.revenue - a.revenue
        : b.orders - a.orders;
    });
    
    return sorted[0].label;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải...</p>
        </div>
      ) : dashboardData ? (
        <div className="space-y-6">
          {/* Thẻ tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doanh thu hôm nay</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.today.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">{dashboardData.today.orderCount} đơn hàng</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Giá trị đơn trung bình</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.today.orderCount > 0 
                    ? formatCurrency(dashboardData.today.averageOrderValue) 
                    : '0 ₫'}
                </div>
                <p className="text-xs text-muted-foreground">Tính trên {dashboardData.today.orderCount} đơn hàng</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bàn đang sử dụng</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.today.activeTables}/{dashboardData.today.totalTables}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((dashboardData.today.activeTables / dashboardData.today.totalTables) * 100)}% công suất
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ngày trong tuần</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long' })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Phân tích theo giờ/ca */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê hôm nay</CardTitle>
              <CardDescription>Doanh thu và số lượng đơn hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-4">
                    {timeSlots.map((slot) => (
                      <div className="flex items-center space-x-2" key={slot.id}>
                        <Checkbox 
                          id={`time-slot-${slot.id}`}
                          checked={selectedTimeSlots.includes(slot.id)}
                          onCheckedChange={() => handleTimeSlotToggle(slot.id)}
                        />
                        <Label htmlFor={`time-slot-${slot.id}`}>{slot.label}</Label>
                      </div>
                    ))}
                  </div>
                  <Tabs value={hourlyViewType} onValueChange={(v) => setHourlyViewType(v as 'revenue' | 'count')}>
                    <TabsList>
                      <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
                      <TabsTrigger value="count">Số lượng</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                  <div className="bg-stone-50 p-3 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">Doanh thu</div>
                    <div className="text-xl font-bold">
                      {formatCurrency(getTimeSlotSummary()
                        .filter(slot => selectedTimeSlots.includes(slot.id))
                        .reduce((sum, slot) => sum + slot.revenue, 0))}
                    </div>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">Số lượng đơn</div>
                    <div className="text-xl font-bold">
                      {getTimeSlotSummary()
                        .filter(slot => selectedTimeSlots.includes(slot.id))
                        .reduce((sum, slot) => sum + slot.orders, 0)}
                    </div>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">
                      {hourlyViewType === 'revenue' ? 'Tổng doanh thu' : 'Tổng số đơn'}
                    </div>
                    <div className="text-xl font-bold">
                      {hourlyViewType === 'revenue' 
                        ? formatCurrency(getTimeSlotSummary()
                            .filter(slot => selectedTimeSlots.includes(slot.id))
                            .reduce((sum, slot) => sum + slot.revenue, 0))
                        : getTimeSlotSummary()
                            .filter(slot => selectedTimeSlots.includes(slot.id))
                            .reduce((sum, slot) => sum + slot.orders, 0)}
                    </div>
                  </div>
                </div>

                {getFilteredHourlyData().length > 0 ? (
                  <div className="h-[300px]">
                    <Bar
                      data={hourlyChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const value = context.raw as number;
                                return hourlyViewType === 'revenue'
                                  ? `Doanh thu: ${formatCurrency(value)}`
                                  : `Số đơn: ${value}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: hourlyViewType === 'revenue' ? {
                              callback: function(value) {
                                return formatCurrency(value as number);
                              }
                            } : undefined
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-[300px] text-gray-500">
                    Không có dữ liệu cho các khung giờ đã chọn
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Biểu đồ và thống kê */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Doanh thu theo ngày</CardTitle>
                <CardDescription>
                  Thống kê doanh thu trong 7 ngày qua
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Line data={revenueData} options={revenueOptions} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Top 5 danh mục</CardTitle>
                <CardDescription>
                  Doanh thu theo danh mục trong 7 ngày qua
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Doughnut 
                  data={categoriesData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                  height={200}
                />
              </CardContent>
            </Card>
          </div>

          {/* Phương thức thanh toán */}
          <Card>
            <CardHeader>
              <CardTitle>Phương thức thanh toán</CardTitle>
              <CardDescription>
                Số lượng đơn hàng theo phương thức thanh toán trong 7 ngày qua
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar 
                  data={paymentMethodsData}
                  options={{
                    indexAxis: 'y' as const,
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          Không thể tải dữ liệu dashboard
        </div>
      )}
    </div>
  );
}; 