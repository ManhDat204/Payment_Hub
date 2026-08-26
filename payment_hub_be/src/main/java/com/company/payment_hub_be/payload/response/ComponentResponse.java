package com.company.payment_hub_be.payload.response;

public record ComponentResponse(
        Long id,
        String componentCode,
        String componentName,
        String description,
        Integer isActive,
        String activeName
) {
}
