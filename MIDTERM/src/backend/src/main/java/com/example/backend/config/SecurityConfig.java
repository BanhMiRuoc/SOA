package com.example.backend.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;
import com.example.backend.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/images/**", "/uploads/**").permitAll()
                    // Public endpoints (không cần đăng nhập)
                    .requestMatchers(
                        "/api/auth/login", 
                        "/api/menu", 
                        "/api/menu/visible",
                        "/api/tables/number/**",
                        "/api/tables",
                        "/api/tables/{id}/open", 
                        "/api/categories",
                        "/api/orders/table/**",
                        "/api/orders/customer/**",
                        "/api/orders/items/{orderItemId}",
                        "/api/orderItems/{orderItemId}/status",
                        "/api/orders/{orderId}/cancel"
                    ).permitAll()
                    // Kitchen Staff endpoints
                    .requestMatchers("/api/orders/active", "/api/orders/{orderId}/status").hasAnyAuthority("KITCHEN_STAFF", "MANAGER", "CASHIER")
                    // Waiter và Manager endpoints
                    .requestMatchers("/api/tables/{id}/occupy",
                                     "/api/tables/{id}/close",
                                     "/api/orderItems/{orderItemId}/status").hasAnyAuthority("WAITER", "MANAGER", "CASHIER")
                    // Kitchen Staff, Waiter, Manager và Cashier endpoints (quản lý trạng thái món)
                    .requestMatchers("/api/menu/{id}/toggle-availability",
                                     "/api/menu/{id}/toggle-visibility").hasAnyAuthority("KITCHEN_STAFF", "WAITER", "MANAGER", "CASHIER")
                    // Manager endpoints
                    .requestMatchers("/api/payments/**", "/api/menu", "/api/menu/{id}").hasAnyAuthority("MANAGER", "CASHIER")
                    // All other endpoints require authentication
                    .requestMatchers("/api/**").authenticated()
                )
                .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Không dùng wildcard "*" khi allowCredentials là true
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://localhost:5174"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
