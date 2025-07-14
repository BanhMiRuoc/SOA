import React, { useState } from 'react';
import { BarChart } from '@/components/ui/charts/bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HourlyData {
  hour: string;
  orderCount: number;
  totalAmount: number;
}

interface HourlyAnalysisProps {
  hourlyData: HourlyData[];
  formatCurrency: (amount: number) => string;
}

export const HourlyAnalysis: React.FC<HourlyAnalysisProps> = ({ hourlyData, formatCurrency }) => {
  const [view, setView] = useState<'revenue' | 'count'>('revenue');
  const [selectedDayPart, setSelectedDayPart] = useState<string>('all');

  // Nhóm các giờ theo phần của ngày
  const dayParts = {
    'all': 'Tất cả',
    'morning': 'Buổi sáng (6h-11h)',
    'lunch': 'Buổi trưa (11h-14h)',
    'afternoon': 'Buổi chiều (14h-18h)',
    'evening': 'Buổi tối (18h-22h)',
    'night': 'Buổi đêm (22h-6h)'
  };

  // Lọc dữ liệu theo phần của ngày được chọn
  const filteredData = () => {
    if (selectedDayPart === 'all') return hourlyData;
    
    return hourlyData.filter(item => {
      const hour = parseInt(item.hour.split(':')[0]);
      
      switch (selectedDayPart) {
        case 'morning': return hour >= 6 && hour < 11;
        case 'lunch': return hour >= 11 && hour < 14;
        case 'afternoon': return hour >= 14 && hour < 18;
        case 'evening': return hour >= 18 && hour < 22;
        case 'night': return hour >= 22 || hour < 6;
        default: return true;
      }
    });
  };

  const getPeakHour = () => {
    if (!hourlyData.length) return 'N/A';
    
    const sortedData = [...hourlyData].sort((a, b) => {
      return view === 'revenue' 
        ? b.totalAmount - a.totalAmount 
        : b.orderCount - a.orderCount;
    });
    
    return sortedData[0].hour;
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = {
    labels: filteredData().map(item => item.hour),
    datasets: [
      {
        label: view === 'revenue' ? 'Doanh thu (VNĐ)' : 'Số lượng đơn hàng',
        data: filteredData().map(item => view === 'revenue' ? item.totalAmount : item.orderCount),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Tính tổng doanh thu và số lượng đơn hàng cho dữ liệu được lọc
  const totalRevenue = filteredData().reduce((sum, item) => sum + item.totalAmount, 0);
  const totalOrderCount = filteredData().reduce((sum, item) => sum + item.orderCount, 0);

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Phân tích theo từng giờ</CardTitle>
        <div className="flex items-center gap-3">
          <Select value={selectedDayPart} onValueChange={setSelectedDayPart}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn khung giờ" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(dayParts).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Tabs value={view} onValueChange={(v) => setView(v as 'revenue' | 'count')} className="w-[180px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
              <TabsTrigger value="count">Số lượng</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-stone-50 p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Tổng doanh thu</div>
            <div className="text-xl font-bold">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="bg-stone-50 p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Tổng số đơn hàng</div>
            <div className="text-xl font-bold">{totalOrderCount}</div>
          </div>
          <div className="bg-stone-50 p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Giờ cao điểm</div>
            <div className="text-xl font-bold">{getPeakHour()}</div>
          </div>
        </div>
        
        {filteredData().length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            Không có dữ liệu cho khung giờ này
          </div>
        ) : (
          <div className="h-80">
            <BarChart 
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const dataIndex = context.dataIndex;
                        const dataPoint = filteredData()[dataIndex];
                        
                        if (view === 'revenue') {
                          return `Doanh thu: ${formatCurrency(dataPoint.totalAmount)}`;
                        } else {
                          return `Số đơn: ${dataPoint.orderCount}`;
                        }
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  }
                }
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 