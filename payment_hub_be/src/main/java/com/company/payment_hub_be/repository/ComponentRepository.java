package com.company.payment_hub_be.repository;

import com.company.payment_hub_be.domain.ActiveStatus;
import com.company.payment_hub_be.entity.PmhComponents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ComponentRepository extends JpaRepository<PmhComponents, Long> {
    Optional<PmhComponents> findByComponentCodeIgnoreCase(String componentCode);
    List<PmhComponents> findByIsActiveOrderByComponentCodeAsc(
            ActiveStatus isActive
    );

    @Query(value = """
            SELECT *
            FROM PMH_COMPONENTS
            WHERE IS_ACTIVE = 1
            ORDER BY COMPONENT_CODE
            """, nativeQuery = true)
    List<PmhComponents> findActiveComponents();
}
