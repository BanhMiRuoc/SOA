package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final UserService userService;
    
    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('WAITER', 'MANAGER')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<User>> getAllActiveUsers() {
        log.info("Getting all active users");
        return ResponseEntity.ok(userService.getAllActiveUsers());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        log.info("Getting user with ID: " + id);
        return ResponseEntity.ok(userService.getUserById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        log.info("Creating new user: " + user.getEmail());
        return ResponseEntity.ok(userService.createUser(user));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        log.info("Updating user with ID: " + id);
        return ResponseEntity.ok(userService.updateUser(id, user));
    }
    
    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        log.info("Deactivating user with ID: " + id);
        userService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<Void> activateUser(@PathVariable Long id) {
        log.info("Activating user with ID: " + id);
        userService.activateUser(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/role/{role}")
    @PreAuthorize("hasAuthority('MANAGER')")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        log.info("Getting users with role: " + role);
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }
} 