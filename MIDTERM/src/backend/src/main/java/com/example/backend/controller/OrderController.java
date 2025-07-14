package com.example.backend.controller;

import com.example.backend.dto.OrderRequest;
import com.example.backend.dto.OrderResponse;
import com.example.backend.dto.StatusUpdateRequest;
import com.example.backend.model.Order;
import com.example.backend.model.OrderItem;
import com.example.backend.model.enums.OrderStatus;
import com.example.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('WAITER', 'KITCHEN_STAFF', 'MANAGER')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Order>> getActiveOrders() {
        return ResponseEntity.ok(orderService.getActiveOrders());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('WAITER', 'KITCHEN_STAFF', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PostMapping("/customer/{tableNumber}")
    public ResponseEntity<OrderResponse> createCustomerOrder(
            @PathVariable String tableNumber,
            @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createCustomerOrder(tableNumber, request));
    }
    
    @GetMapping("/customer/{tableNumber}")
    public ResponseEntity<OrderResponse> getCurrentOrderForTable(@PathVariable String tableNumber) {
        OrderResponse response = orderService.getCurrentOrderByTableNumber(tableNumber);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody StatusUpdateRequest request) {
        OrderStatus status = OrderStatus.valueOf(request.getStatus());
        return ResponseEntity.ok(orderService.updateStatus(orderId, status));
    }
    
    @PostMapping("/{orderId}/items")
    @PreAuthorize("hasAnyRole('WAITER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<OrderItem> addItemToOrder(
            @PathVariable Long orderId,
            @RequestParam Long menuItemId,
            @RequestParam int quantity,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(orderService.addItemToOrder(orderId, menuItemId, quantity, note));
    }
    
    @DeleteMapping("/items/{orderItemId}")
    public ResponseEntity<Void> removeItemFromOrder(@PathVariable Long orderItemId) {
        orderService.removeItemFromOrder(orderItemId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/table/{tableId}")
    @PreAuthorize("hasAnyRole('WAITER', 'MANAGER')")
    public ResponseEntity<List<Order>> getOrdersByTable(@PathVariable Long tableId) {
        return ResponseEntity.ok(orderService.getOrdersByTable(tableId));
    }
    
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId));
    }
    
    @PutMapping("/{orderId}/assistance")
    public ResponseEntity<Order> requestAssistance(
            @PathVariable Long orderId,
            @RequestParam Boolean needAssistance) {
        return ResponseEntity.ok(orderService.requestAssistance(orderId, needAssistance));
    }
    
    @PutMapping("/customer/{tableNumber}/assistance")
    public ResponseEntity<Order> requestAssistanceByTable(
            @PathVariable String tableNumber,
            @RequestParam Boolean needAssistance) {
        return ResponseEntity.ok(orderService.requestAssistanceByTable(tableNumber, needAssistance));
    }
}
