package com.company.payment_hub_be.dto;

import com.company.payment_hub_be.payload.request.GroupCategoryUpsertRequest;

import java.time.LocalDateTime;
import java.util.List;

public record GroupCategoryDraftData(
        String action,
        String paramName,
        String paramValue,
        String paramType,
        String description,
        String componentCode,
        Integer isActive,
        LocalDateTime effectiveDate,
        LocalDateTime endEffectiveDate
) {
    public static final String ACTION_UPDATE = "UPDATE";
    public static final String ACTION_CANCEL_APPROVAL = "CANCEL_APPROVAL";

    public static GroupCategoryDraftData update(GroupCategoryUpsertRequest request) {
        return new GroupCategoryDraftData(
                ACTION_UPDATE,
                request.paramName(),
                request.paramValue(),
                request.paramType(),
                request.description(),
                request.componentCode(),
                request.isActive(),
                request.effectiveDate(),
                request.endEffectiveDate()
        );
    }

        public static GroupCategoryDraftData cancelApproval() {
        return new GroupCategoryDraftData(
                ACTION_CANCEL_APPROVAL,
                null,
                null,
                null,
                null,
                null,
                0,
                null,
                null
        );
    }
}
