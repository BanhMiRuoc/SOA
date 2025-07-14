package com.example.backend.service.impl;

import com.example.backend.dto.ReportDTO;
import com.example.backend.dto.ReportDTO.OrderSummaryDTO;
import com.example.backend.dto.ReportDTO.RevenuePeriodDTO;
import com.example.backend.dto.ReportDTO.CategorySalesDTO;
import com.example.backend.dto.ReportDTO.TopSellingItemDTO;
import com.example.backend.dto.ReportDTO.TimeOfDayAnalysisDTO;
import com.example.backend.dto.ReportDTO.PaymentMethodAnalysisDTO;
import com.example.backend.dto.ReportDTO.HourlyAnalysisDTO;
import com.example.backend.model.Order;
import com.example.backend.model.OrderItem;
import com.example.backend.model.Payment;
import com.example.backend.model.MenuItem;
import com.example.backend.model.enums.OrderStatus;
import com.example.backend.repository.OrderItemRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public ReportDTO getReport(LocalDateTime startDate, LocalDateTime endDate) {
        ReportDTO report = new ReportDTO();
        
        // Lấy danh sách đơn hàng đã thanh toán
        List<Order> orders = orderRepository.findByOrderTimeBetween(startDate, endDate)
                .stream()
                .filter(order -> order.getStatus() == OrderStatus.PAID)
                .collect(Collectors.toList());
        
        // Lấy các thanh toán
        List<Payment> payments = paymentRepository.findByPaymentTimeBetween(startDate, endDate);
        
        // Tính tổng doanh thu
        BigDecimal totalRevenue = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Tạo danh sách đơn hàng tóm tắt
        List<OrderSummaryDTO> orderSummaries = payments.stream()
                .map(payment -> {
                    Order order = payment.getOrder();
                    return new OrderSummaryDTO(
                            order.getId(),
                            order.getTable() != null ? order.getTable().getTableNumber() : "N/A",
                            order.getOrderTime(),
                            order.getStatus().toString(),
                            payment.getAmount(),
                            payment.getPaymentMethod().toString(),
                            payment.getPaymentTime()
                    );
                })
                .collect(Collectors.toList());
        
        // Tính doanh thu theo thời gian
        List<RevenuePeriodDTO> revenueByPeriod = calculateRevenueByPeriod(startDate, endDate, payments);
        
        // Tính doanh số theo danh mục
        List<CategorySalesDTO> categorySales = calculateCategorySales(orders);
        
        // Tính top món ăn bán chạy
        List<TopSellingItemDTO> topSellingItems = calculateTopSellingItems(orders);
        
        // Tính phân tích theo thời gian trong ngày
        List<TimeOfDayAnalysisDTO> timeOfDayAnalysis = calculateTimeOfDayAnalysis(payments);
        
        // Tính phân tích theo phương thức thanh toán
        List<PaymentMethodAnalysisDTO> paymentMethodAnalysis = calculatePaymentMethodAnalysis(payments);
        
        // Tính phân tích theo từng giờ
        List<HourlyAnalysisDTO> hourlyData = calculateHourlyAnalysis(payments);
        
        // Đặt giá trị vào báo cáo
        report.setOrders(orderSummaries);
        report.setRevenueByPeriod(revenueByPeriod);
        report.setCategorySales(categorySales);
        report.setTopSellingItems(topSellingItems);
        report.setTimeOfDayAnalysis(timeOfDayAnalysis);
        report.setPaymentMethodAnalysis(paymentMethodAnalysis);
        report.setHourlyData(hourlyData);
        report.setTotalRevenue(totalRevenue);
        report.setTotalOrders(orders.size());
        
        // Tính giá trị trung bình đơn hàng
        if (!orders.isEmpty()) {
            report.setAverageOrderValue(totalRevenue.divide(new BigDecimal(orders.size()), 2, RoundingMode.HALF_UP));
        } else {
            report.setAverageOrderValue(BigDecimal.ZERO);
        }
        
        return report;
    }

    @Override
    public ReportDTO getReportForToday() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        return getReport(startOfDay, endOfDay);
    }

    @Override
    public ReportDTO getReportForYesterday() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime startOfDay = yesterday.atStartOfDay();
        LocalDateTime endOfDay = yesterday.atTime(LocalTime.MAX);
        return getReport(startOfDay, endOfDay);
    }

    @Override
    public ReportDTO getReportForLast7Days() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6);
        LocalDateTime startOfPeriod = sevenDaysAgo.atStartOfDay();
        LocalDateTime endOfPeriod = today.atTime(LocalTime.MAX);
        return getReport(startOfPeriod, endOfPeriod);
    }

    @Override
    public ReportDTO getReportForCurrentMonth() {
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate lastDayOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());
        LocalDateTime startOfMonth = firstDayOfMonth.atStartOfDay();
        LocalDateTime endOfMonth = lastDayOfMonth.atTime(LocalTime.MAX);
        return getReport(startOfMonth, endOfMonth);
    }
    
    private List<RevenuePeriodDTO> calculateRevenueByPeriod(LocalDateTime startDate, LocalDateTime endDate, List<Payment> payments) {
        long days = ChronoUnit.DAYS.between(startDate.toLocalDate(), endDate.toLocalDate()) + 1;
        
        if (days <= 7) {
            // Doanh thu theo ngày trong tuần
            Map<String, BigDecimal> revenueByDay = new LinkedHashMap<>();
            
            // Tạo danh sách các ngày theo thứ tự
            List<LocalDate> dateList = new ArrayList<>();
            LocalDate date = startDate.toLocalDate();
            while (!date.isAfter(endDate.toLocalDate())) {
                dateList.add(date);
                date = date.plusDays(1);
            }
            
            // Sắp xếp các ngày
            dateList.sort(Comparator.naturalOrder());
            
            // Khởi tạo tất cả các ngày trong khoảng thời gian
            for (LocalDate d : dateList) {
                String dayName = d.format(DateTimeFormatter.ofPattern("dd/MM"));
                revenueByDay.put(dayName, BigDecimal.ZERO);
            }
            
            // Tính doanh thu cho mỗi ngày
            for (Payment payment : payments) {
                LocalDate paymentDate = payment.getPaymentTime().toLocalDate();
                String dayName = paymentDate.format(DateTimeFormatter.ofPattern("dd/MM"));
                
                if (revenueByDay.containsKey(dayName)) {
                    revenueByDay.put(dayName, revenueByDay.get(dayName).add(payment.getAmount()));
                }
            }
            
            // Chuyển đổi sang danh sách RevenuePeriodDTO và đảm bảo thứ tự
            List<RevenuePeriodDTO> result = new ArrayList<>();
            for (LocalDate d : dateList) {
                String dayName = d.format(DateTimeFormatter.ofPattern("dd/MM"));
                result.add(new RevenuePeriodDTO(dayName, revenueByDay.get(dayName)));
            }
            return result;
        } else if (days <= 31) {
            // Doanh thu theo ngày trong tháng
            Map<String, BigDecimal> revenueByDate = new LinkedHashMap<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
            
            // Tạo danh sách các ngày theo thứ tự
            List<LocalDate> dateList = new ArrayList<>();
            LocalDate date = startDate.toLocalDate();
            while (!date.isAfter(endDate.toLocalDate())) {
                dateList.add(date);
                date = date.plusDays(1);
            }
            
            // Sắp xếp các ngày
            dateList.sort(Comparator.naturalOrder());
            
            // Khởi tạo tất cả các ngày trong khoảng thời gian
            for (LocalDate d : dateList) {
                String dateStr = d.format(formatter);
                revenueByDate.put(dateStr, BigDecimal.ZERO);
            }
            
            // Tính doanh thu cho mỗi ngày
            for (Payment payment : payments) {
                LocalDate paymentDate = payment.getPaymentTime().toLocalDate();
                String dateStr = paymentDate.format(formatter);
                
                if (revenueByDate.containsKey(dateStr)) {
                    revenueByDate.put(dateStr, revenueByDate.get(dateStr).add(payment.getAmount()));
                }
            }
            
            // Chuyển đổi sang danh sách RevenuePeriodDTO và đảm bảo thứ tự
            List<RevenuePeriodDTO> result = new ArrayList<>();
            for (LocalDate d : dateList) {
                String dateStr = d.format(formatter);
                result.add(new RevenuePeriodDTO(dateStr, revenueByDate.get(dateStr)));
            }
            return result;
        } else {
            // Doanh thu theo tháng
            Map<String, BigDecimal> revenueByMonth = new LinkedHashMap<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/yyyy");
            
            // Tạo danh sách các tháng theo thứ tự
            List<LocalDate> monthList = new ArrayList<>();
            LocalDate date = startDate.toLocalDate().withDayOfMonth(1);
            while (!date.isAfter(endDate.toLocalDate())) {
                monthList.add(date);
                date = date.plusMonths(1);
            }
            
            // Sắp xếp các tháng
            monthList.sort(Comparator.naturalOrder());
            
            // Khởi tạo tất cả các tháng trong khoảng thời gian
            for (LocalDate d : monthList) {
                String monthStr = d.format(formatter);
                revenueByMonth.put(monthStr, BigDecimal.ZERO);
            }
            
            // Tính doanh thu cho mỗi tháng
            for (Payment payment : payments) {
                LocalDate paymentDate = payment.getPaymentTime().toLocalDate();
                String monthStr = paymentDate.format(formatter);
                
                if (revenueByMonth.containsKey(monthStr)) {
                    revenueByMonth.put(monthStr, revenueByMonth.get(monthStr).add(payment.getAmount()));
                }
            }
            
            // Chuyển đổi sang danh sách RevenuePeriodDTO và đảm bảo thứ tự
            List<RevenuePeriodDTO> result = new ArrayList<>();
            for (LocalDate d : monthList) {
                String monthStr = d.format(formatter);
                result.add(new RevenuePeriodDTO(monthStr, revenueByMonth.get(monthStr)));
            }
            return result;
        }
    }
    
    private List<CategorySalesDTO> calculateCategorySales(List<Order> orders) {
        Map<String, CategorySalesData> categoryMap = new HashMap<>();
        
        // Tổng hợp dữ liệu bán hàng theo danh mục
        for (Order order : orders) {
            List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
            
            for (OrderItem item : orderItems) {
                String category = item.getMenuItem().getCategory();
                BigDecimal itemTotal = item.getPrice().multiply(new BigDecimal(item.getQuantity()));
                
                if (categoryMap.containsKey(category)) {
                    CategorySalesData data = categoryMap.get(category);
                    data.totalSales = data.totalSales.add(itemTotal);
                    data.itemsSold += item.getQuantity();
                } else {
                    CategorySalesData data = new CategorySalesData();
                    data.totalSales = itemTotal;
                    data.itemsSold = item.getQuantity();
                    categoryMap.put(category, data);
                }
            }
        }
        
        // Chuyển đổi sang danh sách CategorySalesDTO
        return categoryMap.entrySet().stream()
                .map(entry -> new CategorySalesDTO(
                        entry.getKey(),
                        entry.getValue().totalSales,
                        entry.getValue().itemsSold
                ))
                .collect(Collectors.toList());
    }
    
    private List<TopSellingItemDTO> calculateTopSellingItems(List<Order> orders) {
        // Sử dụng Map để thống kê theo menuItemId
        Map<Long, TopSellingItemData> menuItemSalesMap = new HashMap<>();
        
        // Thu thập dữ liệu bán hàng cho từng món ăn
        for (Order order : orders) {
            List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
            
            for (OrderItem item : orderItems) {
                MenuItem menuItem = item.getMenuItem();
                Long menuItemId = menuItem.getId();
                
                // Tính tổng doanh thu cho món ăn này
                BigDecimal itemTotal = item.getPrice().multiply(new BigDecimal(item.getQuantity()));
                
                if (menuItemSalesMap.containsKey(menuItemId)) {
                    TopSellingItemData data = menuItemSalesMap.get(menuItemId);
                    data.quantitySold += item.getQuantity();
                    data.totalSales = data.totalSales.add(itemTotal);
                } else {
                    TopSellingItemData data = new TopSellingItemData();
                    data.menuItemId = menuItemId;
                    data.menuItemName = menuItem.getName();
                    data.category = menuItem.getCategory();
                    data.price = menuItem.getPrice();
                    data.quantitySold = item.getQuantity();
                    data.totalSales = itemTotal;
                    menuItemSalesMap.put(menuItemId, data);
                }
            }
        }
        
        // Chuyển đổi thành danh sách và sắp xếp theo số lượng bán giảm dần
        return menuItemSalesMap.values().stream()
                .map(data -> new TopSellingItemDTO(
                        data.menuItemId,
                        data.menuItemName,
                        data.category,
                        data.price,
                        data.quantitySold,
                        data.totalSales
                ))
                .sorted(Comparator.comparing(TopSellingItemDTO::getQuantitySold).reversed())
                .limit(10) // Giới hạn 10 món bán chạy nhất
                .collect(Collectors.toList());
    }
    
    private List<TimeOfDayAnalysisDTO> calculateTimeOfDayAnalysis(List<Payment> payments) {
        Map<String, TimeOfDayData> timeSlots = new HashMap<>();
        
        // Khởi tạo các khung giờ
        timeSlots.put("Sáng (6h-11h)", new TimeOfDayData());
        timeSlots.put("Trưa (11h-14h)", new TimeOfDayData());
        timeSlots.put("Chiều (14h-18h)", new TimeOfDayData());
        timeSlots.put("Tối (18h-22h)", new TimeOfDayData());
        timeSlots.put("Đêm (22h-6h)", new TimeOfDayData());
        
        // Phân loại thanh toán theo khung giờ
        for (Payment payment : payments) {
            LocalDateTime paymentTime = payment.getPaymentTime();
            int hour = paymentTime.getHour();
            
            String timeSlot;
            if (hour >= 6 && hour < 11) {
                timeSlot = "Sáng (6h-11h)";
            } else if (hour >= 11 && hour < 14) {
                timeSlot = "Trưa (11h-14h)";
            } else if (hour >= 14 && hour < 18) {
                timeSlot = "Chiều (14h-18h)";
            } else if (hour >= 18 && hour < 22) {
                timeSlot = "Tối (18h-22h)";
            } else {
                timeSlot = "Đêm (22h-6h)";
            }
            
            TimeOfDayData data = timeSlots.get(timeSlot);
            data.orderCount++;
            data.totalAmount = data.totalAmount.add(payment.getAmount());
        }
        
        // Chuyển đổi sang danh sách TimeOfDayAnalysisDTO
        List<TimeOfDayAnalysisDTO> result = new ArrayList<>();
        for (Map.Entry<String, TimeOfDayData> entry : timeSlots.entrySet()) {
            if (entry.getValue().orderCount > 0) {
                result.add(new TimeOfDayAnalysisDTO(
                        entry.getKey(),
                        entry.getValue().orderCount,
                        entry.getValue().totalAmount
                ));
            }
        }
        
        // Sắp xếp theo thứ tự thời gian trong ngày
        result.sort((a, b) -> {
            List<String> order = List.of(
                    "Sáng (6h-11h)", "Trưa (11h-14h)", "Chiều (14h-18h)", 
                    "Tối (18h-22h)", "Đêm (22h-6h)"
            );
            return Integer.compare(order.indexOf(a.getTimeSlot()), order.indexOf(b.getTimeSlot()));
        });
        
        return result;
    }
    
    private List<PaymentMethodAnalysisDTO> calculatePaymentMethodAnalysis(List<Payment> payments) {
        Map<String, PaymentMethodData> methodMap = new HashMap<>();
        
        // Tổng hợp dữ liệu thanh toán theo phương thức
        for (Payment payment : payments) {
            String method = payment.getPaymentMethod().toString();
            
            if (!methodMap.containsKey(method)) {
                methodMap.put(method, new PaymentMethodData());
            }
            
            PaymentMethodData data = methodMap.get(method);
            data.count++;
            data.amount = data.amount.add(payment.getAmount());
        }
        
        // Chuyển đổi sang danh sách PaymentMethodAnalysisDTO
        return methodMap.entrySet().stream()
                .map(entry -> new PaymentMethodAnalysisDTO(
                        entry.getKey(),
                        entry.getValue().count,
                        entry.getValue().amount
                ))
                .sorted(Comparator.comparing(PaymentMethodAnalysisDTO::getAmount).reversed())
                .collect(Collectors.toList());
    }
    
    /**
     * Tính phân tích theo từng giờ trong ngày
     * Chia thành 24 khung giờ, từ 0h đến 23h
     */
    private List<HourlyAnalysisDTO> calculateHourlyAnalysis(List<Payment> payments) {
        Map<String, HourlyData> hourlyMap = new LinkedHashMap<>();
        
        // Khởi tạo tất cả các giờ trong ngày (0-23)
        for (int hour = 0; hour < 24; hour++) {
            String hourKey = String.format("%02d:00", hour);
            hourlyMap.put(hourKey, new HourlyData());
        }
        
        // Tổng hợp dữ liệu theo từng giờ
        for (Payment payment : payments) {
            int hour = payment.getPaymentTime().getHour();
            String hourKey = String.format("%02d:00", hour);
            
            HourlyData data = hourlyMap.get(hourKey);
            data.orderCount++;
            data.totalAmount = data.totalAmount.add(payment.getAmount());
        }
        
        // Chuyển đổi sang danh sách HourlyAnalysisDTO
        List<HourlyAnalysisDTO> result = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            String hourKey = String.format("%02d:00", hour);
            HourlyData data = hourlyMap.get(hourKey);
            result.add(new HourlyAnalysisDTO(
                    hourKey,
                    data.orderCount,
                    data.totalAmount
            ));
        }
        
        return result;
    }
    
    private static class CategorySalesData {
        BigDecimal totalSales = BigDecimal.ZERO;
        int itemsSold = 0;
    }

    private static class TopSellingItemData {
        Long menuItemId;
        String menuItemName;
        String category;
        BigDecimal price;
        int quantitySold;
        BigDecimal totalSales = BigDecimal.ZERO;
    }

    private static class TimeOfDayData {
        int orderCount = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
    }
    
    private static class PaymentMethodData {
        int count = 0;
        BigDecimal amount = BigDecimal.ZERO;
    }

    private static class HourlyData {
        int orderCount = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
    }
} 