package com.example.backend.service;

import com.example.backend.model.Payment;
import com.example.backend.model.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PaymentService {
    /**
     * Tạo và lưu một thanh toán mới
     *
     * @param orderId ID của đơn hàng cần thanh toán
     * @param amount Số tiền thanh toán
     * @param paymentMethod Phương thức thanh toán
     * @return Đối tượng Payment đã được tạo
     */
    Payment createPayment(Long orderId, BigDecimal amount, PaymentMethod paymentMethod);
    
    /**
     * Xử lý thanh toán cho một đơn hàng và cập nhật trạng thái đơn hàng
     *
     * @param orderId ID của đơn hàng cần thanh toán
     * @param paymentMethod Phương thức thanh toán
     * @return Đối tượng Payment đã được tạo
     */
    Payment processPaymentForOrder(Long orderId, PaymentMethod paymentMethod);
    
    /**
     * Lấy chi tiết thanh toán theo ID
     *
     * @param id ID của thanh toán cần tìm
     * @return Đối tượng Payment tương ứng
     */
    Payment getPaymentById(Long id);
    
    /**
     * Lấy tất cả các thanh toán
     *
     * @return Danh sách các thanh toán
     */
    List<Payment> getAllPayments();
    
    /**
     * Lấy các thanh toán trong khoảng thời gian
     *
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     * @return Danh sách các thanh toán trong khoảng thời gian
     */
    List<Payment> getPaymentsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Tạo mã biên lai thanh toán
     *
     * @return Mã biên lai thanh toán
     */
    String generateReceiptNumber();
}
