package com.company.payment_hub_be.payload.request;

import java.util.List;

public record BatchRejectRequest(
        List<Long> ids,
        String actor,
        String reason
) {
}
