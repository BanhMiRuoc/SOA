package com.example.backend.model.enums;

import lombok.Getter;

@Getter
public enum OrderItemStatus {
    PENDING,        // Món ăn mới được đặt
    COOKING,        // Đang nấu/chế biến
    READY,          // Đã sẵn sàng để phục vụ
    SERVED,         // Đã phục vụ
    CANCELLED,      // Đã hủy
} 