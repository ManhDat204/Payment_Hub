package com.company.payment_hub_be.payload.request;

public record LoginRequest(
        String username,
        String password
) {
}
