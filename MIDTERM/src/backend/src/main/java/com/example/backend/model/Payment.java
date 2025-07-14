package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.backend.model.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;
    
    private BigDecimal amount;
    private LocalDateTime paymentTime = LocalDateTime.now();
    
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;
    
    private String receiptNumber;
}