package com.company.payment_hub_be.entity;

import com.company.payment_hub_be.domain.ActiveStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "PMH_COMPONENTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PmhComponents {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "COMPONENT_CODE", length = 255, nullable = false)
    private String componentCode;

    @Column(name = "COMPONENT_NAME", length = 255)
    private String componentName;

    @Column(name = "DESCRIPTION", length = 255)
    private String description;

    @Convert(converter = ActiveStatus.ConverterImpl.class)
    @Column(name = "IS_ACTIVE", nullable = false)
    private ActiveStatus isActive;

    @Column(name = "CREATED_BY", length = 50)
    private String createdBy;

    @Column(name = "CREATED_DATE")
    private LocalDateTime createdDate;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    private LocalDateTime updatedDate;
}
