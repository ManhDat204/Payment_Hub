package com.company.payment_hub_be.repository;

import com.company.payment_hub_be.entity.PmhGroupCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupCategoryRepository extends JpaRepository<PmhGroupCategory, Long>, JpaSpecificationExecutor<PmhGroupCategory> {
    boolean existsByParamTypeIgnoreCaseAndParamValueIgnoreCase(String paramType, String paramValue);

    boolean existsByParamTypeIgnoreCaseAndParamValueIgnoreCaseAndIdNot(String paramType, String paramValue, Long id);
}
