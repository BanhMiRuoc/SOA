package com.example.backend.model;

import com.example.backend.model.enums.TableStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@jakarta.persistence.Table(name = "tables")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Table {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String tableNumber;  // Ví dụ: A_01, B_02, C_03
    private String zone;         // A, B, C
    private Integer capacity;    // Số người tối đa
    private TableStatus status;  // AVAILABLE, OCCUPIED
    
    @Column(name = "current_waiter_id")
    private Long currentWaiterId; // ID nhân viên đang phụ trách (tham chiếu đến id của User)
    
    private LocalDateTime occupiedAt;
    
    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean isActive = true; // Thuộc tính để ẩn/hiện bàn
}