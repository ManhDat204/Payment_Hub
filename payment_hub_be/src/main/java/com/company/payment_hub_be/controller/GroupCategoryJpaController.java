package com.company.payment_hub_be.controller;

import com.company.payment_hub_be.payload.response.HistoryResponse;
import com.company.payment_hub_be.payload.response.PageResponse;
import com.company.payment_hub_be.service.GroupCategoryApiService;
import com.company.payment_hub_be.service.PmhHistoryService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/group-categories/jpa")
public class GroupCategoryJpaController extends GroupCategoryController {
    private final PmhHistoryService historyService;

    public GroupCategoryJpaController(
            @Qualifier("groupCategoryJpaService") GroupCategoryApiService service,
            PmhHistoryService historyService
    ) {
        super(service);
        this.historyService = historyService;
    }

    @GetMapping("/{id}/history")
    public PageResponse<HistoryResponse> history(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return historyService.getGroupCategoryHistory(id, page, size);
    }
}
