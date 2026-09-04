package com.company.payment_hub_be.payload.response;

import java.time.LocalDateTime;

public record HistoryResponse(
        Long id,
        String userId,
        String userName,
        String action,
        LocalDateTime actionAt,
        String ip,
        String content
) {
}
