package com.example.backend.service;

import com.example.backend.model.MenuItem;

import java.util.List;
import java.util.Set;

public interface MenuService {
    List<MenuItem> getAllMenuItems();
    List<MenuItem> getVisibleMenuItems();
    Set<String> getAllCategories();
    MenuItem addMenuItem(MenuItem menuItem);
    MenuItem updateMenuItem(Long id, MenuItem menuItem);
    MenuItem toggleAvailability(Long id);
    MenuItem toggleVisibility(Long id);
}