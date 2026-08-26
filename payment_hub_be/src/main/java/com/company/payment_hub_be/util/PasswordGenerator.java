package com.company.payment_hub_be.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Generate password hash
        String password = "password123";
        String hash = encoder.encode(password);
        
        System.out.println("Plain text: " + password);
        System.out.println("BCrypt hash: " + hash);
        System.out.println("\nSử dụng hash này cho INSERT INTO USERS...");
    }
}
