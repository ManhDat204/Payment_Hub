package com.company.payment_hub_be.dto;

import java.util.List;

public record GroupCategorySearchCriteria(
        String paramType,
        String paramValue,
        String paramName,
        List<Integer> statuses,
        List<Integer> activeStatuses,
        int page,
        int size
) {
    public GroupCategorySearchCriteria {
        statuses = statuses == null ? List.of() : List.copyOf(statuses);
        activeStatuses = activeStatuses == null ? List.of() : List.copyOf(activeStatuses);
        page = Math.max(page, 0);
        size = Math.max(1, Math.min(size, 200));
    }
}
