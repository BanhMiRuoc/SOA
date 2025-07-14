package com.example.backend.service;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.LoginResponse;
import com.example.backend.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    Optional<LoginResponse> authenticate(LoginRequest request);
    User createUser(User user);
    List<User> getAllUsers();
    
    // Các phương thức mới
    List<User> getAllActiveUsers(); // Lấy tất cả người dùng đang hoạt động
    User getUserById(Long id); // Lấy thông tin người dùng theo id
    User updateUser(Long id, User user); // Cập nhật thông tin người dùng
    void deactivateUser(Long id); // Vô hiệu hóa tài khoản người dùng
    void activateUser(Long id); // Kích hoạt lại tài khoản người dùng
    List<User> getUsersByRole(String role); // Lấy danh sách người dùng theo vai trò
}