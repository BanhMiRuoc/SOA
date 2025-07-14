package com.example.backend.repository;

import com.example.backend.model.Order;
import com.example.backend.model.enums.OrderStatus;
import com.example.backend.model.Table;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Collection;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByStatusIn(Collection<OrderStatus> statuses);
    Order findByTableAndStatus(Table table, OrderStatus status);
    List<Order> findByOrderTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Order> findByTableId(Long tableId);
    Order findByTableAndStatusIn(Table table, List<OrderStatus> of);
}