package com.company.payment_hub_be.payload.response;

import com.company.payment_hub_be.dto.GroupCategoryDraftData;

import java.time.LocalDateTime;
import java.util.List;

public record GroupCategoryResponse(
        Long id,
        String paramName,
        String paramValue,
        String paramType,
        String description,
        String componentCode,
        Integer status,
        String statusName,
        Integer isActive,
        String activeName,
        Integer isDisplay,
        String displayName,
        GroupCategoryDraftData newData,
        LocalDateTime effectiveDate,
        LocalDateTime endEffectiveDate,
        String createdBy,
        LocalDateTime createdDate,
        String updatedBy,
        LocalDateTime updatedDate,
        String approvedBy,
        LocalDateTime approvedDate,
        String rejectReason
) {
}
