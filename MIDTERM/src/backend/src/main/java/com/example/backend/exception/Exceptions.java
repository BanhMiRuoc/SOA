package com.example.backend.exception;

public class Exceptions {
    // Resource Not Found Exceptions
    public static ResourceNotFoundException menuItemNotFound() {
        return new ResourceNotFoundException("Không tìm thấy món ăn trong thực đơn");
    }
    
    public static ResourceNotFoundException tableNotFound() {
        return new ResourceNotFoundException("Không tìm thấy bàn với số này");
    }
    
    public static ResourceNotFoundException orderNotFound() {
        return new ResourceNotFoundException("Không tìm thấy đơn hàng");
    }
    
    public static ResourceNotFoundException orderItemNotFound() {
        return new ResourceNotFoundException("Không tìm thấy món ăn trong đơn hàng");
    }
    
    // Invalid Operation Exceptions
    public static InvalidOperationException tableNotAvailable() {
        return new InvalidOperationException("Table is not available");
    }
    
    public static InvalidOperationException orderAlreadyPaid() {
        return new InvalidOperationException("Order is already paid");
    }
    
    public static InvalidOperationException invalidOrderStatus() {
        return new InvalidOperationException("Trạng thái đơn hàng không hợp lệ");
    }
    
    public static InvalidOperationException tableHasUnpaidOrders() {
        return new InvalidOperationException("Bàn có đơn chưa thanh toán");
    }
    
    public static InvalidOperationException emailAlreadyExists() {
        return new InvalidOperationException("Email already exists");
    }
    
    // Authentication Exceptions
    public static RuntimeException invalidCredentials() {
        return new RuntimeException("Invalid credentials");
    }
    
    public static RuntimeException unauthorized() {
        return new RuntimeException("Không có quyền truy cập");
    }
    
    public static InvalidOperationException tableAlreadyOccupied() {
        return new InvalidOperationException("Bàn này đã có người ngồi");
    }
    
    public static ResourceNotFoundException userNotFound() {
        return new ResourceNotFoundException("Không tìm thấy người dùng");
    }
    
    public static InvalidOperationException invalidTableStatus() {
        return new InvalidOperationException("Trạng thái bàn không hợp lệ");
    }
    
    public static InvalidOperationException tableNotOpened() {
        return new InvalidOperationException("Bàn chưa được mở");
    }
    
    // Thêm exceptions mới
    public static InvalidOperationException tableNumberAlreadyExists() {
        return new InvalidOperationException("Mã bàn đã tồn tại");
    }
    
    public static InvalidOperationException tableNotClosed() {
        return new InvalidOperationException("Chỉ có thể ẩn bàn khi bàn đã đóng");
    }
} 