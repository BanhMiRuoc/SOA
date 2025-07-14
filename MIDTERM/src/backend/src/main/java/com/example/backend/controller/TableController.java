package com.example.backend.controller;
import com.example.backend.model.Table;
import com.example.backend.service.TableService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
@Slf4j
public class TableController {
    private final TableService tableService;
    
    @GetMapping
    public ResponseEntity<List<Table>> getAllTables() {
        return ResponseEntity.ok(tableService.getAllTables());
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Table>> getTablesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(tableService.getTablesByStatus(status));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Table> getTableById(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.getTableById(id));
    }
    
    @GetMapping("/number/{tableNumber}")
    public ResponseEntity<Table> getTableByNumber(@PathVariable String tableNumber) {
        Table table = tableService.findByTableNumber(tableNumber);
        if (table == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(table);
    }
    
    @PostMapping("/{id}/open")
    public ResponseEntity<Void> openTable(@PathVariable Long id) {
        log.info("Opening table with ID: " + id);
        
        // Tìm user có vai trò WAITER để làm waiter mặc định
        try {
            // Giả sử có một repository để truy vấn user
            Long defaultWaiterId = 6L; // ID của waiter1@example.com trong database
            log.info("Using default waiter ID: " + defaultWaiterId);
            
            tableService.openTable(id, defaultWaiterId);
            log.info("Table opened successfully");
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error opening table: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/occupy")
    @PreAuthorize("hasAnyAuthority('WAITER', 'MANAGER')")
    public ResponseEntity<Void> occupyTable(@PathVariable Long id) {
        log.info("Changing table state to OCCUPIED for ID: " + id);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("User: " + auth.getName() + ", Authorities: " + auth.getAuthorities());
        
        tableService.occupyTable(id);
        log.info("Table state changed to OCCUPIED successfully");
        
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyAuthority('WAITER', 'MANAGER')")
    public ResponseEntity<Void> closeTable(@PathVariable Long id) {
        log.info("Closing table with ID: " + id);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("User: " + auth.getName() + ", Authorities: " + auth.getAuthorities());
        
        tableService.closeTable(id);
        log.info("Table closed successfully");
        
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/assign/{waiterId}")
    @PreAuthorize("hasAnyAuthority('WAITER', 'MANAGER')")
    public ResponseEntity<Void> assignWaiter(@PathVariable Long id, @PathVariable Long waiterId) {
        log.info("Assigning waiter ID: " + waiterId + " to table ID: " + id);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("User: " + auth.getName() + ", Authorities: " + auth.getAuthorities());
        
        tableService.assignWaiter(id, waiterId);
        log.info("Waiter assigned successfully");
        
        return ResponseEntity.ok().build();
    }
    
    // Các endpoint mới cho quản lý bàn
    
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<List<Table>> getAllTablesIncludingHidden() {
        log.info("Getting all tables including hidden ones");
        return ResponseEntity.ok(tableService.getAllTablesIncludingHidden());
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<Table> createTable(@RequestBody Table table) {
        log.info("Creating new table: " + table.getTableNumber());
        return ResponseEntity.ok(tableService.createTable(table));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<Table> updateTable(@PathVariable Long id, @RequestBody Table table) {
        log.info("Updating table with ID: " + id);
        return ResponseEntity.ok(tableService.updateTable(id, table));
    }
    
    @PostMapping("/{id}/hide")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<Void> hideTable(@PathVariable Long id) {
        log.info("Hiding table with ID: " + id);
        tableService.hideTable(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/show")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<Void> showTable(@PathVariable Long id) {
        log.info("Showing table with ID: " + id);
        tableService.showTable(id);
        return ResponseEntity.ok().build();
    }
}