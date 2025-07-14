package com.example.backend.service;

import com.example.backend.dto.OrderRequest;
import com.example.backend.dto.OrderResponse;
import com.example.backend.model.Order;
import com.example.backend.model.OrderItem;
import com.example.backend.model.enums.OrderItemStatus;
import com.example.backend.model.enums.OrderStatus;
import java.util.List;

public interface OrderService {
    List<Order> getAllOrders();
    List<Order> getActiveOrders();
    Order getOrderById(Long id);
    OrderItem addItemToOrder(Long orderId, Long menuItemId, int quantity, String note);
    void removeItemFromOrder(Long orderItemId);
    OrderItem updateOrderItemStatus(Long orderItemId, OrderItemStatus status);
    Order updateStatus(Long orderId, OrderStatus status);
    List<Order> getOrdersByTable(Long tableId);
    OrderResponse getCurrentOrderByTableNumber(String tableNumber);
    OrderResponse createCustomerOrder(String tableNumber, OrderRequest request);
    OrderResponse convertOrderToResponse(Order order, List<OrderItem> orderItems);
    Order cancelOrder(Long orderId);
    
    // Phương thức mới cho chức năng gọi nhân viên
    Order requestAssistance(Long orderId, Boolean needAssistance);
    Order requestAssistanceByTable(String tableNumber, Boolean needAssistance);
}
