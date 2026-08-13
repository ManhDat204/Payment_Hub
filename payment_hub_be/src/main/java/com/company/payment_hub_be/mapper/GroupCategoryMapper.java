package com.company.payment_hub_be.mapper;

import com.company.payment_hub_be.domain.ActiveStatus;
import com.company.payment_hub_be.domain.DisplayFlag;
import com.company.payment_hub_be.domain.ParamStatus;
import com.company.payment_hub_be.payload.response.ComponentResponse;
import com.company.payment_hub_be.dto.GroupCategoryDraftData;
import com.company.payment_hub_be.payload.response.GroupCategoryResponse;
import com.company.payment_hub_be.repository.ComponentRepository;
import com.company.payment_hub_be.payload.request.GroupCategoryUpsertRequest;
import com.company.payment_hub_be.exception.BusinessException;
import com.company.payment_hub_be.entity.PmhComponents;
import com.company.payment_hub_be.entity.PmhGroupCategory;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Component
public class GroupCategoryMapper {
    private static final DateTimeFormatter CSV_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private final ObjectMapper objectMapper;
    private final ComponentRepository componentRepository;

    public GroupCategoryMapper(ObjectMapper objectMapper, ComponentRepository componentRepository) {
    this.objectMapper = objectMapper;
    this.componentRepository = componentRepository;
    }

    private PmhComponents resolveComponent(String componentCode) {
    String normalized = normalizeComponentCode(componentCode);
    if (!hasText(normalized)) {
        throw BusinessException.badRequest("COMPONENT_CODE is required");
    }
    return componentRepository.findByComponentCodeIgnoreCase(normalized)
            .orElseThrow(() -> BusinessException.badRequest(
                    "COMPONENT_CODE is not active or does not exist: " + normalized
            ));
}

    public GroupCategoryResponse toResponse(PmhGroupCategory entity) {
        return new GroupCategoryResponse(
                entity.getId(),
                entity.getParamName(),
                entity.getParamValue(),
                entity.getParamType(),
                entity.getDescription(),
                entity.getComponent() == null ? null : entity.getComponent().getComponentCode(),
                code(entity.getStatus()),
                label(entity.getStatus()),
                code(entity.getIsActive()),
                label(entity.getIsActive()),
                code(entity.getIsDisplay()),
                label(entity.getIsDisplay()),
                readDraftOrNull(entity.getNewData()),
                entity.getEffectiveDate(),
                entity.getEndEffectiveDate(),
                entity.getCreatedBy(),
                entity.getCreatedDate(),
                entity.getUpdatedBy(),
                entity.getUpdatedDate(),
                entity.getApprovedBy(),
                entity.getApprovedDate(),
                entity.getRejectReason()
        );
    }

    public ComponentResponse toComponentResponse(PmhComponents component) {
        return new ComponentResponse(
                component.getId(),
                component.getComponentCode(),
                component.getComponentName(),
                component.getDescription(),
                code(component.getIsActive()),
                label(component.getIsActive())
        );
    }

    public PmhGroupCategory toNewEntity(GroupCategoryUpsertRequest request, String actor) {
    PmhGroupCategory entity = new PmhGroupCategory();
    entity.setParamName(request.paramName().trim());
    entity.setParamValue(request.paramValue().trim());
    entity.setParamType(request.paramType().trim());
    entity.setDescription(request.description());
    entity.setEffectiveDate(request.effectiveDate());
    entity.setEndEffectiveDate(request.endEffectiveDate());
    entity.setIsActive(request.isActive() == null ? ActiveStatus.ACTIVE : ActiveStatus.fromCode(request.isActive()));
    entity.setComponent(resolveComponent(request.componentCode())); 
    entity.setCreatedBy(actor);
    entity.setUpdatedBy(actor);
    return entity;
}

    public void applyRequest(PmhGroupCategory entity, GroupCategoryUpsertRequest request) {
    entity.setParamName(request.paramName().trim());
    entity.setParamValue(request.paramValue().trim());
    entity.setParamType(request.paramType().trim());
    entity.setDescription(request.description());
    entity.setEffectiveDate(request.effectiveDate());
    entity.setEndEffectiveDate(request.endEffectiveDate());
    entity.setIsActive(request.isActive() == null ? ActiveStatus.ACTIVE : ActiveStatus.fromCode(request.isActive()));
    entity.setComponent(resolveComponent(request.componentCode()));
}

    public void applyDraft(PmhGroupCategory entity, GroupCategoryDraftData draft) {
        if (draft == null || GroupCategoryDraftData.ACTION_CANCEL_APPROVAL.equals(draft.action())) {
            return;
        }

        entity.setParamName(trim(draft.paramName()));
        entity.setParamValue(trim(draft.paramValue()));
        entity.setParamType(trim(draft.paramType()));
        entity.setDescription(trim(draft.description()));
        entity.setComponent(resolveComponent(draft.componentCode()));
        entity.setIsActive(ActiveStatus.fromCode(
                draft.isActive() == null ? ActiveStatus.ACTIVE.getCode() : draft.isActive()
        ));
        entity.setEffectiveDate(draft.effectiveDate());
        entity.setEndEffectiveDate(draft.endEffectiveDate());
    }

    public String toDraftJson(GroupCategoryDraftData draft) {
        try {
            return objectMapper.writeValueAsString(draft);
        } catch (Exception exception) {
            throw BusinessException.badRequest("Cannot serialize NEW_DATA");
        }
    }

    public GroupCategoryDraftData readDraft(String json) {
        if (!hasText(json)) {
            return null;
        }
        try {
            return objectMapper.readValue(json, GroupCategoryDraftData.class);
        } catch (Exception exception) {
            throw BusinessException.badRequest("Invalid NEW_DATA format");
        }
    }

    public GroupCategoryDraftData readDraftOrNull(String json) {
        if (!hasText(json)) {
            return null;
        }
        try {
            return objectMapper.readValue(json, GroupCategoryDraftData.class);
        } catch (Exception exception) {
            return null;
        }
    }

    public String normalizeComponentCode(String componentCode) {
        if (!hasText(componentCode)) {
            return null;
        }
        return componentCode.trim().toUpperCase(Locale.ROOT);
    }




    public byte[] toCsv(List<GroupCategoryResponse> rows) {
        StringBuilder builder = new StringBuilder();
        builder.append("STT,PARAM_TYPE,PARAM_VALUE,PARAM_NAME,DESCRIPTION,COMPONENT_CODE,EFFECTIVE_DATE,END_EFFECTIVE_DATE,STATUS,IS_ACTIVE\n");
        for (int i = 0; i < rows.size(); i++) {
            GroupCategoryResponse row = rows.get(i);
            builder.append(i + 1).append(',')
                    .append(csv(row.paramType())).append(',')
                    .append(csv(row.paramValue())).append(',')
                    .append(csv(row.paramName())).append(',')
                    .append(csv(row.description())).append(',')
                    .append(csv(row.componentCode())).append(',')
                    .append(csv(row.effectiveDate() == null ? null : CSV_DATE_FORMAT.format(row.effectiveDate()))).append(',')
                    .append(csv(row.endEffectiveDate() == null ? null : CSV_DATE_FORMAT.format(row.endEffectiveDate()))).append(',')
                    .append(csv(row.statusName())).append(',')
                    .append(csv(row.activeName())).append('\n');
        }
        return builder.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String csv(String value) {
        if (value == null) {
            return "";
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private static Integer code(ParamStatus status) {
        return status == null ? null : status.getCode();
    }

    private static String label(ParamStatus status) {
        return status == null ? null : status.getDescription();
    }

    private static Integer code(ActiveStatus status) {
        return status == null ? null : status.getCode();
    }

    private static String label(ActiveStatus status) {
        return status == null ? null : status.getDescription();
    }

    private static Integer code(DisplayFlag flag) {
        return flag == null ? null : flag.getCode();
    }

    private static String label(DisplayFlag flag) {
        return flag == null ? null : flag.getDescription();
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
