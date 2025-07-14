package com.example.backend.service.impl;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.LoginResponse;
import com.example.backend.exception.Exceptions;
import com.example.backend.model.User;
import com.example.backend.model.enums.UserRole;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Override
    public Optional<LoginResponse> authenticate(LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .filter(user -> passwordEncoder.matches(request.getPassword(), user.getPassword()))
                .map(user -> {
                    String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
                    return new LoginResponse(
                            user.getId(),
                            user.getEmail(),
                            user.getName(),
                            user.getRole(),
                            token
                    );
                });
    }
    
    @Override
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw Exceptions.emailAlreadyExists();
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Thiết lập giá trị mặc định cho isActive
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }
        
        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    // Triển khai các phương thức mới
    
    @Override
    public List<User> getAllActiveUsers() {
        return userRepository.findByIsActiveTrue();
    }
    
    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
    }
    
    @Override
    @Transactional
    public User updateUser(Long id, User userData) {
        User existingUser = getUserById(id);
        
        // Cập nhật thông tin cơ bản
        existingUser.setName(userData.getName());
        existingUser.setRole(userData.getRole());
        
        // Nếu có thay đổi email, kiểm tra email mới đã tồn tại chưa
        if (!existingUser.getEmail().equals(userData.getEmail())) {
            if (userRepository.existsByEmail(userData.getEmail())) {
                throw new RuntimeException("Email đã được sử dụng bởi tài khoản khác");
            }
            existingUser.setEmail(userData.getEmail());
        }
        
        // Nếu có thay đổi mật khẩu, mã hóa mật khẩu mới
        if (userData.getPassword() != null && !userData.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userData.getPassword()));
        }
        
        return userRepository.save(existingUser);
    }
    
    @Override
    @Transactional
    public void deactivateUser(Long id) {
        User user = getUserById(id);
        user.setIsActive(false);
        userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void activateUser(Long id) {
        User user = getUserById(id);
        user.setIsActive(true);
        userRepository.save(user);
    }
    
    @Override
    public List<User> getUsersByRole(String roleStr) {
        try {
            // Chuyển đổi String thành Enum UserRole
            UserRole role = UserRole.valueOf(roleStr.toUpperCase());
            return userRepository.findByRole(role);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Vai trò không hợp lệ: " + roleStr);
        }
    }
} 