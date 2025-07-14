package com.example.backend.service.impl;

import com.example.backend.model.Order;
import com.example.backend.model.Payment;
import com.example.backend.model.enums.PaymentMethod;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.service.OrderService;
import com.example.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderService orderService;

    @Autowired
    public PaymentServiceImpl(PaymentRepository paymentRepository, OrderService orderService) {
        this.paymentRepository = paymentRepository;
        this.orderService = orderService;
    }

    @Override
    @Transactional
    public Payment createPayment(Long orderId, BigDecimal amount, PaymentMethod paymentMethod) {
        Order order = orderService.getOrderById(orderId);
        
        if (order == null) {
            throw new IllegalArgumentException("Không tìm thấy đơn hàng với ID: " + orderId);
        }
        
        if (Boolean.TRUE.equals(order.getIsPaid())) {
            throw new IllegalStateException("Đơn hàng này đã được thanh toán");
        }
        
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setReceiptNumber(generateReceiptNumber());
        
        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment processPaymentForOrder(Long orderId, PaymentMethod paymentMethod) {
        Order order = orderService.getOrderById(orderId);
        
        if (order == null) {
            throw new IllegalArgumentException("Không tìm thấy đơn hàng với ID: " + orderId);
        }
        
        if (Boolean.TRUE.equals(order.getIsPaid())) {
            throw new IllegalStateException("Đơn hàng này đã được thanh toán");
        }
        
        // Tạo thanh toán mới
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(paymentMethod);
        payment.setReceiptNumber(generateReceiptNumber());
        
        // Lưu thanh toán
        Payment savedPayment = paymentRepository.save(payment);
        
        // Cập nhật trạng thái đơn hàng
        order.setIsPaid(true);
        
        return savedPayment;
    }

    @Override
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thanh toán với ID: " + id));
    }

    @Override
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    public List<Payment> getPaymentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return paymentRepository.findByPaymentTimeBetween(startDate, endDate);
    }

    @Override
    public String generateReceiptNumber() {
        // Tạo mã biên lai theo định dạng: YYYY-MM-DD-RANDOM
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String datePart = LocalDateTime.now().format(formatter);
        
        // Tạo phần ngẫu nhiên 6 chữ số
        Random random = new Random();
        int randomNumber = 100000 + random.nextInt(900000); // Số ngẫu nhiên từ 100000 đến 999999
        
        return "PMT-" + datePart + "-" + randomNumber;
    }
}