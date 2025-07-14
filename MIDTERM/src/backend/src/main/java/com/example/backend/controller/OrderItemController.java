package com.example.backend.controller;

import com.example.backend.dto.StatusUpdateRequest;
import com.example.backend.model.OrderItem;
import com.example.backend.model.enums.OrderItemStatus;
import com.example.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orderItems")
public class OrderItemController {

    private final OrderService orderService;

    @PutMapping("/{orderItemId}/status")
    public ResponseEntity<OrderItem> updateOrderItemStatus(
            @PathVariable Long orderItemId,
            @RequestBody StatusUpdateRequest request) {
        OrderItemStatus status = OrderItemStatus.valueOf(request.getStatus());
        return ResponseEntity.ok(orderService.updateOrderItemStatus(orderItemId, status));
    }
} 