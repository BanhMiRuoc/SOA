package com.example.backend.controller;

import com.example.backend.model.MenuItem;
import com.example.backend.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MenuController {
    private final MenuService menuService;
    
    @GetMapping("/menu")
    public ResponseEntity<List<MenuItem>> getAllMenuItems() {
        return ResponseEntity.ok(menuService.getAllMenuItems());
    }
    
    @GetMapping("/categories")
    public ResponseEntity<Set<String>> getAllCategories() {
        return ResponseEntity.ok(menuService.getAllCategories());
    }
    
    @GetMapping("/menu/visible")
    public ResponseEntity<List<MenuItem>> getVisibleMenuItems() {
        return ResponseEntity.ok(menuService.getVisibleMenuItems());
    }
    
    @PostMapping("/menu")
    public ResponseEntity<MenuItem> addMenuItem(@RequestBody MenuItem menuItem) {
        return ResponseEntity.ok(menuService.addMenuItem(menuItem));
    }
    
    @PutMapping("/menu/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable Long id, @RequestBody MenuItem menuItem) {
        return ResponseEntity.ok(menuService.updateMenuItem(id, menuItem));
    }
    
    
    @PatchMapping("/menu/{id}/toggle-availability")
    public ResponseEntity<MenuItem> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.toggleAvailability(id));
    }
    
    @PatchMapping("/menu/{id}/toggle-visibility")
    public ResponseEntity<MenuItem> toggleVisibility(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.toggleVisibility(id));
    }
}