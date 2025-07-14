package com.example.backend.dto;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class OrderItemRequest {
    private Long menuItemId;
    private int quantity;
    private String note;
} 