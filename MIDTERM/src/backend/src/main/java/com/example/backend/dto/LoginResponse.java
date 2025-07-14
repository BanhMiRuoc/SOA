package com.example.backend.dto;

import com.example.backend.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private String token; // For JWT authentication
}