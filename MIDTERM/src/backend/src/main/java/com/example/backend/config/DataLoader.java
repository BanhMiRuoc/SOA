package com.example.backend.config;

import com.example.backend.model.*;
import com.example.backend.model.enums.*;
import com.example.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TableRepository tableRepository;
    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Tạo users
        if (userRepository.count() == 0) {
            createTestUser("chef@example.com", "Chef User", "KITCHEN_STAFF", true);
            createTestUser("manager@example.com", "Manager User", "MANAGER", true);
            createTestUser("waiter@example.com", "Waiter User", "WAITER", true);
            createTestUser("admin@example.com", "Admin User", "ADMIN", true);
            
            // Thêm role CASHIER
            createTestUser("cashier@example.com", "Cashier User", "CASHIER", true);
            
            // Thêm thêm 5 waiter khác
            createTestUser("waiter1@example.com", "Waiter Nguyen Van A", "WAITER", true);
            createTestUser("waiter2@example.com", "Waiter Tran Thi B", "WAITER", true);
            createTestUser("waiter3@example.com", "Waiter Le Van C", "WAITER", true);
            createTestUser("waiter4@example.com", "Waiter Pham Thi D", "WAITER", true);
            createTestUser("waiter5@example.com", "Waiter Hoang Van E", "WAITER", false); // Một người bị vô hiệu hóa
        }

        // Tạo tables
        if (tableRepository.count() == 0) {
            createTables();
        }

        // Tạo menu items
        if (menuItemRepository.count() == 0) {
            createMenuItems();
        }
        
        // Tạo đơn hàng mẫu và thanh toán
        if (orderRepository.count() == 0) {
            createSampleOrdersAndPayments();
        }
    }

    private void createTestUser(String email, String name, String role, boolean isActive) {
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword(passwordEncoder.encode("password"));
        user.setRole(UserRole.valueOf(role));
        user.setIsActive(isActive);
        userRepository.save(user);
    }

    private void createTables() {
        // Lấy ID của manager
        User manager = userRepository.findByEmail("manager@example.com")
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        
        List<String> zones = Arrays.asList("A", "B", "C");
        for (String zone : zones) {
            for (int i = 1; i <= 5; i++) {
                Table table = new Table();
                table.setTableNumber(String.format("%s_%02d", zone, i));
                table.setZone(zone);
                table.setCapacity(4 + (i % 2) * 2); // 4 hoặc 6 người
                table.setStatus(TableStatus.CLOSED);
                table.setCurrentWaiterId(manager.getId()); // Thiết lập ID của manager làm currentWaiterId mặc định
                table.setIsActive(true); // Tất cả bàn mặc định là hiển thị
                
                // Ẩn một số bàn để kiểm nghiệm
                if ((zone.equals("C") && i > 3) || (zone.equals("B") && i == 5)) {
                    table.setIsActive(false);
                }
                
                tableRepository.save(table);
            }
        }
    }

    private void createMenuItems() {
        // Sushi Rolls
        createMenuItem("Salmon Roll", "Cơm cuộn cá hồi tươi", new BigDecimal("120000"), "Sushi", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Spicy Tuna Roll", "Cơm cuộn cá ngừ cay", new BigDecimal("130000"), "Sushi", true, true, KitchenType.COLD_KITCHEN);
        createMenuItem("Dragon Roll", "Cơm cuộn tôm tempura với bơ", new BigDecimal("150000"), "Sushi", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Rainbow Roll", "Cơm cuộn với nhiều loại cá", new BigDecimal("180000"), "Sushi", true, false, KitchenType.COLD_KITCHEN);

        // Sashimi
        createMenuItem("Salmon Sashimi", "Cá hồi tươi cắt lát", new BigDecimal("180000"), "Sashimi", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Tuna Sashimi", "Cá ngừ tươi cắt lát", new BigDecimal("200000"), "Sashimi", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Mixed Sashimi", "Tổng hợp các loại cá", new BigDecimal("250000"), "Sashimi", true, false, KitchenType.COLD_KITCHEN);

        // Okonomiyaki
        createMenuItem("Classic Okonomiyaki", "Bánh xèo Nhật truyền thống", new BigDecimal("150000"), "Okonomiyaki", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Seafood Okonomiyaki", "Bánh xèo hải sản", new BigDecimal("180000"), "Okonomiyaki", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Spicy Okonomiyaki", "Bánh xèo cay", new BigDecimal("160000"), "Okonomiyaki", true, true, KitchenType.HOT_KITCHEN);

        // Combo Sets
        createMenuItem("Sushi Combo A", "Set sushi đa dạng cho 2 người", new BigDecimal("350000"), "Combo", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Sashimi Combo B", "Set sashimi đa dạng cho 2 người", new BigDecimal("400000"), "Combo", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Family Set", "Set lớn cho 4 người", new BigDecimal("600000"), "Combo", true, false, KitchenType.COLD_KITCHEN);
        // Ramen
        createMenuItem("Tonkotsu Ramen", "Mì ramen với nước dùng xương heo", new BigDecimal("150000"), "Mì", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Spicy Miso Ramen", "Mì ramen với súp miso cay", new BigDecimal("160000"), "Mì", true, true, KitchenType.HOT_KITCHEN);
        createMenuItem("Shoyu Ramen", "Mì ramen với nước tương Nhật", new BigDecimal("140000"), "Mì", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Seafood Ramen", "Mì ramen hải sản", new BigDecimal("180000"), "Mì", true, false, KitchenType.HOT_KITCHEN);

        // Udon
        createMenuItem("Kitsune Udon", "Mì udon với đậu phụ chiên", new BigDecimal("120000"), "Mì", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Beef Udon", "Mì udon với thịt bò", new BigDecimal("150000"), "Mì", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Tempura Udon Set", "Mì udon với tempura tổng hợp", new BigDecimal("180000"), "Mì", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Curry Udon", "Mì udon với cà ri Nhật", new BigDecimal("140000"), "Mì", true, true, KitchenType.HOT_KITCHEN);

        // Thịt nướng (Yakiniku)
        createMenuItem("Wagyu Yakiniku", "Thịt bò Wagyu nướng", new BigDecimal("350000"), "Món Nướng", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Pork Belly BBQ", "Thịt ba chỉ nướng", new BigDecimal("200000"), "Món Nướng", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Mixed BBQ Set", "Set nướng tổng hợp", new BigDecimal("400000"), "Món Nướng", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Spicy BBQ Chicken", "Gà nướng cay kiểu Nhật", new BigDecimal("180000"), "Món Nướng", true, true, KitchenType.HOT_KITCHEN);

        // Món Chiên
        createMenuItem("Tôm Tempura", "Tôm tươi tẩm bột chiên xù", new BigDecimal("160000"), "Món Chiên", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Rau Củ Tempura", "Các loại rau củ chiên xù", new BigDecimal("120000"), "Món Chiên", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Tempura Thập Cẩm", "Tổng hợp hải sản và rau củ chiên xù", new BigDecimal("200000"), "Món Chiên", true, false, KitchenType.HOT_KITCHEN);

        // Cơm
        createMenuItem("Cơm Bò Teriyaki", "Cơm với bò sốt teriyaki", new BigDecimal("150000"), "Cơm", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Cơm Gà Karaage", "Cơm với gà chiên kiểu Nhật", new BigDecimal("130000"), "Cơm", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Cơm Cá Hồi Nướng", "Cơm với cá hồi nướng sốt teriyaki", new BigDecimal("160000"), "Cơm", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Cơm Katsu", "Cơm với thịt heo tẩm bột chiên", new BigDecimal("140000"), "Cơm", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Cơm Trứng Lươn", "Cơm với trứng và lươn nướng", new BigDecimal("170000"), "Cơm", true, false, KitchenType.HOT_KITCHEN);

        // Món Phụ
        createMenuItem("Kim Chi", "Kim chi cải thảo Hàn Quốc", new BigDecimal("30000"), "Món Phụ", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Canh Miso", "Canh với đậu phụ và rong biển", new BigDecimal("30000"), "Món Phụ", true, false, KitchenType.HOT_KITCHEN);
        createMenuItem("Salad Rong Biển", "Salad rong biển trộn dầu mè", new BigDecimal("45000"), "Món Phụ", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Đậu Phụ Lạnh", "Đậu phụ lạnh với gừng và hành lá", new BigDecimal("40000"), "Món Phụ", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Canh Rong Biển", "Canh rong biển truyền thống", new BigDecimal("35000"), "Món Phụ", true, false, KitchenType.HOT_KITCHEN);

        // Nước ngọt & trà
        createMenuItem("Coca Cola", "Coca Cola", new BigDecimal("25000"), "Đồ Uống", true, false, KitchenType.BAR);
        createMenuItem("Sprite", "Sprite", new BigDecimal("25000"), "Đồ Uống", true, false, KitchenType.BAR);
        createMenuItem("Trà Ô Long", "Trà ô long", new BigDecimal("30000"), "Đồ Uống", true, false, KitchenType.BAR);
        createMenuItem("Nước Cam", "Nước cam tươi", new BigDecimal("35000"), "Đồ Uống", true, false, KitchenType.BAR);
        createMenuItem("Matcha Đá", "Trà xanh matcha", new BigDecimal("45000"), "Đồ Uống", true, false, KitchenType.BAR);
        createMenuItem("Ramune Soda", "Soda Nhật Bản", new BigDecimal("35000"), "Đồ Uống", true, false, KitchenType.BAR);
        createMenuItem("Yuzu Juice", "Nước ép quýt Yuzu", new BigDecimal("40000"), "Đồ Uống", true, false, KitchenType.BAR);
        createMenuItem("Matcha Latte", "Trà xanh matcha sữa", new BigDecimal("45000"), "Đồ Uống", true, false, KitchenType.BAR);

        // Bia và rượu
        createMenuItem("Sake Junmai", "Rượu sake cao cấp", new BigDecimal("350000"), "Đồ Uống", true, false, KitchenType.BAR);
        createMenuItem("Shochu", "Rượu shochu", new BigDecimal("280000"), "Đồ Uống", true, false, KitchenType.BAR);
        createMenuItem("Rượu Mơ", "Rượu mơ Nhật Bản", new BigDecimal("220000"), "Đồ Uống", true, false, KitchenType.BAR);
        createMenuItem("Bia Asahi", "Bia Asahi Nhật", new BigDecimal("45000"), "Đồ Uống", true, false, KitchenType.BAR);
        createMenuItem("Bia Sapporo", "Bia Sapporo Nhật", new BigDecimal("45000"), "Đồ Uống", true, false, KitchenType.BAR);
        createMenuItem("Bia Kirin", "Bia Kirin Nhật", new BigDecimal("45000"), "Đồ Uống", true, false, KitchenType.BAR);

        // Salad
        createMenuItem("Salad Cá Hồi", "Salad với cá hồi áp chảo và sốt mè", new BigDecimal("120000"), "Salad", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Salad Bò", "Salad với thịt bò nướng và sốt ponzu", new BigDecimal("130000"), "Salad", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Salad Đậu Phụ", "Salad với đậu phụ và rau củ", new BigDecimal("90000"), "Salad", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Salad Hải Sản", "Salad với tôm, mực và sốt wasabi", new BigDecimal("150000"), "Salad", true, true, KitchenType.COLD_KITCHEN);
        createMenuItem("Salad Wakame", "Salad rong biển wakame truyền thống", new BigDecimal("80000"), "Salad", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Salad Tataki", "Salad với cá ngừ tataki và sốt ponzu", new BigDecimal("140000"), "Salad", true, false, KitchenType.COLD_KITCHEN);
        createMenuItem("Salad Goma", "Salad rau củ với sốt mè đen", new BigDecimal("70000"), "Salad", true, false, KitchenType.COLD_KITCHEN);
    }

    private void createMenuItem(String name, String description, BigDecimal price, String category, 
                              Boolean isAvailable, Boolean isSpicy, KitchenType kitchenType) {
        MenuItem item = new MenuItem();
        item.setName(name);
        item.setDescription(description);
        item.setPrice(price);
        item.setCategory(category);
        item.setIsAvailable(isAvailable);
        item.setIsSpicy(isSpicy);
        item.setKitchenType(kitchenType);
        
        // Tạo tên file từ tên món ăn (loại bỏ dấu cách và ký tự đặc biệt)
        String filename = name.toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("[áàảãạâấầẩẫậăắằẳẵặ]", "a")
                .replaceAll("[éèẻẽẹêếềểễệ]", "e")
                .replaceAll("[íìỉĩị]", "i")
                .replaceAll("[óòỏõọôốồổỗộơớờởỡợ]", "o")
                .replaceAll("[úùủũụưứừửữự]", "u")
                .replaceAll("[ýỳỷỹỵ]", "y")
                .replaceAll(" ", "")
                .replaceAll("[^a-z0-9]", "");
        
        // Chỉ lưu tên file
        item.setImageUrl(filename + ".jpg");
        menuItemRepository.save(item);
    }
    
    private void createSampleOrdersAndPayments() {
        // Lấy một waiter để gán cho đơn hàng
        User waiter = userRepository.findByEmail("waiter1@example.com")
                .orElseThrow(() -> new RuntimeException("Waiter not found"));
        
        // Lấy danh sách bàn
        List<Table> tables = tableRepository.findAll();
        if (tables.isEmpty()) {
            throw new RuntimeException("No tables found");
        }
        
        // Lấy danh sách món ăn
        List<MenuItem> menuItems = menuItemRepository.findAll();
        if (menuItems.isEmpty()) {
            throw new RuntimeException("No menu items found");
        }
        
        // Tạo 30 đơn hàng mẫu trong 7 ngày gần đây
        Random random = new Random();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 0; i < 30; i++) {
            // Chọn ngẫu nhiên 1 bàn
            Table table = tables.get(random.nextInt(tables.size()));
            
            // Tạo ngày đặt hàng trong khoảng 7 ngày gần đây
            int daysAgo = random.nextInt(7);
            int hoursOffset = random.nextInt(12);
            LocalDateTime orderTime = now.minusDays(daysAgo).withHour(10 + hoursOffset).withMinute(random.nextInt(60));
            
            // Tạo đơn hàng
            Order order = new Order();
            order.setTable(table);
            order.setWaiterId(waiter.getId());
            order.setOrderTime(orderTime);
            order.setStatus(OrderStatus.PAID); // Tất cả đơn hàng mẫu đều đã thanh toán
            order.setIsPaid(true);
            order.setTotalAmount(BigDecimal.ZERO); // Sẽ cập nhật sau khi thêm các món
            
            order = orderRepository.save(order);
            
            // Thêm từ 2-6 món ăn cho mỗi đơn hàng
            int numberOfItems = 2 + random.nextInt(5);
            BigDecimal totalAmount = BigDecimal.ZERO;
            
            for (int j = 0; j < numberOfItems; j++) {
                // Chọn ngẫu nhiên 1 món ăn
                MenuItem menuItem = menuItems.get(random.nextInt(menuItems.size()));
                
                // Chọn ngẫu nhiên số lượng từ 1-3
                int quantity = 1 + random.nextInt(3);
                
                // Tính giá của món ăn
                BigDecimal itemTotal = menuItem.getPrice().multiply(new BigDecimal(quantity));
                totalAmount = totalAmount.add(itemTotal);
                
                // Tạo OrderItem
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setMenuItem(menuItem);
                orderItem.setQuantity(quantity);
                orderItem.setPrice(menuItem.getPrice());
                orderItem.setStatus(OrderItemStatus.SERVED); // Tất cả các món đều đã phục vụ
                orderItem.setOrderAt(orderTime);
                
                orderItemRepository.save(orderItem);
            }
            
            // Cập nhật tổng tiền đơn hàng
            order.setTotalAmount(totalAmount);
            orderRepository.save(order);
            
            // Tạo thanh toán cho đơn hàng
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setAmount(totalAmount);
            
            // Chọn ngẫu nhiên phương thức thanh toán
            PaymentMethod[] paymentMethods = PaymentMethod.values();
            payment.setPaymentMethod(paymentMethods[random.nextInt(paymentMethods.length)]);
            
            // Thời gian thanh toán là sau thời gian đặt hàng 30-90 phút
            int minutesLater = 30 + random.nextInt(61);
            payment.setPaymentTime(orderTime.plusMinutes(minutesLater));
            
            // Tạo mã biên lai ngẫu nhiên
            payment.setReceiptNumber(generateReceiptNumber(orderTime));
            
            paymentRepository.save(payment);
        }
    }
    
    private String generateReceiptNumber(LocalDateTime dateTime) {
        String prefix = "REC";
        String dateStr = dateTime.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomStr = String.format("%04d", new Random().nextInt(10000));
        return prefix + dateStr + randomStr;
    }
}