package com.company.payment_hub_be.payload.request;

import java.util.List;

public record BatchActionRequest(
        List<Long> ids,
        String actor
) {
}
