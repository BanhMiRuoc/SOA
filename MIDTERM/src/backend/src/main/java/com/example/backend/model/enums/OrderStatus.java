package com.example.backend.model.enums;

import lombok.Getter;

@Getter
public enum OrderStatus {
    PENDING,        // Đang chờ nhà bếp xử lý
    SERVING,        // Đang phục vụ
    CANCELLED,      // Đã hủy
    PAID            // Đã thanh toán
} 