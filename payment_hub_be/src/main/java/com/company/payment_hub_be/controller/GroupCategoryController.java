package com.company.payment_hub_be.controller;

import com.company.payment_hub_be.payload.request.ActionRequest;
import com.company.payment_hub_be.payload.request.BatchActionRequest;
import com.company.payment_hub_be.payload.request.BatchRejectRequest;
import com.company.payment_hub_be.payload.response.ComponentResponse;
import com.company.payment_hub_be.payload.response.GroupCategoryResponse;
import com.company.payment_hub_be.dto.GroupCategorySearchCriteria;
import com.company.payment_hub_be.payload.request.GroupCategoryUpsertRequest;
import com.company.payment_hub_be.payload.response.PageResponse;
import com.company.payment_hub_be.payload.request.RejectRequest;
import com.company.payment_hub_be.exception.BusinessException;
import com.company.payment_hub_be.service.GroupCategoryApiService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;


public abstract class GroupCategoryController {
    private final GroupCategoryApiService service;

    protected GroupCategoryController(GroupCategoryApiService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<GroupCategoryResponse> search(
            @RequestParam(required = false) String paramType,
            @RequestParam(required = false) String paramValue,
            @RequestParam(required = false) String paramName,
            @RequestParam(required = false) List<Integer> statuses,
            @RequestParam(required = false) List<Integer> activeStatuses,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.search(criteria(paramType, paramValue, paramName, statuses, activeStatuses, page, size));
    }

    @GetMapping("/{id}")
    public GroupCategoryResponse detail(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ResponseEntity<GroupCategoryResponse> create(@RequestBody GroupCategoryUpsertRequest request) {
        return ResponseEntity.status(201).body(service.create(request, false));
    }

    @PostMapping("/save-and-submit")
    public ResponseEntity<GroupCategoryResponse> createAndSubmit(@RequestBody GroupCategoryUpsertRequest request) {
        return ResponseEntity.status(201).body(service.create(request, true));
    }

    @PutMapping("/{id}")
    public GroupCategoryResponse update(@PathVariable Long id, @RequestBody GroupCategoryUpsertRequest request) {
        return service.update(id, request);
    }

    @PostMapping("/{id}/submit")
    public GroupCategoryResponse submit(@PathVariable Long id, @RequestBody ActionRequest request) {
        return service.submit(id, request);
    }

    @PostMapping("/submit")
    public List<GroupCategoryResponse> submitBatch(@RequestBody BatchActionRequest request) {
        ensureBatchIds(request);
        return request.ids().stream()
                .map(id -> service.submit(id, new ActionRequest(request.actor())))
                .toList();
    }

    @PostMapping("/{id}/approve")
    public GroupCategoryResponse approve(@PathVariable Long id, @RequestBody ActionRequest request) {
        return service.approve(id, request);
    }

    @PostMapping("/approve")
    public List<GroupCategoryResponse> approveBatch(@RequestBody BatchActionRequest request) {
        ensureBatchIds(request);
        return request.ids().stream()
                .map(id -> service.approve(id, new ActionRequest(request.actor())))
                .toList();
    }

    @PostMapping("/{id}/reject")
    public GroupCategoryResponse reject(@PathVariable Long id, @RequestBody RejectRequest request) {
        return service.reject(id, request);
    }
    @PostMapping("/reject")
    public List<GroupCategoryResponse> rejectBatch(@RequestBody BatchRejectRequest request) {
        if (request == null || request.ids() == null || request.ids().isEmpty()) {
            throw BusinessException.badRequest("ids is required");
        }
        return request.ids().stream()
                .map(id -> service.reject(id, new RejectRequest(request.actor(), request.reason())))
                .toList();
    }

    @PostMapping("/{id}/cancel-approval")
    public GroupCategoryResponse requestCancelApproval(@PathVariable Long id, @RequestBody ActionRequest request) {
        return service.requestCancelApproval(id, request);
    }

    @PostMapping("/cancel-approval")
    public List<GroupCategoryResponse> requestCancelApprovalBatch(@RequestBody BatchActionRequest request) {
        ensureBatchIds(request);
        return request.ids().stream()
                .map(id -> service.requestCancelApproval(id, new ActionRequest(request.actor())))
                .toList();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/delete")
    public ResponseEntity<Void> deleteBatch(@RequestBody BatchActionRequest request) {
        ensureBatchIds(request);
        request.ids().forEach(service::delete);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/components/active")
    public List<ComponentResponse> activeComponents() {
        return service.getActiveComponents();
    }

    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) String paramType,
            @RequestParam(required = false) String paramValue,
            @RequestParam(required = false) String paramName,
            @RequestParam(required = false) List<Integer> statuses,
            @RequestParam(required = false) List<Integer> activeStatuses
    ) {
        byte[] file = service.exportCsv(criteria(paramType, paramValue, paramName, statuses, activeStatuses, 0, 200));
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename("pmh_group_category.csv")
                        .build()
                        .toString())
                .body(file);
    }

    private static GroupCategorySearchCriteria criteria(
            String paramType,
            String paramValue,
            String paramName,
            List<Integer> statuses,
            List<Integer> activeStatuses,
            int page,
            int size
    ) {
        return new GroupCategorySearchCriteria(paramType, paramValue, paramName, statuses, activeStatuses, page, size);
    }

    private static void ensureBatchIds(BatchActionRequest request) {
        if (request == null || request.ids() == null || request.ids().isEmpty()) {
            throw BusinessException.badRequest("ids is required");
        }
    }
}
