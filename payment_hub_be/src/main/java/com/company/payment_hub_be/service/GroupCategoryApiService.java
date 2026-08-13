package com.company.payment_hub_be.service;

import com.company.payment_hub_be.payload.request.ActionRequest;
import com.company.payment_hub_be.payload.response.ComponentResponse;
import com.company.payment_hub_be.payload.response.GroupCategoryResponse;
import com.company.payment_hub_be.dto.GroupCategorySearchCriteria;
import com.company.payment_hub_be.payload.request.GroupCategoryUpsertRequest;
import com.company.payment_hub_be.payload.response.PageResponse;
import com.company.payment_hub_be.payload.request.RejectRequest;

import java.util.List;

public interface GroupCategoryApiService {
    PageResponse<GroupCategoryResponse> search(GroupCategorySearchCriteria criteria);

    GroupCategoryResponse getById(Long id);

    GroupCategoryResponse create(GroupCategoryUpsertRequest request, boolean submit);

    GroupCategoryResponse update(Long id, GroupCategoryUpsertRequest request);

    GroupCategoryResponse submit(Long id, ActionRequest request);

    GroupCategoryResponse approve(Long id, ActionRequest request);

    GroupCategoryResponse reject(Long id, RejectRequest request);

    GroupCategoryResponse requestCancelApproval(Long id, ActionRequest request);

    void delete(Long id);

    List<ComponentResponse> getActiveComponents();

    byte[] exportCsv(GroupCategorySearchCriteria criteria);
}
