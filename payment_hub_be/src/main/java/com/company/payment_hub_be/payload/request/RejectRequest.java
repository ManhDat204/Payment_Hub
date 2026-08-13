package com.company.payment_hub_be.payload.request;

public record RejectRequest(
        String actor,
        String reason
) {
}
