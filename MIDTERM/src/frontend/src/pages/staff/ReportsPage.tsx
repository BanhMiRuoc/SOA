import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import axios from 'axios';
import { getToken } from '@/utils/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart 
} from '@/components/ui/charts/bar-chart';
import { 
  PieChart 
} from '@/components/ui/charts/pie-chart';

// Import các component đã tách ra
import { StatCards } from '@/components/report/StatCards';
import { OrderTable } from '@/components/report/OrderTable';
import { TopProductsTable } from '@/components/report/TopProductsTable';
import { CategoryAnalysis } from '@/components/report/CategoryAnalysis';
import { TrendChart } from '@/components/report/TrendChart';
import { PaymentAnalysis } from '@/components/report/PaymentAnalysis';
import { TimeOfDayAnalysis } from '@/components/report/TimeOfDayAnalysis';
import { HourlyAnalysis } from '@/components/report/HourlyAnalysis';

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

// Định nghĩa các kiểu dữ liệu
interface OrderSummary {
  id: number;
  tableNumber: string;
  orderTime: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentTime: string;
}

interface RevenueData {
  period: string;
  amount: number;
}

interface CategorySales {
  category: string;
  totalSales: number;
  itemsSold: number;
}

interface TopSellingItem {
  menuItemId: number;
  menuItemName: string;
  category: string;
  price: number;
  quantitySold: number;
  totalSales: number;
}

interface TimeOfDayAnalysis {
  timeSlot: string;
  orderCount: number;
  totalAmount: number;
}

interface PaymentMethodAnalysis {
  method: string;
  count: number;
  amount: number;
}

interface HourlyData {
  hour: string;
  orderCount: number;
  totalAmount: number;
}

interface ReportData {
  orders: OrderSummary[];
  revenueByPeriod: RevenueData[];
  categorySales: CategorySales[];
  topSellingItems: TopSellingItem[];
  timeOfDayAnalysis: TimeOfDayAnalysis[];
  paymentMethodAnalysis: PaymentMethodAnalysis[];
  hourlyData: HourlyData[];
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const ReportsPage = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [quarter, setQuarter] = useState<number>(Math.floor(new Date().getMonth() / 3) + 1);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [orderSortBy, setOrderSortBy] = useState<'time' | 'revenue'>('time');
  const [orderSortDirection, setOrderSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      let endpoint = '';
      let queryParams = '';
      
      switch (dateRange) {
        case 'today':
          endpoint = '/reports/today';
          break;
        case 'yesterday':
          endpoint = '/reports/yesterday';
          break;
        case 'last7days':
          endpoint = '/reports/last7days';
          break;
        case 'thisMonth':
          endpoint = '/reports/this-month';
          break;
        case 'lastMonth':
          endpoint = '/reports/last-month';
          break;
        case 'quarter':
          endpoint = `/reports/quarter?quarter=${quarter}&year=${year}`;
          break;
        case 'year':
          endpoint = `/reports/year?year=${year}`;
          break;
        case 'custom':
          if (customStartDate && customEndDate) {
            endpoint = `/reports/custom-range?startDate=${customStartDate}&endDate=${customEndDate}`;
          } else {
            toast.error('Vui lòng chọn ngày bắt đầu và kết thúc');
            setLoading(false);
            return;
          }
          break;
        default:
          endpoint = '/reports/today';
      }
      
      const response = await axios.get<ReportData>(`${API_URL}${endpoint}${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      setReportData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu báo cáo:', error);
      toast.error('Không thể tải dữ liệu báo cáo');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  useEffect(() => {
    if (dateRange === 'quarter' || dateRange === 'year') {
      fetchReportData();
    }
  }, [quarter, year, dateRange]);

  // Chuẩn bị dữ liệu cho biểu đồ doanh thu
  const revenueChartData = {
    labels: reportData?.revenueByPeriod.map(item => item.period) || [],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: reportData?.revenueByPeriod.map(item => item.amount) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chuẩn bị dữ liệu cho biểu đồ danh mục
  const categoryChartData = {
    labels: reportData?.categorySales.map(item => item.category) || [],
    datasets: [
      {
        label: 'Doanh thu theo danh mục',
        data: reportData?.categorySales.map(item => item.totalSales) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',   // Hồng đậm
          'rgba(54, 162, 235, 0.7)',   // Xanh dương
          'rgba(255, 206, 86, 0.7)',   // Vàng
          'rgba(75, 192, 192, 0.7)',   // Xanh lá
          'rgba(153, 102, 255, 0.7)',  // Tím
          'rgba(255, 159, 64, 0.7)',   // Cam
          'rgba(45, 220, 190, 0.7)',   // Ngọc lam
          'rgba(238, 130, 238, 0.7)',  // Tím nhạt
          'rgba(106, 90, 205, 0.7)',   // Chàm
          'rgba(60, 179, 113, 0.7)',   // Xanh lục
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(45, 220, 190, 1)',
          'rgba(238, 130, 238, 1)',
          'rgba(106, 90, 205, 1)',
          'rgba(60, 179, 113, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Phương thức cũ làm fallback ở phía client
  const getPaymentMethodsDataFromOrders = () => {
    if (!reportData?.orders.length) return { labels: [], datasets: [{ label: '', data: [] }] };

    const paymentMethodsCount: Record<string, { count: number, amount: number }> = {};
    
    reportData.orders.forEach(order => {
      const method = order.paymentMethod;
      if (!paymentMethodsCount[method]) {
        paymentMethodsCount[method] = { count: 0, amount: 0 };
      }
      paymentMethodsCount[method].count += 1;
      paymentMethodsCount[method].amount += order.totalAmount;
    });

    const labels = Object.keys(paymentMethodsCount).map(method => getPaymentMethodLabel(method));
    const data = Object.values(paymentMethodsCount).map(value => value.amount);

    return {
      labels,
      datasets: [
        {
          label: 'Doanh thu theo phương thức thanh toán',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',   // Hồng đậm
            'rgba(54, 162, 235, 0.7)',   // Xanh dương
            'rgba(255, 206, 86, 0.7)',   // Vàng
            'rgba(75, 192, 192, 0.7)',   // Xanh lá
            'rgba(153, 102, 255, 0.7)',  // Tím
            'rgba(255, 159, 64, 0.7)',   // Cam
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
          hoverOffset: 4,
        },
      ],
    };
  };

  // Chuẩn bị dữ liệu xu hướng doanh thu
  const getTrendData = () => {
    if (!reportData?.revenueByPeriod.length) 
      return { labels: [], datasets: [{ label: '', data: [] }] };

    return {
      labels: reportData.revenueByPeriod.map(item => item.period),
      datasets: [
        {
          label: 'Xu hướng doanh thu',
          data: reportData.revenueByPeriod.map(item => item.amount),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  // Phương thức cũ làm fallback ở phía client
  const getTimeOfDayAnalysisFromOrders = () => {
    if (!reportData?.orders.length) 
      return { labels: [], datasets: [{ label: '', data: [] }] };

    const timeSlots = {
      'Sáng (6h-11h)': { count: 0, amount: 0 },
      'Trưa (11h-14h)': { count: 0, amount: 0 },
      'Chiều (14h-18h)': { count: 0, amount: 0 },
      'Tối (18h-22h)': { count: 0, amount: 0 },
      'Đêm (22h-6h)': { count: 0, amount: 0 },
    };

    reportData.orders.forEach(order => {
      const orderTime = new Date(order.paymentTime);
      const hour = orderTime.getHours();

      if (hour >= 6 && hour < 11) {
        timeSlots['Sáng (6h-11h)'].count += 1;
        timeSlots['Sáng (6h-11h)'].amount += order.totalAmount;
      } else if (hour >= 11 && hour < 14) {
        timeSlots['Trưa (11h-14h)'].count += 1;
        timeSlots['Trưa (11h-14h)'].amount += order.totalAmount;
      } else if (hour >= 14 && hour < 18) {
        timeSlots['Chiều (14h-18h)'].count += 1;
        timeSlots['Chiều (14h-18h)'].amount += order.totalAmount;
      } else if (hour >= 18 && hour < 22) {
        timeSlots['Tối (18h-22h)'].count += 1;
        timeSlots['Tối (18h-22h)'].amount += order.totalAmount;
      } else {
        timeSlots['Đêm (22h-6h)'].count += 1;
        timeSlots['Đêm (22h-6h)'].amount += order.totalAmount;
      }
    });

    const filteredTimeSlots = Object.fromEntries(
      Object.entries(timeSlots).filter(([_, value]) => value.count > 0)
    );

    return {
      labels: Object.keys(filteredTimeSlots),
      datasets: [
        {
          label: 'Doanh thu theo khung giờ',
          data: Object.values(filteredTimeSlots).map(slot => slot.amount),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',   // Hồng đậm
            'rgba(54, 162, 235, 0.7)',   // Xanh dương
            'rgba(255, 206, 86, 0.7)',   // Vàng
            'rgba(75, 192, 192, 0.7)',   // Xanh lá
            'rgba(153, 102, 255, 0.7)',  // Tím
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

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

  // Xử lý lựa chọn khoảng thời gian tùy chỉnh
  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      fetchReportData();
    } else {
      toast.error('Vui lòng chọn ngày bắt đầu và kết thúc');
    }
  };

  // Xử lý thay đổi quý
  const handleQuarterChange = (newQuarter: string) => {
    setQuarter(parseInt(newQuarter));
  };

  // Xử lý thay đổi năm
  const handleYearChange = (newYear: string) => {
    setYear(parseInt(newYear));
  };

  // Tạo danh sách năm cho select
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear; i++) {
      years.push(i);
    }
    return years;
  };

  // Hàm sắp xếp danh sách đơn hàng
  const getSortedOrders = () => {
    if (!reportData?.orders?.length) return [];
    
    const orders = [...reportData.orders];
    
    if (orderSortBy === 'time') {
      orders.sort((a, b) => {
        const timeA = new Date(a.paymentTime).getTime();
        const timeB = new Date(b.paymentTime).getTime();
        return orderSortDirection === 'desc' ? timeB - timeA : timeA - timeB;
      });
    } else {
      orders.sort((a, b) => {
        return orderSortDirection === 'desc' ? 
          b.totalAmount - a.totalAmount : 
          a.totalAmount - b.totalAmount;
      });
    }
    
    return orders;
  };

  // Hàm xử lý thay đổi trường sắp xếp
  const handleSortChange = (sortBy: 'time' | 'revenue') => {
    if (sortBy === orderSortBy) {
      // Nếu đang sắp xếp theo cùng trường, đảo chiều sắp xếp
      setOrderSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Nếu đổi trường sắp xếp, mặc định là giảm dần (desc)
      setOrderSortBy(sortBy);
      setOrderSortDirection('desc');
    }
  };

  // Tạo className cho tiêu đề cột sắp xếp
  const getSortHeaderClass = (sortBy: 'time' | 'revenue') => {
    return `cursor-pointer flex items-center ${orderSortBy === sortBy ? 'text-primary font-bold' : ''}`;
  };

  // Hiển thị mũi tên sắp xếp
  const getSortArrow = (sortBy: 'time' | 'revenue') => {
    if (orderSortBy !== sortBy) return null;
    return orderSortDirection === 'desc' ? ' ↓' : ' ↑';
  };

  // Lấy top danh mục
  const getTopCategory = () => {
    if (!reportData?.categorySales?.length) return 'N/A';
    return reportData.categorySales
      .sort((a, b) => b.totalSales - a.totalSales)[0].category;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Báo cáo & Thống kê</h1>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={(value) => {
            setDateRange(value);
            setShowCustomDatePicker(value === 'custom');
          }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="yesterday">Hôm qua</SelectItem>
              <SelectItem value="last7days">7 ngày qua</SelectItem>
              <SelectItem value="thisMonth">Tháng này</SelectItem>
              <SelectItem value="lastMonth">Tháng trước</SelectItem>
              <SelectItem value="quarter">Quý</SelectItem>
              <SelectItem value="year">Năm</SelectItem>
              <SelectItem value="custom">Tùy chỉnh</SelectItem>
            </SelectContent>
          </Select>

          {dateRange === 'quarter' && (
            <>
              <Select value={quarter.toString()} onValueChange={handleQuarterChange}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Quý" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Quý 1</SelectItem>
                  <SelectItem value="2">Quý 2</SelectItem>
                  <SelectItem value="3">Quý 3</SelectItem>
                  <SelectItem value="4">Quý 4</SelectItem>
                </SelectContent>
              </Select>

              <Select value={year.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Năm" />
                </SelectTrigger>
                <SelectContent>
                  {getYearOptions().map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {dateRange === 'year' && (
            <Select value={year.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Năm" />
              </SelectTrigger>
              <SelectContent>
                {getYearOptions().map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showCustomDatePicker && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <span>đến</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <Button size="sm" onClick={handleCustomDateSubmit}>Áp dụng</Button>
            </div>
          )}

          <Button onClick={fetchReportData} variant="outline">Làm mới</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải...</p>
        </div>
      ) : reportData ? (
        <div className="space-y-8">
          {/* Thống kê tổng quan sử dụng component StatCards */}
          <StatCards
            totalRevenue={reportData.totalRevenue}
            totalOrders={reportData.totalOrders}
            averageOrderValue={reportData.averageOrderValue}
            topCategory={getTopCategory()}
            formatCurrency={formatCurrency}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-7 mb-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="products">Sản phẩm</TabsTrigger>
              <TabsTrigger value="categories">Danh mục</TabsTrigger>
              <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
              <TabsTrigger value="trends">Xu hướng</TabsTrigger>
              <TabsTrigger value="hourly">Theo giờ</TabsTrigger>
              <TabsTrigger value="analysis">Phân tích</TabsTrigger>
            </TabsList>
            
            {/* Tab Tổng quan */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart 
                  title="Doanh thu theo thời gian"
                  data={revenueChartData}
                />

                <PieChart 
                  title="Tỷ lệ doanh thu theo danh mục"
                  data={categoryChartData}
                  emptyMessage="Không có dữ liệu danh mục"
                />
              </div>
            </TabsContent>
            
            {/* Tab Sản phẩm */}
            <TabsContent value="products">
              <TopProductsTable
                products={reportData.topSellingItems}
                formatCurrency={formatCurrency}
              />
            </TabsContent>
            
            {/* Tab Danh mục */}
            <TabsContent value="categories">
              <CategoryAnalysis 
                categories={reportData.categorySales}
                totalRevenue={reportData.totalRevenue}
                formatCurrency={formatCurrency}
              />
            </TabsContent>
            
            {/* Tab Đơn hàng */}
            <TabsContent value="orders">
              <OrderTable
                orders={reportData.orders}
                formatCurrency={formatCurrency}
                formatDateTime={formatDateTime}
                getPaymentMethodLabel={getPaymentMethodLabel}
              />
            </TabsContent>

            {/* Tab Xu hướng */}
            <TabsContent value="trends">
              <div className="grid grid-cols-1 gap-6">
                <TrendChart 
                  revenueData={reportData.revenueByPeriod}
                />
              </div>
            </TabsContent>

            {/* Tab Phân tích theo giờ */}
            <TabsContent value="hourly">
              <div className="grid grid-cols-1 gap-6">
                {reportData.hourlyData && reportData.hourlyData.length > 0 ? (
                  <HourlyAnalysis 
                    hourlyData={reportData.hourlyData}
                    formatCurrency={formatCurrency}
                  />
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <p className="text-gray-500">Không có dữ liệu phân tích theo giờ</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Phân tích */}
            <TabsContent value="analysis">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PaymentAnalysis 
                  paymentMethods={reportData.paymentMethodAnalysis}
                  getPaymentMethodLabel={getPaymentMethodLabel}
                />

                <TimeOfDayAnalysis 
                  timeSlots={reportData.timeOfDayAnalysis}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p>Không thể tải dữ liệu báo cáo</p>
        </div>
      )}
    </div>
  );
};