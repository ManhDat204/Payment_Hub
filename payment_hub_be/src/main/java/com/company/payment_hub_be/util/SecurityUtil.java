package com.company.payment_hub_be.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

public class SecurityUtil {
    
    /**
     * Lấy username của user hiện tại từ SecurityContext
     * @return username hoặc "system" nếu không có authentication
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        System.out.println("🔍 SecurityUtil.getCurrentUsername() called");
        System.out.println("   Authentication: " + authentication);
        System.out.println("   Is authenticated: " + (authentication != null && authentication.isAuthenticated()));
        
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("   ❌ No valid authentication, returning 'system'");
            return "system";
        }
        
        Object principal = authentication.getPrincipal();
        System.out.println("   Principal type: " + (principal != null ? principal.getClass().getName() : "null"));
        System.out.println("   Principal value: " + principal);
        
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            System.out.println("   ✅ Returning username from UserDetails: " + username);
            return username;
        } else if (principal instanceof String) {
            System.out.println("   ✅ Returning username from String: " + principal);
            return (String) principal;
        }
        
        System.out.println("   ❌ Unknown principal type, returning 'system'");
        return "system";
    }
}
