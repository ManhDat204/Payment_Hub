package com.company.payment_hub_be.repository;

import com.company.payment_hub_be.domain.ActiveStatus;
import com.company.payment_hub_be.domain.ParamStatus;
import com.company.payment_hub_be.dto.GroupCategorySearchCriteria;
import com.company.payment_hub_be.entity.PmhGroupCategory;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class GroupCategorySpecifications {
    private GroupCategorySpecifications() {
    }

    public static Specification<PmhGroupCategory> byCriteria(GroupCategorySearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (hasText(criteria.paramType())) {
                predicates.add(cb.like(cb.lower(root.get("paramType")), contains(criteria.paramType())));
            }
            if (hasText(criteria.paramValue())) {
                predicates.add(cb.like(cb.lower(root.get("paramValue")), contains(criteria.paramValue())));
            }
            if (hasText(criteria.paramName())) {
                predicates.add(cb.like(cb.lower(root.get("paramName")), contains(criteria.paramName())));
            }
            if (!criteria.statuses().isEmpty()) {
                predicates.add(root.get("status").in(toParamStatuses(criteria.statuses())));
            }
            if (!criteria.activeStatuses().isEmpty()) {
                predicates.add(root.get("isActive").in(toActiveStatuses(criteria.activeStatuses())));
            }

            if (query != null && query.getResultType() != Long.class) {
                Expression<LocalDateTime> updatedOrCreated = cb.coalesce(root.get("updatedDate"), root.get("createdDate"));
                query.orderBy(cb.desc(updatedOrCreated), cb.desc(root.get("id")));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static List<ParamStatus> toParamStatuses(List<Integer> codes) {
        return codes.stream().map(ParamStatus::fromCode).toList();
    }

    private static List<ActiveStatus> toActiveStatuses(List<Integer> codes) {
        return codes.stream().map(ActiveStatus::fromCode).toList();
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private static String contains(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }
}
