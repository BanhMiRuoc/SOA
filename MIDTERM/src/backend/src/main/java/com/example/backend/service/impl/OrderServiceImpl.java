package com.example.backend.service.impl;

import com.example.backend.exception.Exceptions;
import com.example.backend.model.*;
import com.example.backend.model.enums.OrderStatus;
import com.example.backend.model.enums.TableStatus;
import com.example.backend.model.enums.OrderItemStatus;
import com.example.backend.repository.MenuItemRepository;
import com.example.backend.repository.OrderItemRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.example.backend.dto.OrderRequest;
import com.example.backend.dto.OrderResponse;
import com.example.backend.dto.OrderItemRequest;
import com.example.backend.dto.OrderItemResponse;
import com.example.backend.repository.TableRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.exception.InvalidOperationException;

@Service
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private TableRepository tableRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private MenuItemRepository menuItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private final ThreadPoolTaskScheduler taskScheduler;
    
    public OrderServiceImpl() {
        this.taskScheduler = new ThreadPoolTaskScheduler();
        this.taskScheduler.setPoolSize(5);
        this.taskScheduler.setThreadNamePrefix("OrderScheduler-");
        this.taskScheduler.initialize();
    }
    
    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    @Override
    public List<Order> getActiveOrders() {
        return orderRepository.findByStatusIn(List.of(OrderStatus.PENDING, OrderStatus.SERVING));
    }
    
    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(Exceptions::orderNotFound);
    }
    
    @Override
    @Transactional
    public OrderItem addItemToOrder(Long orderId, Long menuItemId, int quantity, String note) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(Exceptions::orderNotFound);
        
        if (order.getIsPaid() != null && order.getIsPaid()) {
            throw Exceptions.orderAlreadyPaid();
        }
        
        // Cho phép thêm món khi đơn hàng ở trạng thái PENDING hoặc COOKING
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.SERVING) {
            throw Exceptions.invalidOrderStatus();
        }
        
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(Exceptions::menuItemNotFound);
        
        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setMenuItem(menuItem);
        orderItem.setQuantity(quantity);
        orderItem.setPrice(menuItem.getPrice());
        orderItem.setNote(note);
        orderItem.setStatus(OrderItemStatus.PENDING);
        orderItem.setOrderAt(LocalDateTime.now());
        
        orderItem = orderItemRepository.save(orderItem);
        
        // Lập lịch chuyển trạng thái OrderItem sang COOKING sau 20 giây
        scheduleOrderItemStatusChange(orderItem.getId());
        
        recalculateOrderTotal(order);
        
        return orderItem;
    }
    
    @Override
    @Transactional
    public void removeItemFromOrder(Long orderItemId) {
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(Exceptions::orderItemNotFound);
        
        Order order = orderItem.getOrder();
        
        if (order.getIsPaid() != null && order.getIsPaid()) {
            throw Exceptions.orderAlreadyPaid();
        }
        
        if (orderItem.getStatus() != OrderItemStatus.PENDING) {
            throw Exceptions.invalidOrderStatus();
        }
        
        orderItemRepository.delete(orderItem);
        recalculateOrderTotal(order);
    }
    
    @Override
    @Transactional
    public OrderItem updateOrderItemStatus(Long orderItemId, OrderItemStatus status) {
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(Exceptions::orderItemNotFound);
        
        orderItem.setStatus(status);
        return orderItemRepository.save(orderItem);
    }
    
    @Override
    @Transactional
    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(Exceptions::orderNotFound);
        
        // Nếu chuyển sang trạng thái PAID, cần kiểm tra các điều kiện
        if (status == OrderStatus.PAID) {
            // Kiểm tra xem có OrderItem nào đang ở trạng thái PENDING hoặc COOKING không
            List<OrderItem> items = orderItemRepository.findByOrder(order);
            boolean hasUnfinishedItems = items.stream()
                    .anyMatch(item -> item.getStatus() == OrderItemStatus.PENDING 
                            || item.getStatus() == OrderItemStatus.COOKING);
            
            if (hasUnfinishedItems) {
                throw new InvalidOperationException("Không thể hoàn thành đơn hàng khi vẫn còn món ăn chưa được hoàn thành");
            }
        }
        
        order.setStatus(status);
        
        // Nếu chuyển sang trạng thái SERVING, cập nhật tất cả OrderItem sang COOKING
        if (status == OrderStatus.SERVING) {
            List<OrderItem> items = orderItemRepository.findByOrder(order);
            for (OrderItem item : items) {
                if (item.getStatus() == OrderItemStatus.PENDING) {
                    item.setStatus(OrderItemStatus.COOKING);
                    orderItemRepository.save(item);
                }
            }
        }
        
        // Lưu và trả về đối tượng đã được cập nhật
        Order savedOrder = orderRepository.save(order);
        System.out.println("Order " + orderId + " status updated to " + status + " and saved to database");
        return savedOrder;
    }

    @Override
    public List<Order> getOrdersByTable(Long tableId) {
        tableRepository.findById(tableId)
                .orElseThrow(Exceptions::tableNotFound);
        return orderRepository.findByTableId(tableId);
    }

    private void recalculateOrderTotal(Order order) {
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        
        BigDecimal total = orderItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        order.setTotalAmount(total);
        orderRepository.save(order);
    }

    @Override
    public OrderResponse getCurrentOrderByTableNumber(String tableNumber) {
        // Tìm bàn theo tableNumber
        Table table = tableRepository.findByTableNumber(tableNumber)
                .orElseThrow(Exceptions::tableNotFound);
        
        // Tìm order với status là PENDING, COOKING hoặc COMPLETED
        Order order = orderRepository.findByTableAndStatusIn(
                table, 
                List.of(OrderStatus.PENDING, OrderStatus.SERVING)
        );
        
        if (order == null) {
            return null; // Không có đơn hàng nào đang chờ phục vụ, đang nấu hoặc đã hoàn thành
        }
        
        // Lấy danh sách OrderItems trực tiếp từ repository
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        
        // Convert to DTO instead of returning Entity directly
        return convertOrderToResponse(order, orderItems);
    }
    
    @Override
    @Transactional
    public OrderResponse createCustomerOrder(String tableNumber, OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Đơn hàng phải có ít nhất một món ăn");
        }
        
        // Tìm bàn theo số bàn
        Table table = tableRepository.findByTableNumber(tableNumber)
                .orElseThrow(Exceptions::tableNotFound);
                
        // Kiểm tra xem bàn đã có order PENDING hoặc SERVING nào chưa
        Order order = orderRepository.findByTableAndStatusIn(
                table, 
                List.of(OrderStatus.PENDING, OrderStatus.SERVING)
        );
        
        
        boolean isNewOrder = false;
        
        // Nếu chưa có order, tạo mới
        if (order == null) {
            order = new Order();
            order.setTable(table);
            order.setStatus(OrderStatus.PENDING);
            order.setOrderTime(LocalDateTime.now());
            order.setIsPaid(false);
            order.setTotalAmount(BigDecimal.ZERO);
            
            // Sử dụng waiterId từ bảng Table nếu có
            if (table.getCurrentWaiterId() != null) {
                order.setWaiterId(table.getCurrentWaiterId());
            }
            
            order = orderRepository.save(order);
            isNewOrder = true;
            
            // Cập nhật trạng thái bàn sang OCCUPIED khi tạo đơn hàng mới
            table.setStatus(TableStatus.OCCUPIED);
            tableRepository.save(table);
        } else {
            // Kiểm tra xem order hiện tại đã thanh toán chưa
            if (order.getIsPaid() != null && order.getIsPaid()) {
                throw Exceptions.orderAlreadyPaid();
            }
        }
        
        // Nếu là đơn hàng mới, lập lịch chuyển trạng thái sau khi đã lưu tất cả OrderItem
        if (isNewOrder) {
            // Lập lịch chuyển trạng thái sau 20 giây
            scheduleOrderStatusChange(order.getId());
            System.out.println("Scheduled status change for new order " + order.getId());
        }

        // Thêm các món ăn vào đơn hàng
        for (OrderItemRequest itemRequest : request.getItems()) {
            try {
                Long menuItemId = itemRequest.getMenuItemId();
                int quantity = itemRequest.getQuantity();
                
                // Xử lý note
                String note = itemRequest.getNote();
                
                // Nếu là gọi thêm món (không phải đơn hàng mới), thêm tiền tố vào ghi chú
                if (!isNewOrder) {
                    if (note != null && !note.isEmpty()) {
                        note = "GỌI THÊM - " + note;
                    } else {
                        note = "GỌI THÊM";
                    }
                }
                
                if (menuItemId == null) {
                    throw new IllegalArgumentException("menuItemId không thể trống");
                }
                
                if (quantity <= 0) {
                    throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
                }
                
                addItemToOrder(order.getId(), menuItemId, quantity, note);
            } catch (Exception e) {
                throw new IllegalArgumentException("Có lỗi xảy ra khi đặt món");
            }
        }
        
        // Cập nhật tổng tiền
        recalculateOrderTotal(order);
        
        // Lấy lại đơn hàng từ cơ sở dữ liệu (đã có tổng tiền)
        order = orderRepository.findById(order.getId()).orElseThrow(Exceptions::orderNotFound);
        
        
        
        // Convert to DTO instead of returning Entity directly
        return convertOrderToResponse(order, orderItemRepository.findByOrder(order));
    }
    
    @Override
    public OrderResponse convertOrderToResponse(Order order, List<OrderItem> orderItems) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setTableNumber(order.getTable().getTableNumber());
        response.setOrderTime(order.getOrderTime());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setIsPaid(order.getIsPaid() != null ? order.getIsPaid() : false);
        response.setWaiterId(order.getWaiterId());
        response.setNeedAssistance(order.getNeedAssistance() != null ? order.getNeedAssistance() : false);
        
        // Lấy tên nhân viên từ userId nếu có
        if (order.getWaiterId() != null) {
            userRepository.findById(order.getWaiterId())
                .ifPresent(user -> response.setWaiterName(user.getName()));
        }

        List<OrderItemResponse> itemResponses = orderItems.stream()
            .map(item -> {
                OrderItemResponse itemResponse = new OrderItemResponse();
                itemResponse.setId(item.getId());
                itemResponse.setMenuItemId(item.getMenuItem().getId());
                itemResponse.setMenuItemName(item.getMenuItem().getName());
                itemResponse.setQuantity(item.getQuantity());
                itemResponse.setNote(item.getNote());
                itemResponse.setStatus(item.getStatus());
                itemResponse.setPrice(item.getPrice());
                itemResponse.setOrderAt(item.getOrderAt());
                return itemResponse;
            })
            .collect(Collectors.toList());
        
        response.setItems(itemResponses);
        return response;
    }

    /**
     * Lập lịch chuyển trạng thái Order từ PENDING sang COOKING sau 30 giây
     * @param orderId ID của Order cần chuyển trạng thái
     */
    private void scheduleOrderStatusChange(Long orderId) {
        taskScheduler.schedule(() -> {
            try {
                // Sử dụng @Transactional không hoạt động trong scheduled tasks
                // nên chúng ta cần quản lý transaction thủ công trong task này
                Order order = orderRepository.findById(orderId).orElse(null);
                
                if (order != null && order.getStatus() == OrderStatus.PENDING) {
                    // Cập nhật trạng thái sang SERVING
                    Order updatedOrder = updateStatus(order.getId(), OrderStatus.SERVING);
                    System.out.println("Successfully updated order " + orderId + " to status " + updatedOrder.getStatus());
                } else if (order != null) {
                    System.out.println("Order " + orderId + " status was not PENDING, current status: " + order.getStatus());
                } else {
                    System.out.println("Order " + orderId + " not found for status update");
                }
            } catch (Exception e) {
                // Ghi log lỗi chi tiết hơn
                System.err.println("Error updating order status for order " + orderId + ": " + e.getMessage());
                e.printStackTrace();
            }
        }, Instant.now().plus(Duration.ofSeconds(20)));
    }
    
    /**
     * Lập lịch chuyển trạng thái OrderItem từ PENDING sang COOKING sau 30 giây
     * @param orderItemId ID của OrderItem cần chuyển trạng thái
     */
    private void scheduleOrderItemStatusChange(Long orderItemId) {
        taskScheduler.schedule(() -> {
            try {
                OrderItem orderItem = orderItemRepository.findById(orderItemId).orElse(null);
                
                if (orderItem != null && orderItem.getStatus() == OrderItemStatus.PENDING) {
                    OrderItem updatedItem = updateOrderItemStatus(orderItem.getId(), OrderItemStatus.COOKING);
                    System.out.println("Successfully updated orderItem " + orderItemId + " to status " + updatedItem.getStatus());
                } else if (orderItem != null) {
                    System.out.println("OrderItem " + orderItemId + " status was not PENDING, current status: " + orderItem.getStatus());
                } else {
                    System.out.println("OrderItem " + orderItemId + " not found for status update");
                }
            } catch (Exception e) {
                System.err.println("Error updating orderItem status for item " + orderItemId + ": " + e.getMessage());
                e.printStackTrace();
            }
        }, Instant.now().plus(Duration.ofSeconds(20)));
    }

    @Override
    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(Exceptions::orderNotFound);
        
        // Chỉ cho phép hủy đơn hàng khi đang ở trạng thái PENDING
        if (order.getStatus() != OrderStatus.PENDING) {
            throw Exceptions.invalidOrderStatus();
        }
        
        // Kiểm tra xem đơn hàng đã thanh toán chưa
        if (order.getIsPaid() != null && order.getIsPaid()) {
            throw Exceptions.orderAlreadyPaid();
        }
        
        // Lấy tất cả OrderItem của Order
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        
        // Chuyển tất cả OrderItem sang trạng thái CANCELLED
        for (OrderItem item : orderItems) {
            item.setStatus(OrderItemStatus.CANCELLED);
            orderItemRepository.save(item);
        }
        
        // Chuyển Order sang trạng thái CANCELLED
        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }
    
    @Override
    public Order requestAssistance(Long orderId, Boolean needAssistance) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(Exceptions::orderNotFound);
        
        order.setNeedAssistance(needAssistance);
        return orderRepository.save(order);
    }
    
    @Override
    public Order requestAssistanceByTable(String tableNumber, Boolean needAssistance) {
        // Tìm bàn theo tableNumber
        Table table = tableRepository.findByTableNumber(tableNumber)
                .orElseThrow(Exceptions::tableNotFound);
        
        // Tìm order với status là PENDING hoặc SERVING
        Order order = orderRepository.findByTableAndStatusIn(
                table, 
                List.of(OrderStatus.PENDING, OrderStatus.SERVING)
        );
        
        if (order == null) {
            throw Exceptions.orderNotFound();
        }
        
        order.setNeedAssistance(needAssistance);
        return orderRepository.save(order);
    }
}
