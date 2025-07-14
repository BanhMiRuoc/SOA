package com.example.backend.model;

import com.example.backend.model.enums.KitchenType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private Boolean isAvailable;
    private String imageUrl;
    private Boolean isSpicy;
    private Boolean isHidden = false; // Thuộc tính mới để xác định món ăn có hiển thị trên giao diện đặt món của khách hàng hay không
    
    @Enumerated(EnumType.STRING)
    private KitchenType kitchenType;
}