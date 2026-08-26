package com.company.payment_hub_be.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException e) {
        System.out.println("AuthenticationException caught: " + e.getMessage());
        e.printStackTrace();
        
        Map<String, Object> error = new HashMap<>();
        error.put("error", "Authentication failed");
        error.put("message", e.getMessage());
        error.put("status", 401);
        return ResponseEntity.status(401).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException e) {
        System.out.println("AccessDeniedException caught: " + e.getMessage());
        e.printStackTrace();
        
        Map<String, Object> error = new HashMap<>();
        error.put("error", "Access denied");
        error.put("message", e.getMessage());
        error.put("status", 403);
        return ResponseEntity.status(403).body(error);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessException(BusinessException e) {
        System.out.println("BusinessException caught: " + e.getMessage());
        e.printStackTrace();
        
        Map<String, Object> error = new HashMap<>();
        error.put("error", "Business error");
        error.put("message", e.getMessage());
        error.put("status", 400);
        return ResponseEntity.status(400).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception e) {
        System.out.println("Exception caught: " + e.getClass().getName() + " - " + e.getMessage());
        e.printStackTrace();
        
        Map<String, Object> error = new HashMap<>();
        error.put("error", "Internal server error");
        error.put("message", e.getMessage());
        error.put("exception", e.getClass().getName());
        error.put("status", 500);
        return ResponseEntity.status(500).body(error);
    }
}
