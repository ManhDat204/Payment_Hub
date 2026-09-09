package com.company.payment_hub_be.payload.request;

import java.time.LocalDateTime;

public record GroupCategoryRequest(
        String paramName,
        String paramValue,
        String paramType,
        String description,
        String componentCode,
        Integer isActive,
        LocalDateTime effectiveDate,
        LocalDateTime endEffectiveDate
) {
}
