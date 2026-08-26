package com.company.payment_hub_be.controller;


import com.company.payment_hub_be.entity.PmhHistory;
import com.company.payment_hub_be.service.PmhHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final PmhHistoryService historyService;

    @GetMapping
    public List<PmhHistory> getAll() {
        return historyService.getAll();
    }
}