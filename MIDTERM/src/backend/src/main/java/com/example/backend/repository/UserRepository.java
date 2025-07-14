package com.example.backend.repository;

import com.example.backend.model.User;
import com.example.backend.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // Thêm các phương thức mới
    List<User> findByIsActiveTrue();
    List<User> findByRole(UserRole role);
}