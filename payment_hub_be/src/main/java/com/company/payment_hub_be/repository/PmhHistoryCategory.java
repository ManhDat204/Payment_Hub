package com.company.payment_hub_be.repository;

import com.company.payment_hub_be.entity.PmhHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PmhHistoryCategory extends JpaRepository<PmhHistory, Long> {
    Page<PmhHistory> findByObjectTypeAndObjectIdOrderByActionTimeDescIdDesc(
            String objectType,
            Long objectId,
            Pageable pageable
    );
}
