package com.example.backend.repository;

import com.example.backend.model.Order;
import com.example.backend.model.OrderItem;
import com.example.backend.model.enums.OrderItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order);
    List<OrderItem> findByOrderAndStatus(Order order, OrderItemStatus status);
}