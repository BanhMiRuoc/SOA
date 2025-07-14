package com.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.logging.Level;
import java.util.logging.Logger;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private static final Logger logger = Logger.getLogger(JwtAuthenticationFilter.class.getName());
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        logger.info("Processing request: " + method + " " + requestURI);
        
        final String authHeader = request.getHeader("Authorization");
        
        // Log khi không có Authorization header
        if (authHeader == null) {
            logger.info("No Authorization header for: " + requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        // Log khi header không đúng định dạng
        if (!authHeader.startsWith("Bearer ")) {
            logger.info("Invalid Authorization header format for: " + requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        final String jwt = authHeader.substring(7);
        
        try {
            final String email = jwtUtil.extractEmail(jwt);
            logger.info("Processing JWT for user: " + email + " at: " + requestURI);
            
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (!jwtUtil.isTokenExpired(jwt)) {
                    // Trích xuất role từ token
                    String role = jwtUtil.extractClaim(jwt, claims -> claims.get("role", String.class));
                    logger.info("User " + email + " has role: " + role);
                    
                    // Tạo authentication với role
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        email, 
                        null, 
                        Collections.singletonList(new SimpleGrantedAuthority(role))
                    );
                    
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    logger.info("Authentication successful for " + email + " with role " + role);
                } else {
                    logger.warning("Token expired for user: " + email);
                }
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error processing JWT: " + e.getMessage(), e);
        }
        
        filterChain.doFilter(request, response);
    }
}