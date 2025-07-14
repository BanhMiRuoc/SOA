package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    private List<OrderSummaryDTO> orders;
    private List<RevenuePeriodDTO> revenueByPeriod;
    private List<CategorySalesDTO> categorySales;
    private List<TopSellingItemDTO> topSellingItems;
    private List<TimeOfDayAnalysisDTO> timeOfDayAnalysis;
    private List<PaymentMethodAnalysisDTO> paymentMethodAnalysis;
    private List<HourlyAnalysisDTO> hourlyData;
    private BigDecimal totalRevenue;
    private int totalOrders;
    private BigDecimal averageOrderValue;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderSummaryDTO {
        private Long id;
        private String tableNumber;
        private LocalDateTime orderTime;
        private String status;
        private BigDecimal totalAmount;
        private String paymentMethod;
        private LocalDateTime paymentTime;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenuePeriodDTO {
        private String period;
        private BigDecimal amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySalesDTO {
        private String category;
        private BigDecimal totalSales;
        private int itemsSold;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSellingItemDTO {
        private Long menuItemId;
        private String menuItemName;
        private String category;
        private BigDecimal price;
        private int quantitySold;
        private BigDecimal totalSales;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeOfDayAnalysisDTO {
        private String timeSlot;
        private int orderCount;
        private BigDecimal totalAmount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethodAnalysisDTO {
        private String method;
        private int count;
        private BigDecimal amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyAnalysisDTO {
        private String hour;
        private int orderCount;
        private BigDecimal totalAmount;
    }
} 