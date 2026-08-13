package com.company.payment_hub_be.service.implement;

import com.company.payment_hub_be.domain.ActiveStatus;
import com.company.payment_hub_be.domain.DisplayFlag;
import com.company.payment_hub_be.domain.ParamStatus;
import com.company.payment_hub_be.mapper.GroupCategoryMapper;
import com.company.payment_hub_be.payload.request.ActionRequest;
import com.company.payment_hub_be.payload.response.ComponentResponse;
import com.company.payment_hub_be.dto.GroupCategoryDraftData;
import com.company.payment_hub_be.payload.response.GroupCategoryResponse;
import com.company.payment_hub_be.dto.GroupCategorySearchCriteria;
import com.company.payment_hub_be.payload.request.GroupCategoryUpsertRequest;
import com.company.payment_hub_be.payload.response.PageResponse;
import com.company.payment_hub_be.payload.request.RejectRequest;
import com.company.payment_hub_be.exception.BusinessException;
import com.company.payment_hub_be.entity.PmhComponents;
import com.company.payment_hub_be.entity.PmhGroupCategory;
import com.company.payment_hub_be.repository.ComponentRepository;
import com.company.payment_hub_be.repository.GroupCategoryRepository;
import com.company.payment_hub_be.repository.GroupCategorySpecifications;
import com.company.payment_hub_be.service.GroupCategoryApiService;
import com.company.payment_hub_be.service.GroupCategoryRules;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service("groupCategoryJpaService")
@Transactional
public class GroupCategoryJpaService implements GroupCategoryApiService {
    private final GroupCategoryRepository groupCategoryRepository;
    private final ComponentRepository componentRepository;
    private final GroupCategoryMapper mapper;
    private final GroupCategoryRules rules;

    
    public GroupCategoryJpaService(
            GroupCategoryRepository groupCategoryRepository,
            ComponentRepository componentRepository,
            GroupCategoryMapper mapper,
            GroupCategoryRules rules
    ) {
        this.groupCategoryRepository = groupCategoryRepository;
        this.componentRepository = componentRepository;
        this.mapper = mapper;
        this.rules = rules;
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
    public GroupCategoryResponse create(GroupCategoryUpsertRequest request, boolean submit) {
        Set<String> activeCodes = activeComponentCodes();
        System.out.println("DEBUG create request.componentCode = " + request.componentCode());
        System.out.println("DEBUG activeCodes = " + activeCodes);
        rules.validateUpsert(request, activeCodes);
        rules.ensureUnique(groupCategoryRepository.existsByParamTypeIgnoreCaseAndParamValueIgnoreCase(
                request.paramType().trim(),
                request.paramValue().trim()
        ));

        String actor = rules.actor(request.actor());
        PmhGroupCategory entity = mapper.toNewEntity(request, actor);
        rules.touchCreate(entity, actor, submit);
        entity.setStatus(submit ? ParamStatus.PENDING : ParamStatus.NEW);
        entity.setIsDisplay(DisplayFlag.NOT_APPROVED_YET);

        return mapper.toResponse(groupCategoryRepository.save(entity));
    }

    @Override
    public GroupCategoryResponse update(Long id, GroupCategoryUpsertRequest request) {
        PmhGroupCategory entity = findById(id);
        Set<String> activeCodes = activeComponentCodes();
        System.out.println("DEBUG update request.componentCode = " + request.componentCode());
        System.out.println("DEBUG activeCodes = " + activeCodes);

        rules.validateUpsert(request, activeCodes);
        rules.ensureUnique(groupCategoryRepository.existsByParamTypeIgnoreCaseAndParamValueIgnoreCaseAndIdNot(
                request.paramType().trim(),
                request.paramValue().trim(),
                id
        ));

        String actor = rules.actor(request.actor());
        if (entity.getIsDisplay() == DisplayFlag.WAS_APPROVED) {
            GroupCategoryDraftData draft = GroupCategoryDraftData.update(request);
            rules.validateDraftFits(draft);
            entity.setNewData(mapper.toDraftJson(draft));
        } else {
            mapper.applyRequest(entity, request);
            entity.setStatus(ParamStatus.NEW);
            entity.setNewData(null);
        }
        entity.setRejectReason(null);
        rules.touchUpdate(entity, actor);
        return mapper.toResponse(groupCategoryRepository.save(entity));
    }

    @Override
    public GroupCategoryResponse submit(Long id, ActionRequest request) {
        PmhGroupCategory entity = findById(id);
        String actor = rules.actor(request == null ? null : request.actor());
        rules.ensureCanSubmit(entity);
        entity.setStatus(ParamStatus.PENDING);
        entity.setRejectReason(null);
        rules.touchUpdate(entity, actor);
        return mapper.toResponse(groupCategoryRepository.save(entity));
    }

    @Override
    public GroupCategoryResponse approve(Long id, ActionRequest request) {
        PmhGroupCategory entity = findById(id);
        String actor = rules.actor(request == null ? null : request.actor());
        rules.ensureCanApprove(entity);

        GroupCategoryDraftData draft = mapper.readDraft(entity.getNewData());
        if (draft != null && GroupCategoryDraftData.ACTION_CANCEL_APPROVAL.equals(draft.action())) {
            entity.setStatus(ParamStatus.CANCELLED);
            entity.setIsActive(ActiveStatus.INACTIVE);
        } else {
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
        }
        entity.setNewData(null);
        entity.setRejectReason(null);
        rules.touchApprove(entity, actor);
        return mapper.toResponse(groupCategoryRepository.save(entity));
    }

    @Override
    public GroupCategoryResponse reject(Long id, RejectRequest request) {
        PmhGroupCategory entity = findById(id);
        rules.ensureCanReject(entity, request);
        String actor = rules.actor(request.actor());
        entity.setStatus(ParamStatus.REJECTED);
        entity.setRejectReason(request.reason().trim());
        entity.setNewData(null);
        rules.touchUpdate(entity, actor);
        return mapper.toResponse(groupCategoryRepository.save(entity));
    }

    @Override
    public GroupCategoryResponse requestCancelApproval(Long id, ActionRequest request) {
        PmhGroupCategory entity = findById(id);
        String actor = rules.actor(request == null ? null : request.actor());
        rules.ensureCanRequestCancelApproval(entity);
        GroupCategoryDraftData draft = GroupCategoryDraftData.cancelApproval();
        rules.validateDraftFits(draft);
        entity.setNewData(mapper.toDraftJson(draft));
        entity.setStatus(ParamStatus.PENDING);
        entity.setRejectReason(null);
        rules.touchUpdate(entity, actor);
        return mapper.toResponse(groupCategoryRepository.save(entity));
    }

    @Override
    public void delete(Long id) {
        PmhGroupCategory entity = findById(id);
        rules.ensureCanDelete(entity);
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
