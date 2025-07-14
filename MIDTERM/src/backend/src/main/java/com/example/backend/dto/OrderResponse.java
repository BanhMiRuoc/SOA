package com.example.backend.dto;
import com.example.backend.model.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String tableNumber;
    private LocalDateTime orderTime;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private Boolean isPaid;
    private List<OrderItemResponse> items;
    private Long waiterId;
    private String waiterName;
    private Boolean needAssistance;
} 