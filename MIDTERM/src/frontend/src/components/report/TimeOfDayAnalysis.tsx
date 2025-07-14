import React, { useState } from 'react';
import { BarChart } from '@/components/ui/charts/bar-chart';
import { PieChart } from '@/components/ui/charts/pie-chart';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TimeSlot {
  timeSlot: string;
  orderCount: number;
  totalAmount: number;
}

interface TimeOfDayAnalysisProps {
  timeSlots: TimeSlot[];
  formatCurrency?: (amount: number) => string;
}

export const TimeOfDayAnalysis: React.FC<TimeOfDayAnalysisProps> = ({ 
  timeSlots,
  formatCurrency = (amount: number) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}) => {
  const [viewType, setViewType] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [dataType, setDataType] = useState<'revenue' | 'count'>('revenue');

  // Sắp xếp dữ liệu để hiển thị theo đúng thứ tự thời gian trong ngày
  const timePriority: {[key: string]: number} = {
    'Sáng (6h-11h)': 1,
    'Trưa (11h-14h)': 2,
    'Chiều (14h-18h)': 3,
    'Tối (18h-22h)': 4,
    'Đêm (22h-6h)': 5
  };
  
  const sortedTimeSlots = [...timeSlots].sort((a, b) => 
    timePriority[a.timeSlot] - timePriority[b.timeSlot]
  );

  // Tìm khung giờ cao điểm
  const getPeakTimeSlot = () => {
    if (!timeSlots.length) return { timeSlot: 'N/A', value: 0 };
    
    const peak = [...timeSlots].sort((a, b) => 
      dataType === 'revenue' 
        ? b.totalAmount - a.totalAmount 
        : b.orderCount - a.orderCount
    )[0];
    
    return { 
      timeSlot: peak.timeSlot, 
      value: dataType === 'revenue' ? peak.totalAmount : peak.orderCount 
    };
  };

  // Tính tổng doanh thu và số lượng đơn
  const totalRevenue = timeSlots.reduce((sum, slot) => sum + slot.totalAmount, 0);
  const totalOrders = timeSlots.reduce((sum, slot) => sum + slot.orderCount, 0);

  // Dữ liệu cho biểu đồ
  const chartData = {
    labels: sortedTimeSlots.map(item => item.timeSlot),
    datasets: [
      {
        label: dataType === 'revenue' ? 'Doanh thu' : 'Số lượng đơn hàng',
        data: sortedTimeSlots.map(item => 
          dataType === 'revenue' ? item.totalAmount : item.orderCount
        ),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',    // Hồng đậm
          'rgba(54, 162, 235, 0.8)',    // Xanh dương
          'rgba(255, 206, 86, 0.8)',    // Vàng
          'rgba(75, 192, 192, 0.8)',    // Xanh lá
          'rgba(153, 102, 255, 0.8)',   // Tím
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
        borderRadius: 6,
        hoverOffset: 8,
      },
    ],
  };

  // Tùy chỉnh options cho biểu đồ
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            return dataType === 'revenue' 
              ? `Doanh thu: ${formatCurrency(value)}` 
              : `Số đơn: ${value}`;
          }
        }
      }
    },
    scales: dataType === 'revenue' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    } : undefined,
  };

  const peakTimeSlot = getPeakTimeSlot();

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Phân tích theo khung giờ</CardTitle>
        <div className="flex items-center gap-2">
          <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'chart' | 'table')}>
            <TabsList className="h-8">
              <TabsTrigger value="chart" className="text-xs px-3">Biểu đồ</TabsTrigger>
              <TabsTrigger value="table" className="text-xs px-3">Bảng</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {viewType === 'chart' && (
            <Tabs value={chartType} onValueChange={(v) => setChartType(v as 'bar' | 'pie')}>
              <TabsList className="h-8">
                <TabsTrigger value="bar" className="text-xs px-3">Cột</TabsTrigger>
                <TabsTrigger value="pie" className="text-xs px-3">Tròn</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          
          <Tabs value={dataType} onValueChange={(v) => setDataType(v as 'revenue' | 'count')}>
            <TabsList className="h-8">
              <TabsTrigger value="revenue" className="text-xs px-3">Doanh thu</TabsTrigger>
              <TabsTrigger value="count" className="text-xs px-3">Số lượng</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-stone-50 p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Cao điểm</div>
            <div className="text-xl font-bold">{peakTimeSlot.timeSlot}</div>
            <div className="text-sm text-gray-500">
              {dataType === 'revenue' 
                ? formatCurrency(peakTimeSlot.value) 
                : `${peakTimeSlot.value} đơn`}
            </div>
          </div>
          <div className="bg-stone-50 p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Tổng doanh thu</div>
            <div className="text-xl font-bold">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="bg-stone-50 p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Tổng số đơn</div>
            <div className="text-xl font-bold">{totalOrders}</div>
          </div>
        </div>

        {viewType === 'chart' && (
          <div className="h-80">
            {chartType === 'bar' ? (
              <BarChart data={chartData} options={chartOptions} />
            ) : (
              <PieChart data={chartData} emptyMessage="Không có dữ liệu" />
            )}
          </div>
        )}

        {viewType === 'table' && (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khung giờ</TableHead>
                  <TableHead className="text-right">Số đơn hàng</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                  <TableHead className="text-right">Tỷ lệ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTimeSlots.map((slot) => (
                  <TableRow key={slot.timeSlot}>
                    <TableCell className="font-medium">{slot.timeSlot}</TableCell>
                    <TableCell className="text-right">{slot.orderCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(slot.totalAmount)}</TableCell>
                    <TableCell className="text-right">
                      {Math.round((dataType === 'revenue' 
                        ? slot.totalAmount / totalRevenue 
                        : slot.orderCount / totalOrders) * 100)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 