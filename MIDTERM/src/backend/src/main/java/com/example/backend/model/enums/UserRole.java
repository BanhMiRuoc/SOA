package com.example.backend.model.enums;

import lombok.Getter;

@Getter
public enum UserRole {
    WAITER,         // Phục vụ
    KITCHEN_STAFF,  // Nhân viên bếp
    MANAGER,        // Quản lý
    CASHIER,        // Thu ngân
    ADMIN           // Quản trị hệ thống
} 