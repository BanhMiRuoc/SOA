package com.example.backend.service;
import com.example.backend.model.Table;

import java.util.List;

public interface TableService {
    List<Table> getAllTables();
    List<Table> getTablesByStatus(String status);
    Table getTableById(Long id);
    Table findByTableNumber(String tableNumber);
    void openTable(Long tableId, Long waiterId);
    void occupyTable(Long tableId);
    void closeTable(Long tableId);
    void assignWaiter(Long tableId, Long waiterId);
    
    // Các phương thức mới
    List<Table> getAllTablesIncludingHidden(); // Lấy tất cả bàn kể cả ẩn
    Table createTable(Table table); // Tạo bàn mới
    Table updateTable(Long id, Table table); // Cập nhật thông tin bàn
    void hideTable(Long id); // Ẩn bàn
    void showTable(Long id); // Hiện bàn
}