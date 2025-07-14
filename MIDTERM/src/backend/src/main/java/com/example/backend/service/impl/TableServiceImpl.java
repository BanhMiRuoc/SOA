package com.example.backend.service.impl;
import com.example.backend.model.Table;
import com.example.backend.model.enums.TableStatus;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.TableRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.TableService;
import com.example.backend.exception.Exceptions;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TableServiceImpl implements TableService {
    
    private final TableRepository tableRepository;
    
    private final OrderRepository orderRepository;
    
    private final UserRepository userRepository;
    
    @Override
    public List<Table> getAllTables() {
        return tableRepository.findByIsActiveTrue();
    }
    
    @Override
    public List<Table> getTablesByStatus(String status) {
        TableStatus tableStatus;
        try {
            tableStatus = TableStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw Exceptions.invalidTableStatus();
        }
        return tableRepository.findByStatusAndIsActiveTrue(tableStatus);
    }
    
    @Override
    public Table getTableById(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(Exceptions::tableNotFound);
    }
    
    @Override
    public Table findByTableNumber(String tableNumber) {
        return tableRepository.findByTableNumber(tableNumber)
                .orElse(null);
    }
    
    @Override
    @Transactional
    public void openTable(Long tableId, Long waiterId) {
        Table table = getTableById(tableId);
        if (table.getStatus() != TableStatus.CLOSED) {
            throw Exceptions.tableNotAvailable();
        }
        
        // Cập nhật thông tin bàn
        table.setStatus(TableStatus.OPENED);
        table.setOccupiedAt(LocalDateTime.now());
        tableRepository.save(table);
    }
    
    @Override
    @Transactional
    public void occupyTable(Long tableId) {
        Table table = getTableById(tableId);
        if (table.getStatus() != TableStatus.OPENED) {
            throw Exceptions.tableNotOpened();
        }
        
        table.setStatus(TableStatus.OCCUPIED);
        tableRepository.save(table);
    }
    
    @Override
    @Transactional
    public void closeTable(Long tableId) {
        Table table = getTableById(tableId);
        if (hasUnpaidOrders(tableId)) {
            throw Exceptions.tableHasUnpaidOrders();
        }
        
        table.setStatus(TableStatus.CLOSED);
        table.setOccupiedAt(null);
        tableRepository.save(table);
    }
    
    @Override
    @Transactional
    public void assignWaiter(Long tableId, Long waiterId) {
        Table table = getTableById(tableId);
        
        // Kiểm tra xem nhân viên có tồn tại không
        if (!userRepository.existsById(waiterId)) {
            throw Exceptions.userNotFound();
        }
        
        table.setCurrentWaiterId(waiterId);
        tableRepository.save(table);
    }
    
    private boolean hasUnpaidOrders(Long tableId) {
        return orderRepository.findByTableId(tableId).stream()
                .anyMatch(order -> order.getIsPaid() == null || !order.getIsPaid());
    }
    
    // Triển khai các phương thức mới
    
    @Override
    public List<Table> getAllTablesIncludingHidden() {
        // Trả về tất cả bàn, bao gồm cả bàn đã ẩn
        return tableRepository.findAll();
    }
    
    @Override
    @Transactional
    public Table createTable(Table table) {
        // Kiểm tra xem tableNumber đã tồn tại chưa
        if (tableRepository.findByTableNumber(table.getTableNumber()).isPresent()) {
            throw new RuntimeException("Mã bàn đã tồn tại");
        }
        
        // Mặc định các giá trị cần thiết
        table.setStatus(TableStatus.CLOSED);
        table.setIsActive(true); // Mặc định là hiển thị
        return tableRepository.save(table);
    }
    
    @Override
    @Transactional
    public Table updateTable(Long id, Table tableData) {
        Table existingTable = getTableById(id);
        
        // Kiểm tra xem tableNumber đã tồn tại và không phải là bàn hiện tại
        if (!existingTable.getTableNumber().equals(tableData.getTableNumber()) &&
                tableRepository.findByTableNumber(tableData.getTableNumber()).isPresent()) {
            throw new RuntimeException("Mã bàn đã tồn tại");
        }
        
        // Cập nhật các thông tin có thể thay đổi
        existingTable.setTableNumber(tableData.getTableNumber());
        existingTable.setZone(tableData.getZone());
        existingTable.setCapacity(tableData.getCapacity());
        
        // Không thay đổi status và các thông tin khác
        return tableRepository.save(existingTable);
    }
    
    @Override
    @Transactional
    public void hideTable(Long id) {
        Table table = getTableById(id);
        
        if (table.getStatus() != TableStatus.CLOSED) {
            throw Exceptions.tableNotClosed();
        }
        
        table.setIsActive(false);
        tableRepository.save(table);
    }
    
    @Transactional
    public void hideTable(String tableNumber) {
        Table table = tableRepository.findByTableNumber(tableNumber)
                .orElseThrow(Exceptions::tableNotFound);
        
        if (table.getStatus() != TableStatus.CLOSED) {
            throw Exceptions.tableNotClosed();
        }
        
        table.setIsActive(false);
        tableRepository.save(table);
    }
    
    @Override
    @Transactional
    public void showTable(Long id) {
        Table table = getTableById(id);
        table.setIsActive(true);
        tableRepository.save(table);
    }
} 