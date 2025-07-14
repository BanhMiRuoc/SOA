package com.example.backend.model;

import com.example.backend.model.enums.OrderStatus;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Entity
@jakarta.persistence.Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@ToString(exclude = {"items"})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "table_id")
    @JsonIgnoreProperties("orders")
    private Table table;
    
    @Column(name = "waiter_id")
    private Long waiterId;
    
    private LocalDateTime orderTime;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING; // Mặc định là PENDING khi tạo mới
    
    private Boolean isPaid;
    private BigDecimal totalAmount;
    
    private Boolean needAssistance = false; // Trường mới để theo dõi yêu cầu hỗ trợ
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonManagedReference
    @JsonIgnoreProperties("order")
    private List<OrderItem> items;
}