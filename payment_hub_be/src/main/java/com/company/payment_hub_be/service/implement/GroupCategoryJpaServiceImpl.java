package com.company.payment_hub_be.service.implement;

import com.company.payment_hub_be.domain.ActionType;
import com.company.payment_hub_be.domain.ActiveStatus;
import com.company.payment_hub_be.domain.DisplayFlag;
import com.company.payment_hub_be.domain.ParamStatus;
import com.company.payment_hub_be.entity.PmhHistory;
import com.company.payment_hub_be.mapper.GroupCategoryMapper;
import com.company.payment_hub_be.payload.request.ActionRequest;
import com.company.payment_hub_be.payload.response.ComponentResponse;
import com.company.payment_hub_be.dto.GroupCategoryDraftData;
import com.company.payment_hub_be.payload.response.GroupCategoryResponse;
import com.company.payment_hub_be.dto.GroupCategorySearchCriteria;
import com.company.payment_hub_be.payload.request.GroupCategoryRequest;
import com.company.payment_hub_be.payload.response.PageResponse;
import com.company.payment_hub_be.payload.request.RejectRequest;
import com.company.payment_hub_be.exception.BusinessException;
import com.company.payment_hub_be.entity.PmhComponents;
import com.company.payment_hub_be.entity.PmhGroupCategory;
import com.company.payment_hub_be.repository.ComponentRepository;
import com.company.payment_hub_be.repository.GroupCategoryRepository;
import com.company.payment_hub_be.repository.GroupCategorySpecifications;
import com.company.payment_hub_be.repository.PmhHistoryCategory;
import com.company.payment_hub_be.service.GroupCategoryApiService;
import com.company.payment_hub_be.service.GroupCategoryRules;
import com.company.payment_hub_be.util.SecurityUtil;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service("groupCategoryJpaService")
@Transactional
public class GroupCategoryJpaServiceImpl implements GroupCategoryApiService {
    private static final String HISTORY_OBJECT_TYPE = "PMH_GROUP_CATEGORY";

    private final GroupCategoryRepository groupCategoryRepository;
    private final ComponentRepository componentRepository;
    private final PmhHistoryCategory historyRepository;
    private final GroupCategoryMapper mapper;
    private final GroupCategoryRules rules;
    private final ObjectMapper objectMapper;

    
    public GroupCategoryJpaServiceImpl(
            GroupCategoryRepository groupCategoryRepository,
            ComponentRepository componentRepository,
            GroupCategoryMapper mapper,
            GroupCategoryRules rules,
            PmhHistoryCategory historyRepository,
            ObjectMapper objectMapper
    ) {
        this.groupCategoryRepository = groupCategoryRepository;
        this.componentRepository = componentRepository;
        this.mapper = mapper;
        this.rules = rules;
        this.historyRepository = historyRepository;
        this.objectMapper = objectMapper;
    }
    

    @Override
    @Transactional(readOnly = true)
    public PageResponse<GroupCategoryResponse> search(GroupCategorySearchCriteria criteria) {
        Page<PmhGroupCategory> page = groupCategoryRepository.findAll(
                GroupCategorySpecifications.byCriteria(criteria),
                PageRequest.of(criteria.page(), criteria.size())
        );
        return PageResponse.from(page.map(mapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public GroupCategoryResponse getById(Long id) {
        return mapper.toResponse(findById(id));
    }

    @Override
    public GroupCategoryResponse create(GroupCategoryRequest request, String actor, boolean submit) {
        Set<String> activeCodes = activeComponentCodes();
        System.out.println("DEBUG create request.componentCode = " + request.componentCode());
        System.out.println("DEBUG activeCodes = " + activeCodes);
        rules.validateUpsert(request, activeCodes);
        rules.ensureUnique(groupCategoryRepository.existsByParamTypeIgnoreCaseAndParamValueIgnoreCase(
                request.paramType().trim(),
                request.paramValue().trim()
        ));

        String validatedActor = rules.actor(actor);
        PmhGroupCategory entity = mapper.toNewEntity(request, validatedActor);
        rules.touchCreate(entity, validatedActor, submit);
        entity.setStatus(submit ? ParamStatus.PENDING : ParamStatus.NEW);
        entity.setIsDisplay(DisplayFlag.NOT_APPROVED_YET);

        PmhGroupCategory saved = groupCategoryRepository.save(entity);
        String savedData = historyPayload(saved);
        addHistory(saved, ActionType.CREATE, null, savedData, validatedActor, "Thêm mới " + historyName(saved));
        if (submit) {
            addHistory(saved, ActionType.SUBMIT, savedData, savedData, validatedActor, "Gửi duyệt " + historyName(saved));
        }
        return mapper.toResponse(saved);
    }

    @Override
    public GroupCategoryResponse update(Long id, GroupCategoryRequest request, String actor) {
        PmhGroupCategory entity = findById(id);
        String oldData = historyPayload(entity);
        Set<String> activeCodes = activeComponentCodes();
        System.out.println("DEBUG update request.componentCode = " + request.componentCode());
        System.out.println("DEBUG activeCodes = " + activeCodes);

        rules.validateUpsert(request, activeCodes);
        rules.ensureUnique(groupCategoryRepository.existsByParamTypeIgnoreCaseAndParamValueIgnoreCaseAndIdNot(
                request.paramType().trim(),
                request.paramValue().trim(),
                id
        ));

        String validatedActor = rules.actor(actor);
        if (entity.getIsDisplay() == DisplayFlag.WAS_APPROVED) {
            GroupCategoryDraftData draft = GroupCategoryDraftData.update(request);
            rules.validateDraftFits(draft);
            entity.setNewData(mapper.toDraftJson(draft));
        } else {
            mapper.applyRequest(entity, request);
            if (entity.getStatus() != ParamStatus.PENDING) {
                entity.setStatus(ParamStatus.NEW);
            }
            entity.setNewData(null);
        }
        entity.setRejectReason(null);
        rules.touchUpdate(entity, validatedActor);
        PmhGroupCategory saved = groupCategoryRepository.save(entity);
        addHistory(saved, ActionType.UPDATE, oldData, historyPayload(saved), validatedActor, "Sửa " + historyName(saved));
        return mapper.toResponse(saved);
    }

    @Override
    public GroupCategoryResponse submit(Long id, ActionRequest request) {
        PmhGroupCategory entity = findById(id);
        String actor = rules.actor(SecurityUtil.getCurrentUsername());
        String oldData = historyPayload(entity);
        System.out.println("📝 JPA submit() - actor from SecurityUtil: " + actor);
        rules.ensureCanSubmit(entity);
        entity.setStatus(ParamStatus.PENDING);
        entity.setRejectReason(null);
        rules.touchUpdate(entity, actor);
        PmhGroupCategory saved = groupCategoryRepository.save(entity);
        addHistory(saved, ActionType.SUBMIT, oldData, historyPayload(saved), actor, "Gửi duyệt " + historyName(saved));
        return mapper.toResponse(saved);
    }

    @Override
    public GroupCategoryResponse approve(Long id, ActionRequest request) {
        PmhGroupCategory entity = findById(id);
        String actor = rules.actor(SecurityUtil.getCurrentUsername());
        String oldData = historyPayload(entity);
        System.out.println("📝 JPA approve() - actor from SecurityUtil: " + actor);
        rules.ensureCanApprove(entity);

        GroupCategoryDraftData draft = mapper.readDraft(entity.getNewData());
        
        // Apply draft changes for update action
        if (draft != null && GroupCategoryDraftData.ACTION_UPDATE.equals(draft.action())) {
            rules.ensureUnique(groupCategoryRepository.existsByParamTypeIgnoreCaseAndParamValueIgnoreCaseAndIdNot(
                    draft.paramType().trim(),
                    draft.paramValue().trim(),
                    id
            ));
        }
        
        mapper.applyDraft(entity, draft);
        entity.setStatus(ParamStatus.APPROVED);
        entity.setIsDisplay(DisplayFlag.WAS_APPROVED);
        entity.setNewData(null);
        entity.setRejectReason(null);
        rules.touchApprove(entity, actor);
        PmhGroupCategory saved = groupCategoryRepository.save(entity);
        addHistory(saved, ActionType.APPROVE, oldData, historyPayload(saved), actor, "Phê duyệt " + historyName(saved));
        return mapper.toResponse(saved);
    }

    @Override
    public GroupCategoryResponse reject(Long id, RejectRequest request) {
        PmhGroupCategory entity = findById(id);
        String oldData = historyPayload(entity);
        rules.ensureCanReject(entity, request);
        String actor = rules.actor(SecurityUtil.getCurrentUsername());
        System.out.println("📝 JPA reject() - actor from SecurityUtil: " + actor);
        entity.setStatus(ParamStatus.REJECTED);
        entity.setRejectReason(request.reason().trim());
        entity.setNewData(null);
        rules.touchUpdate(entity, actor);
        PmhGroupCategory saved = groupCategoryRepository.save(entity);
        addHistory(
                saved,
                ActionType.REJECT,
                oldData,
                historyPayload(saved),
                actor,
                "Từ chối " + historyName(saved) + ". Lý do: " + request.reason().trim()
        );
        return mapper.toResponse(saved);
    }

    @Override
    public GroupCategoryResponse requestCancelApproval(Long id, ActionRequest request) {
        PmhGroupCategory entity = findById(id);
        String actor = rules.actor(SecurityUtil.getCurrentUsername());
        String oldData = historyPayload(entity);
        System.out.println("📝 JPA requestCancelApproval() - actor from SecurityUtil: " + actor);
        rules.ensureCanRequestCancelApproval(entity);
        
        // Chuyển trực tiếp từ STATUS 4 (Đã duyệt) → 7 (Hủy duyệt)
        entity.setStatus(ParamStatus.CANCELLED);
        entity.setIsActive(ActiveStatus.INACTIVE);
        entity.setNewData(null);
        entity.setRejectReason(null);
        rules.touchUpdate(entity, actor);
        PmhGroupCategory saved = groupCategoryRepository.save(entity);
        addHistory(saved, ActionType.CANCEL_APPROVE, oldData, historyPayload(saved), actor, "Hủy phê duyệt " + historyName(saved));
        return mapper.toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        PmhGroupCategory entity = findById(id);
        rules.ensureCanDelete(entity);
        String actor = rules.actor(SecurityUtil.getCurrentUsername());
        String oldData = historyPayload(entity);
        addHistory(entity, ActionType.DELETE, oldData, null, actor, "Xóa bản ghi " + historyName(entity));
        groupCategoryRepository.delete(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComponentResponse> getActiveComponents() {
        return componentRepository.findByIsActiveOrderByComponentCodeAsc(ActiveStatus.ACTIVE)
                .stream()
                .map(mapper::toComponentResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportCsv(GroupCategorySearchCriteria criteria) {
        List<GroupCategoryResponse> rows = groupCategoryRepository.findAll(GroupCategorySpecifications.byCriteria(criteria))
                .stream()
                .map(mapper::toResponse)
                .toList();
        return mapper.toCsv(rows);
    }

    private PmhGroupCategory findById(Long id) {
        return groupCategoryRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("PMH_GROUP_CATEGORY not found: " + id));
    }

    private void addHistory(
            PmhGroupCategory entity,
            ActionType actionType,
            String oldData,
            String newData,
            String actor,
            String description
    ) {
        PmhHistory history = new PmhHistory();
        history.setObjectId(entity.getId());
        history.setObjectType(HISTORY_OBJECT_TYPE);
        history.setActionType(actionType);
        history.setOldData(oldData);
        history.setNewData(newData);
        history.setActionBy(actor);
        history.setActionTime(LocalDateTime.now());
        history.setIp(clientIp());
        history.setDescription(description);
        historyRepository.save(history);
    }

    private String historyPayload(PmhGroupCategory entity) {
        try {
            LinkedHashMap<String, Object> data = new LinkedHashMap<>();
            data.put("id", entity.getId());
            data.put("paramName", entity.getParamName());
            data.put("paramValue", entity.getParamValue());
            data.put("paramType", entity.getParamType());
            data.put("description", entity.getDescription());
            data.put("componentCode", entity.getComponent() == null ? null : entity.getComponent().getComponentCode());
            data.put("status", entity.getStatus() == null ? null : entity.getStatus().getCode());
            data.put("isActive", entity.getIsActive() == null ? null : entity.getIsActive().getCode());
            data.put("isDisplay", entity.getIsDisplay() == null ? null : entity.getIsDisplay().getCode());
            data.put("newData", entity.getNewData());
            data.put("effectiveDate", entity.getEffectiveDate());
            data.put("endEffectiveDate", entity.getEndEffectiveDate());
            return objectMapper.writeValueAsString(data);
        } catch (Exception exception) {
            return null;
        }
    }

    private String historyName(PmhGroupCategory entity) {
        String paramType = hasText(entity.getParamType()) ? entity.getParamType() : HISTORY_OBJECT_TYPE;
        return paramType
                + " [id=" + entity.getId()
                + ", paramValue=" + nullToDash(entity.getParamValue())
                + ", paramName=" + nullToDash(entity.getParamName())
                + "]";
    }

    private String clientIp() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) {
            return "";
        }

        HttpServletRequest request = attributes.getRequest();
        String forwardedFor = firstForwardedIp(request.getHeader("X-Forwarded-For"));
        if (hasText(forwardedFor)) {
            return forwardedFor;
        }

        String realIp = request.getHeader("X-Real-IP");
        return hasText(realIp) ? realIp : request.getRemoteAddr();
    }

    private static String firstForwardedIp(String forwardedFor) {
        if (!hasText(forwardedFor)) {
            return "";
        }
        return forwardedFor.split(",")[0].trim();
    }

    private static String nullToDash(String value) {
        return hasText(value) ? value : "-";
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private Set<String> activeComponentCodes() {
        Set<String> result = componentRepository.findActiveComponents()
                .stream()
                .map(PmhComponents::getComponentCode)
                .map(code -> code.toUpperCase(Locale.ROOT))
                .collect(Collectors.toSet());
            System.out.println("DEBUG activeComponentCodes() result = " + result);
            return result;
    }
    
}
