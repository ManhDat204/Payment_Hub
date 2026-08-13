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
import com.company.payment_hub_be.service.GroupCategoryApiService;
import com.company.payment_hub_be.service.GroupCategoryRules;
import com.company.payment_hub_be.payload.request.RejectRequest;
import com.company.payment_hub_be.exception.BusinessException;
import com.company.payment_hub_be.entity.PmhComponents;
import com.company.payment_hub_be.entity.PmhGroupCategory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service("groupCategoryNativeService")
@Transactional
public class GroupCategoryNativeService implements GroupCategoryApiService {
    @PersistenceContext
    private EntityManager entityManager;

    private final GroupCategoryMapper mapper;
    private final GroupCategoryRules rules;

    public GroupCategoryNativeService(GroupCategoryMapper mapper, GroupCategoryRules rules) {
        this.mapper = mapper;
        this.rules = rules;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<GroupCategoryResponse> search(GroupCategorySearchCriteria criteria) {
        SqlAndParams sqlAndParams = buildSearchWhere(criteria);
        long total = count(sqlAndParams.sql(), sqlAndParams.params());
        Query query = entityManager.createNativeQuery(
                "SELECT * FROM PMH_GROUP_CATEGORY " + sqlAndParams.sql()
                        + " ORDER BY NVL(UPDATED_DATE, CREATED_DATE) DESC, ID DESC"
                        + " OFFSET :offset ROWS FETCH NEXT :size ROWS ONLY",
                PmhGroupCategory.class
        );
        setParameters(query, sqlAndParams.params());
        query.setParameter("offset", criteria.page() * criteria.size());
        query.setParameter("size", criteria.size());

        List<GroupCategoryResponse> rows = resultList(query).stream()
                .map(PmhGroupCategory.class::cast)
                .map(mapper::toResponse)
                .toList();
        return PageResponse.of(rows, total, criteria.page(), criteria.size());
    }

    @Override
    @Transactional(readOnly = true)
    public GroupCategoryResponse getById(Long id) {
        return mapper.toResponse(findById(id));
    }

    @Override
    public GroupCategoryResponse create(GroupCategoryUpsertRequest request, boolean submit) {
        Set<String> activeCodes = activeComponentCodes();
        rules.validateUpsert(request, activeCodes);
        rules.ensureUnique(existsByBusinessKey(request.paramType(), request.paramValue(), null));

        String actor = rules.actor(request.actor());
        PmhGroupCategory entity = mapper.toNewEntity(request, actor);
        rules.touchCreate(entity, actor, submit);
        entity.setStatus(submit ? ParamStatus.PENDING : ParamStatus.NEW);
        entity.setIsDisplay(DisplayFlag.NOT_APPROVED_YET);

        insert(entity);
        return mapper.toResponse(findByBusinessKey(entity.getParamType(), entity.getParamValue()));
    }

    @Override
    public GroupCategoryResponse update(Long id, GroupCategoryUpsertRequest request) {
        PmhGroupCategory entity = findById(id);
        Set<String> activeCodes = activeComponentCodes();
        rules.validateUpsert(request, activeCodes);
        rules.ensureUnique(existsByBusinessKey(request.paramType(), request.paramValue(), id));

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
        updateAllColumns(entity);
        return mapper.toResponse(findById(id));
    }

    @Override
    public GroupCategoryResponse submit(Long id, ActionRequest request) {
        PmhGroupCategory entity = findById(id);
        String actor = rules.actor(request == null ? null : request.actor());
        rules.ensureCanSubmit(entity);
        entity.setStatus(ParamStatus.PENDING);
        entity.setRejectReason(null);
        rules.touchUpdate(entity, actor);
        updateAllColumns(entity);
        return mapper.toResponse(findById(id));
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
                rules.ensureUnique(existsByBusinessKey(draft.paramType(), draft.paramValue(), id));
            }
            mapper.applyDraft(entity, draft);
            entity.setStatus(ParamStatus.APPROVED);
            entity.setIsDisplay(DisplayFlag.WAS_APPROVED);
        }
        entity.setNewData(null);
        entity.setRejectReason(null);
        rules.touchApprove(entity, actor);
        updateAllColumns(entity);
        return mapper.toResponse(findById(id));
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
        updateAllColumns(entity);
        return mapper.toResponse(findById(id));
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
        updateAllColumns(entity);
        return mapper.toResponse(findById(id));
    }

    @Override
    public void delete(Long id) {
        PmhGroupCategory entity = findById(id);
        rules.ensureCanDelete(entity);
        Query query = entityManager.createNativeQuery("DELETE FROM PMH_GROUP_CATEGORY WHERE ID = :id");
        query.setParameter("id", id);
        query.executeUpdate();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComponentResponse> getActiveComponents() {
        Query query = entityManager.createNativeQuery(
                "SELECT * FROM PMH_COMPONENTS WHERE IS_ACTIVE = :active ORDER BY COMPONENT_CODE ASC",
                PmhComponents.class
        );
        query.setParameter("active", ActiveStatus.ACTIVE.getCode());
        return resultList(query).stream()
                .map(PmhComponents.class::cast)
                .map(mapper::toComponentResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportCsv(GroupCategorySearchCriteria criteria) {
        SqlAndParams sqlAndParams = buildSearchWhere(criteria);
        Query query = entityManager.createNativeQuery(
                "SELECT * FROM PMH_GROUP_CATEGORY " + sqlAndParams.sql()
                        + " ORDER BY NVL(UPDATED_DATE, CREATED_DATE) DESC, ID DESC",
                PmhGroupCategory.class
        );
        setParameters(query, sqlAndParams.params());
        List<GroupCategoryResponse> rows = resultList(query).stream()
                .map(PmhGroupCategory.class::cast)
                .map(mapper::toResponse)
                .toList();
        return mapper.toCsv(rows);
    }

    private PmhGroupCategory findById(Long id) {
        try {
            Query query = entityManager.createNativeQuery(
                    "SELECT * FROM PMH_GROUP_CATEGORY WHERE ID = :id",
                    PmhGroupCategory.class
            );
            query.setParameter("id", id);
            return (PmhGroupCategory) query.getSingleResult();
        } catch (NoResultException exception) {
            throw BusinessException.notFound("PMH_GROUP_CATEGORY not found: " + id);
        }
    }

    private PmhGroupCategory findByBusinessKey(String paramType, String paramValue) {
        Query query = entityManager.createNativeQuery(
                "SELECT * FROM PMH_GROUP_CATEGORY "
                        + "WHERE LOWER(PARAM_TYPE) = LOWER(:paramType) AND LOWER(PARAM_VALUE) = LOWER(:paramValue) "
                        + "ORDER BY ID DESC FETCH FIRST 1 ROW ONLY",
                PmhGroupCategory.class
        );
        query.setParameter("paramType", paramType);
        query.setParameter("paramValue", paramValue);
        return (PmhGroupCategory) query.getSingleResult();
    }

    private void insert(PmhGroupCategory entity) {
        Query query = entityManager.createNativeQuery("""
                INSERT INTO PMH_GROUP_CATEGORY (
                    PARAM_NAME, PARAM_VALUE, PARAM_TYPE, DESCRIPTION, COMPONENT_CODE,
                    STATUS, IS_ACTIVE, IS_DISPLAY, NEW_DATA,
                    EFFECTIVE_DATE, END_EFFECTIVE_DATE,
                    CREATED_BY, CREATED_DATE, UPDATED_BY, UPDATED_DATE,
                    APPROVED_BY, APPROVED_DATE, REJECT_REASON
                ) VALUES (
                    :paramName, :paramValue, :paramType, :description, :componentCode,
                    :status, :isActive, :isDisplay, :newData,
                    :effectiveDate, :endEffectiveDate,
                    :createdBy, :createdDate, :updatedBy, :updatedDate,
                    :approvedBy, :approvedDate, :rejectReason
                )
                """);
        bindAll(query, entity);
        query.executeUpdate();
    }

    private void updateAllColumns(PmhGroupCategory entity) {
        Query query = entityManager.createNativeQuery("""
                UPDATE PMH_GROUP_CATEGORY
                   SET PARAM_NAME = :paramName,
                       PARAM_VALUE = :paramValue,
                       PARAM_TYPE = :paramType,
                       DESCRIPTION = :description,
                       COMPONENT_CODE = :componentCode,
                       STATUS = :status,
                       IS_ACTIVE = :isActive,
                       IS_DISPLAY = :isDisplay,
                       NEW_DATA = :newData,
                       EFFECTIVE_DATE = :effectiveDate,
                       END_EFFECTIVE_DATE = :endEffectiveDate,
                       CREATED_BY = :createdBy,
                       CREATED_DATE = :createdDate,
                       UPDATED_BY = :updatedBy,
                       UPDATED_DATE = :updatedDate,
                       APPROVED_BY = :approvedBy,
                       APPROVED_DATE = :approvedDate,
                       REJECT_REASON = :rejectReason
                 WHERE ID = :id
                """);
        query.setParameter("id", entity.getId());
        bindAll(query, entity);
        query.executeUpdate();
    }

    private void bindAll(Query query, PmhGroupCategory entity) {
        query.setParameter("paramName", entity.getParamName());
        query.setParameter("paramValue", entity.getParamValue());
        query.setParameter("paramType", entity.getParamType());
        query.setParameter("description", entity.getDescription());
        String componentCode = entity.getComponent() == null ? null : entity.getComponent().getComponentCode();
        query.setParameter("componentCode", componentCode);
        query.setParameter("status", entity.getStatus() == null ? null : entity.getStatus().getCode());
        query.setParameter("isActive", entity.getIsActive() == null ? null : entity.getIsActive().getCode());
        query.setParameter("isDisplay", entity.getIsDisplay() == null ? null : entity.getIsDisplay().getCode());
        query.setParameter("newData", entity.getNewData());
        query.setParameter("effectiveDate", timestamp(entity.getEffectiveDate()));
        query.setParameter("endEffectiveDate", timestamp(entity.getEndEffectiveDate()));
        query.setParameter("createdBy", entity.getCreatedBy());
        query.setParameter("createdDate", timestamp(entity.getCreatedDate()));
        query.setParameter("updatedBy", entity.getUpdatedBy());
        query.setParameter("updatedDate", timestamp(entity.getUpdatedDate()));
        query.setParameter("approvedBy", entity.getApprovedBy());
        query.setParameter("approvedDate", timestamp(entity.getApprovedDate()));
        query.setParameter("rejectReason", entity.getRejectReason());
    }

    private boolean existsByBusinessKey(String paramType, String paramValue, Long excludedId) {
        String sql = "SELECT COUNT(1) FROM PMH_GROUP_CATEGORY WHERE LOWER(PARAM_TYPE) = LOWER(:paramType) AND LOWER(PARAM_VALUE) = LOWER(:paramValue)";
        if (excludedId != null) {
            sql += " AND ID <> :id";
        }
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("paramType", paramType.trim());
        query.setParameter("paramValue", paramValue.trim());
        if (excludedId != null) {
            query.setParameter("id", excludedId);
        }
        return number(query.getSingleResult()).longValue() > 0;
    }

    private Set<String> activeComponentCodes() {
        return getActiveComponents().stream()
                .map(ComponentResponse::componentCode)
                .map(code -> code.toUpperCase(Locale.ROOT))
                .collect(Collectors.toSet());
    }

    private SqlAndParams buildSearchWhere(GroupCategorySearchCriteria criteria) {
        StringBuilder sql = new StringBuilder("WHERE 1 = 1");
        Map<String, Object> params = new LinkedHashMap<>();

        if (hasText(criteria.paramType())) {
            sql.append(" AND LOWER(PARAM_TYPE) LIKE :paramType");
            params.put("paramType", contains(criteria.paramType()));
        }
        if (hasText(criteria.paramValue())) {
            sql.append(" AND LOWER(PARAM_VALUE) LIKE :paramValue");
            params.put("paramValue", contains(criteria.paramValue()));
        }
        if (hasText(criteria.paramName())) {
            sql.append(" AND LOWER(PARAM_NAME) LIKE :paramName");
            params.put("paramName", contains(criteria.paramName()));
        }
        if (!criteria.statuses().isEmpty()) {
            criteria.statuses().forEach(ParamStatus::fromCode);
            sql.append(" AND STATUS IN (:statuses)");
            params.put("statuses", criteria.statuses());
        }
        if (!criteria.activeStatuses().isEmpty()) {
            criteria.activeStatuses().forEach(ActiveStatus::fromCode);
            sql.append(" AND IS_ACTIVE IN (:activeStatuses)");
            params.put("activeStatuses", criteria.activeStatuses());
        }
        return new SqlAndParams(sql.toString(), params);
    }

    private long count(String whereSql, Map<String, Object> params) {
        Query query = entityManager.createNativeQuery("SELECT COUNT(1) FROM PMH_GROUP_CATEGORY " + whereSql);
        setParameters(query, params);
        return number(query.getSingleResult()).longValue();
    }

    private void setParameters(Query query, Map<String, Object> params) {
        params.forEach(query::setParameter);
    }

    @SuppressWarnings("unchecked")
    private List<Object> resultList(Query query) {
        return query.getResultList();
    }

    private static Timestamp timestamp(LocalDateTime value) {
        return value == null ? null : Timestamp.valueOf(value);
    }

    private static Number number(Object value) {
        return (Number) value;
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private static String contains(String value) {
        return "%" + value.trim().toLowerCase(Locale.ROOT) + "%";
    }

    private record SqlAndParams(String sql, Map<String, Object> params) {
    }
}
