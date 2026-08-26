package com.company.payment_hub_be.service;

import com.company.payment_hub_be.entity.PmhHistory;
import com.company.payment_hub_be.payload.response.HistoryLogResponse;
import com.company.payment_hub_be.payload.response.PageResponse;

import java.util.List;


public interface PmhHistoryService {
    List<PmhHistory> getAll();

    PageResponse<HistoryLogResponse> getGroupCategoryHistory(Long id, int page, int size);
}
