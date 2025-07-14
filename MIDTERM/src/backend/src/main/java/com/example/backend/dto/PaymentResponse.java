package com.example.backend.dto;

import com.example.backend.model.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private String tableName;
    private BigDecimal amount;
    private LocalDateTime paymentTime;
    private PaymentMethod paymentMethod;
    private String receiptNumber;
}