package com.company.payment_hub_be.service.implement;

import com.company.payment_hub_be.mapper.GroupCategoryMapper;
import com.company.payment_hub_be.payload.request.ActionRequest;
import com.company.payment_hub_be.payload.response.ComponentResponse;
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
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service("groupCategoryProcedureService")
@Transactional
public class GroupCategoryProcedureService implements GroupCategoryApiService {
    private static final String PACKAGE = "PMH_GROUP_CATEGORY_PKG.";

    @PersistenceContext
    private EntityManager entityManager;

    private final GroupCategoryMapper mapper;
    private final GroupCategoryRules rules;

    public GroupCategoryProcedureService(GroupCategoryMapper mapper, GroupCategoryRules rules) {
        this.mapper = mapper;
        this.rules = rules;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<GroupCategoryResponse> search(GroupCategorySearchCriteria criteria) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery(PACKAGE + "SEARCH", PmhGroupCategory.class);
        registerSearchParameters(query, true);
        setSearchParameters(query, criteria);
        query.execute();

        List<GroupCategoryResponse> rows = resultList(query).stream()
                .map(PmhGroupCategory.class::cast)
                .map(mapper::toResponse)
                .toList();
        long total = number(query.getOutputParameterValue("P_TOTAL")).longValue();
        return PageResponse.of(rows, total, criteria.page(), criteria.size());
    }

    @Override
    @Transactional(readOnly = true)
    public GroupCategoryResponse getById(Long id) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery(PACKAGE + "GET_DETAIL", PmhGroupCategory.class);
        query.registerStoredProcedureParameter("P_ID", Long.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_RESULT", void.class, ParameterMode.REF_CURSOR);
        query.setParameter("P_ID", id);
        query.execute();
        try {
            return mapper.toResponse((PmhGroupCategory) query.getSingleResult());
        } catch (NoResultException exception) {
            throw BusinessException.notFound("PMH_GROUP_CATEGORY not found: " + id);
        }
    }

    @Override
    public GroupCategoryResponse create(GroupCategoryUpsertRequest request, boolean submit) {
        rules.validateUpsert(request, activeComponentCodes());
        Long id = callReturningId(PACKAGE + "CREATE_PARAM", query -> {
            registerUpsertParameters(query);
            query.registerStoredProcedureParameter("P_SUBMIT", Integer.class, ParameterMode.IN);
            setUpsertParameters(query, request);
            query.setParameter("P_SUBMIT", submit ? 1 : 0);
        });
        return getById(id);
    }

    @Override
    public GroupCategoryResponse update(Long id, GroupCategoryUpsertRequest request) {
        rules.validateUpsert(request, activeComponentCodes());
        Long updatedId = callReturningId(PACKAGE + "UPDATE_PARAM", query -> {
            query.registerStoredProcedureParameter("P_ID_IN", Long.class, ParameterMode.IN);
            registerUpsertParameters(query);
            query.setParameter("P_ID_IN", id);
            setUpsertParameters(query, request);
        });
        return getById(updatedId);
    }

    @Override
    public GroupCategoryResponse submit(Long id, ActionRequest request) {
        rules.validateActionActor(request == null ? null : request.actor());
        Long updatedId = callActionReturningId(PACKAGE + "SUBMIT_PARAM", id, request.actor(), null);
        return getById(updatedId);
    }

    @Override
    public GroupCategoryResponse approve(Long id, ActionRequest request) {
        rules.validateActionActor(request == null ? null : request.actor());
        Long updatedId = callActionReturningId(PACKAGE + "APPROVE_PARAM", id, request.actor(), null);
        return getById(updatedId);
    }

    @Override
    public GroupCategoryResponse reject(Long id, RejectRequest request) {
        if (request == null) {
            throw BusinessException.badRequest("Request body is required");
        }
        rules.validateActionActor(request.actor());
        if (request.reason() == null || request.reason().trim().isEmpty()) {
            throw BusinessException.badRequest("reason is required");
        }
        Long updatedId = callActionReturningId(PACKAGE + "REJECT_PARAM", id, request.actor(), request.reason());
        return getById(updatedId);
    }

    @Override
    public GroupCategoryResponse requestCancelApproval(Long id, ActionRequest request) {
        rules.validateActionActor(request == null ? null : request.actor());
        Long updatedId = callActionReturningId(PACKAGE + "REQUEST_CANCEL_APPROVAL", id, request.actor(), null);
        return getById(updatedId);
    }

    @Override
    public void delete(Long id) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery(PACKAGE + "DELETE_PARAM");
        query.registerStoredProcedureParameter("P_ID", Long.class, ParameterMode.IN);
        query.setParameter("P_ID", id);
        query.execute();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComponentResponse> getActiveComponents() {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery(PACKAGE + "GET_ACTIVE_COMPONENTS", PmhComponents.class);
        query.registerStoredProcedureParameter("P_RESULT", void.class, ParameterMode.REF_CURSOR);
        query.execute();
        return resultList(query).stream()
                .map(PmhComponents.class::cast)
                .map(mapper::toComponentResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportCsv(GroupCategorySearchCriteria criteria) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery(PACKAGE + "EXPORT_DATA", PmhGroupCategory.class);
        registerSearchParameters(query, false);
        setSearchParameters(query, criteria);
        query.execute();
        List<GroupCategoryResponse> rows = resultList(query).stream()
                .map(PmhGroupCategory.class::cast)
                .map(mapper::toResponse)
                .toList();
        return mapper.toCsv(rows);
    }

    private Long callReturningId(String procedureName, Consumer<StoredProcedureQuery> binder) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery(procedureName);
        query.registerStoredProcedureParameter("P_ID", Long.class, ParameterMode.OUT);
        binder.accept(query);
        query.execute();
        return number(query.getOutputParameterValue("P_ID")).longValue();
    }

    private Long callActionReturningId(String procedureName, Long id, String actor, String reason) {
        return callReturningId(procedureName, query -> {
            query.registerStoredProcedureParameter("P_ID_IN", Long.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("P_ACTOR", String.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("P_REASON", String.class, ParameterMode.IN);
            query.setParameter("P_ID_IN", id);
            query.setParameter("P_ACTOR", actor);
            query.setParameter("P_REASON", reason);
        });
    }

    private void registerSearchParameters(StoredProcedureQuery query, boolean withTotal) {
        query.registerStoredProcedureParameter("P_PARAM_TYPE", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_PARAM_VALUE", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_PARAM_NAME", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_STATUSES", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_ACTIVE_STATUSES", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_PAGE", Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_SIZE", Integer.class, ParameterMode.IN);
        if (withTotal) {
            query.registerStoredProcedureParameter("P_TOTAL", Long.class, ParameterMode.OUT);
        }
        query.registerStoredProcedureParameter("P_RESULT", void.class, ParameterMode.REF_CURSOR);
    }

    private void setSearchParameters(StoredProcedureQuery query, GroupCategorySearchCriteria criteria) {
        query.setParameter("P_PARAM_TYPE", trim(criteria.paramType()));
        query.setParameter("P_PARAM_VALUE", trim(criteria.paramValue()));
        query.setParameter("P_PARAM_NAME", trim(criteria.paramName()));
        query.setParameter("P_STATUSES", csv(criteria.statuses()));
        query.setParameter("P_ACTIVE_STATUSES", csv(criteria.activeStatuses()));
        query.setParameter("P_PAGE", criteria.page());
        query.setParameter("P_SIZE", criteria.size());
    }

    private void registerUpsertParameters(StoredProcedureQuery query) {
        query.registerStoredProcedureParameter("P_PARAM_NAME", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_PARAM_VALUE", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_PARAM_TYPE", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_DESCRIPTION", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_COMPONENT_CODE", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_IS_ACTIVE", Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_EFFECTIVE_DATE", Timestamp.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_END_EFFECTIVE_DATE", Timestamp.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("P_ACTOR", String.class, ParameterMode.IN);
    }

    private void setUpsertParameters(StoredProcedureQuery query, GroupCategoryUpsertRequest request) {
        query.setParameter("P_PARAM_NAME", trim(request.paramName()));
        query.setParameter("P_PARAM_VALUE", trim(request.paramValue()));
        query.setParameter("P_PARAM_TYPE", trim(request.paramType()));
        query.setParameter("P_DESCRIPTION", trim(request.description()));
        query.setParameter("P_COMPONENT_CODE", trim(request.componentCode()));
        query.setParameter("P_IS_ACTIVE", request.isActive() == null ? 1 : request.isActive());
        query.setParameter("P_EFFECTIVE_DATE", timestamp(request.effectiveDate()));
        query.setParameter("P_END_EFFECTIVE_DATE", timestamp(request.endEffectiveDate()));
        query.setParameter("P_ACTOR", trim(request.actor()));
    }

    private Set<String> activeComponentCodes() {
        return getActiveComponents().stream()
                .map(ComponentResponse::componentCode)
                .map(code -> code.toUpperCase(Locale.ROOT))
                .collect(Collectors.toSet());
    }

    @SuppressWarnings("unchecked")
    private List<Object> resultList(StoredProcedureQuery query) {
        return query.getResultList();
    }

    private static Timestamp timestamp(LocalDateTime value) {
        return value == null ? null : Timestamp.valueOf(value);
    }

    private static Number number(Object value) {
        return (Number) value;
    }

    private static String csv(List<Integer> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        return values.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}
