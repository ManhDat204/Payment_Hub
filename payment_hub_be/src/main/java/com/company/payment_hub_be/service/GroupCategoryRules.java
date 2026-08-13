package com.company.payment_hub_be.service;

import com.company.payment_hub_be.domain.DisplayFlag;
import com.company.payment_hub_be.domain.ParamStatus;
import com.company.payment_hub_be.payload.request.BatchActionRequest;
import com.company.payment_hub_be.payload.request.BatchRejectRequest;
import com.company.payment_hub_be.dto.GroupCategoryDraftData;
import com.company.payment_hub_be.payload.request.GroupCategoryUpsertRequest;
import com.company.payment_hub_be.payload.request.RejectRequest;
import com.company.payment_hub_be.mapper.GroupCategoryMapper;
import com.company.payment_hub_be.exception.BusinessException;
import com.company.payment_hub_be.entity.PmhGroupCategory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Set;

@Component
public class GroupCategoryRules {
    private static final int TEXT_255 = 255;
    private static final int NEW_DATA_MAX = 4000;
    private static final int REJECT_REASON_MAX = 500;

    private final GroupCategoryMapper mapper;

    public GroupCategoryRules(GroupCategoryMapper mapper) {
        this.mapper = mapper;
    }

    public void validateUpsert(GroupCategoryUpsertRequest request, Set<String> activeComponentCodes) {
    if (request == null) {
        throw BusinessException.badRequest("Request body is required");
    }
    requireText(request.paramName(), "PARAM_NAME");
    requireText(request.paramValue(), "PARAM_VALUE");
    requireText(request.paramType(), "PARAM_TYPE");
    requireText(request.actor(), "actor");
    requireLength(request.paramName(), "PARAM_NAME", TEXT_255);
    requireLength(request.paramValue(), "PARAM_VALUE", TEXT_255);
    requireLength(request.paramType(), "PARAM_TYPE", TEXT_255);
    requireLength(request.description(), "DESCRIPTION", TEXT_255);

    if (request.effectiveDate() == null) {
        throw BusinessException.badRequest("EFFECTIVE_DATE is required");
    }
    if (request.endEffectiveDate() != null && request.endEffectiveDate().isBefore(request.effectiveDate())) {
        throw BusinessException.badRequest("END_EFFECTIVE_DATE must be greater than or equal to EFFECTIVE_DATE");
    }

    try {
        com.company.payment_hub_be.domain.ActiveStatus.fromCode(
            request.isActive() == null ? 1 : request.isActive()
        );
    } catch (IllegalArgumentException exception) {
        throw BusinessException.badRequest(exception.getMessage());
    }

    validateComponentCode(request.componentCode(), activeComponentCodes);
}

public void validateComponentCode(String componentCode, Set<String> activeComponentCodes) {
    String normalized = mapper.normalizeComponentCode(componentCode);
    // debug validation 
    System.out.println("DEBUG normalized componentCode = " + normalized);
    System.out.println("DEBUG activeComponentCodes contains? = " + activeComponentCodes.contains(normalized));
    System.out.println("DEBUG activeComponentCodes = " + activeComponentCodes);


    if (!hasText(normalized)) {
        throw BusinessException.badRequest("COMPONENT_CODE is required");
    }
    if (!activeComponentCodes.contains(normalized)) {
        throw BusinessException.badRequest("COMPONENT_CODE is not active or does not exist: " + normalized);
    }
}
    public void ensureUnique(boolean exists) {
        if (exists) {
            throw BusinessException.conflict("PARAM_TYPE and PARAM_VALUE already exist");
        }
    }

    public void ensureCanSubmit(PmhGroupCategory entity) {
        if (entity.getStatus() == ParamStatus.PENDING) {
            throw BusinessException.conflict("Parameter is already pending approval");
        }
        if (entity.getIsDisplay() == DisplayFlag.WAS_APPROVED && !hasText(entity.getNewData())) {
            throw BusinessException.badRequest("Approved parameter must have NEW_DATA before submit");
        }
    }

    public void ensureCanApprove(PmhGroupCategory entity) {
        if (entity.getStatus() != ParamStatus.PENDING) {
            throw BusinessException.badRequest("Only pending parameter can be approved");
        }
    }

    public void ensureCanReject(PmhGroupCategory entity, RejectRequest request) {
        ensureCanApprove(entity);
        requireText(request == null ? null : request.actor(), "actor");
        requireText(request == null ? null : request.reason(), "reason");
        requireLength(request.reason(), "REJECT_REASON", REJECT_REASON_MAX);
    }

    public void ensureCanDelete(PmhGroupCategory entity) {
        if (entity.getIsDisplay() != DisplayFlag.NOT_APPROVED_YET) {
            throw BusinessException.badRequest("Only IS_DISPLAY = 1 can be deleted");
        }
    }

    public void ensureCanRequestCancelApproval(PmhGroupCategory entity) {
        if (entity.getStatus() != ParamStatus.APPROVED || entity.getIsDisplay() != DisplayFlag.WAS_APPROVED) {
            throw BusinessException.badRequest("Only approved parameter can request cancel approval");
        }
    }

    public void validateActionActor(String actor) {
        requireText(actor, "actor");
        requireLength(actor, "actor", 50);
    }

    public void validateBatch(BatchActionRequest request) {
        if (request == null || request.ids() == null || request.ids().isEmpty()) {
            throw BusinessException.badRequest("ids is required");
        }
        validateActionActor(request.actor());
    }

    public void validateBatchReject(BatchRejectRequest request) {
        if (request == null || request.ids() == null || request.ids().isEmpty()) {
            throw BusinessException.badRequest("ids is required");
        }
        validateActionActor(request.actor());
        requireText(request.reason(), "reason");
        requireLength(request.reason(), "REJECT_REASON", REJECT_REASON_MAX);
    }

    public void validateDraftFits(GroupCategoryDraftData draft) {
        String json = mapper.toDraftJson(draft);
        requireLength(json, "NEW_DATA", NEW_DATA_MAX);
    }

    public String actor(String actor) {
        requireText(actor, "actor");
        requireLength(actor, "actor", 50);
        return actor.trim();
    }

    public void touchCreate(PmhGroupCategory entity, String actor, boolean submit) {
        LocalDateTime now = LocalDateTime.now();
        entity.setCreatedBy(actor);
        entity.setCreatedDate(now);
        entity.setUpdatedBy(actor);
        entity.setUpdatedDate(now);
        entity.setStatus(submit ? ParamStatus.PENDING : ParamStatus.NEW);
    }

    public void touchUpdate(PmhGroupCategory entity, String actor) {
        entity.setUpdatedBy(actor);
        entity.setUpdatedDate(LocalDateTime.now());
    }

    public void touchApprove(PmhGroupCategory entity, String actor) {
        entity.setApprovedBy(actor);
        entity.setApprovedDate(LocalDateTime.now());
        touchUpdate(entity, actor);
    }

    private static void requireText(String value, String field) {
        if (!hasText(value)) {
            throw BusinessException.badRequest(field + " is required");
        }
    }

    private static void requireLength(String value, String field, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw BusinessException.badRequest(field + " length must be <= " + maxLength);
        }
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
