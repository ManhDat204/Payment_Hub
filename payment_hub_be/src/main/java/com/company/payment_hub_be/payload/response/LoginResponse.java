package com.company.payment_hub_be.payload.response;

import com.company.payment_hub_be.domain.UserRole;

public record LoginResponse(
        String token,
        String username,
        String fullName,
        UserRole role
) {
}
