package com.example.backend.controller;

import com.example.backend.dto.PaymentDateRangeRequest;
import com.example.backend.dto.PaymentRequest;
import com.example.backend.dto.PaymentResponse;
import com.example.backend.model.Order;
import com.example.backend.model.Payment;
import com.example.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> processPayment(@RequestBody PaymentRequest request) {
        Payment payment = paymentService.processPaymentForOrder(
                request.getOrderId(),
                request.getPaymentMethod()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponse(payment));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        Payment payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(convertToResponse(payment));
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        List<PaymentResponse> responses = payments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/by-date-range")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<Payment> payments = paymentService.getPaymentsByDateRange(startDate, endDate);
        List<PaymentResponse> responses = payments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/by-date-range")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByDateRangePost(
            @RequestBody PaymentDateRangeRequest request) {
        
        List<Payment> payments = paymentService.getPaymentsByDateRange(
                request.getStartDate(),
                request.getEndDate()
        );
        List<PaymentResponse> responses = payments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    private PaymentResponse convertToResponse(Payment payment) {
        Order order = payment.getOrder();
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setOrderId(order.getId());
        response.setTableName(order.getTable() != null ? order.getTable().getTableNumber() : null);
        response.setAmount(payment.getAmount());
        response.setPaymentTime(payment.getPaymentTime());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setReceiptNumber(payment.getReceiptNumber());
        return response;
    }
}