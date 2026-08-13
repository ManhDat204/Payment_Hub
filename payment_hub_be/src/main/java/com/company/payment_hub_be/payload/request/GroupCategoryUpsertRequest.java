package com.company.payment_hub_be.payload.request;

import java.time.LocalDateTime;
import java.util.List;

public record GroupCategoryUpsertRequest(
        String paramName,
        String paramValue,
        String paramType,
        String description,
        String componentCode,
        Integer isActive,
        LocalDateTime effectiveDate,
        LocalDateTime endEffectiveDate,
        String actor
) {
}
