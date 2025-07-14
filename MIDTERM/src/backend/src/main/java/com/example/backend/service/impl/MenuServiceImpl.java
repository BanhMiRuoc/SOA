package com.example.backend.service.impl;

import com.example.backend.model.MenuItem;
import com.example.backend.repository.MenuItemRepository;
import com.example.backend.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {
    
    private final MenuItemRepository menuItemRepository;
    
    @Override
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }
    
    @Override
    public List<MenuItem> getVisibleMenuItems() {
        return menuItemRepository.findByIsHiddenFalse();
    }
    
    @Override
    public Set<String> getAllCategories() {
        return menuItemRepository.findAll().stream()
                .map(MenuItem::getCategory)
                .collect(Collectors.toSet());
    }
    
    @Override
    @Transactional
    public MenuItem addMenuItem(MenuItem menuItem) {
        // Nếu không có hình ảnh, tạo tên file mặc định từ tên món ăn
        if (menuItem.getImageUrl() == null || menuItem.getImageUrl().trim().isEmpty()) {
            String filename = generateFilenameFromName(menuItem.getName());
            menuItem.setImageUrl(filename + ".jpg");
        }
        
        return menuItemRepository.save(menuItem);
    }
    
    @Override
    @Transactional
    public MenuItem updateMenuItem(Long id, MenuItem menuItem) {
        MenuItem existingItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        
        // Update fields only if they are not null in the input
        if (menuItem.getName() != null) {
            existingItem.setName(menuItem.getName());
        }
        
        if (menuItem.getDescription() != null) {
            existingItem.setDescription(menuItem.getDescription());
        }
        
        if (menuItem.getPrice() != null) {
            existingItem.setPrice(menuItem.getPrice());
        }
        
        if (menuItem.getCategory() != null) {
            existingItem.setCategory(menuItem.getCategory());
        }
        
        if (menuItem.getIsAvailable() != null) {
            existingItem.setIsAvailable(menuItem.getIsAvailable());
        }
        
        if (menuItem.getIsSpicy() != null) {
            existingItem.setIsSpicy(menuItem.getIsSpicy());
        }
        
        if (menuItem.getKitchenType() != null) {
            existingItem.setKitchenType(menuItem.getKitchenType());
        }
        
        if (menuItem.getImageUrl() != null && !menuItem.getImageUrl().trim().isEmpty()) {
            existingItem.setImageUrl(menuItem.getImageUrl());
        }
        
        if (menuItem.getIsHidden() != null) {
            existingItem.setIsHidden(menuItem.getIsHidden());
        }
        
        return menuItemRepository.save(existingItem);
    }
    
    // Phương thức phụ trợ để tạo tên file từ tên món ăn
    private String generateFilenameFromName(String name) {
        return name.toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("[áàảãạâấầẩẫậăắằẳẵặ]", "a")
                .replaceAll("[éèẻẽẹêếềểễệ]", "e")
                .replaceAll("[íìỉĩị]", "i")
                .replaceAll("[óòỏõọôốồổỗộơớờởỡợ]", "o")
                .replaceAll("[úùủũụưứừửữự]", "u")
                .replaceAll("[ýỳỷỹỵ]", "y")
                .replaceAll(" ", "")
                .replaceAll("[^a-z0-9]", "");
    }
    
    @Override
    @Transactional
    public MenuItem toggleAvailability(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        menuItem.setIsAvailable(!menuItem.getIsAvailable());
        return menuItemRepository.save(menuItem);
    }
    
    @Override
    @Transactional
    public MenuItem toggleVisibility(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        menuItem.setIsHidden(!menuItem.getIsHidden());
        return menuItemRepository.save(menuItem);
    }
}