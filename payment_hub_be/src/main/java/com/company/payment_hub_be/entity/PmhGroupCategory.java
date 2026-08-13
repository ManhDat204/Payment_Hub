package com.company.payment_hub_be.entity;

import com.company.payment_hub_be.domain.ActiveStatus;
import com.company.payment_hub_be.domain.DisplayFlag;
import com.company.payment_hub_be.domain.ParamStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "PMH_GROUP_CATEGORY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PmhGroupCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "PARAM_NAME", length = 255, nullable = false)
    private String paramName;

    @Column(name = "PARAM_VALUE", length = 255, nullable = false)
    private String paramValue;

    @Column(name = "PARAM_TYPE", length = 255, nullable = false)
    private String paramType;

    @Column(name = "DESCRIPTION", length = 255)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COMPONENT_CODE", referencedColumnName = "COMPONENT_CODE", nullable = false)
    private PmhComponents component;

    @Convert(converter = ParamStatus.ConverterImpl.class)
    @Column(name = "STATUS", nullable = false)
    private ParamStatus status;

    @Convert(converter = ActiveStatus.ConverterImpl.class)
    @Column(name = "IS_ACTIVE", nullable = false)
    private ActiveStatus isActive;

    @Convert(converter = DisplayFlag.ConverterImpl.class)
    @Column(name = "IS_DISPLAY")
    private DisplayFlag isDisplay;

    @Column(name = "NEW_DATA", length = 4000)
    private String newData;

    @Column(name = "EFFECTIVE_DATE", nullable = false)
    private LocalDateTime effectiveDate;

    @Column(name = "END_EFFECTIVE_DATE")
    private LocalDateTime endEffectiveDate;

    @Column(name = "CREATED_BY", length = 50)
    private String createdBy;

    @Column(name = "CREATED_DATE")
    private LocalDateTime createdDate;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    private LocalDateTime updatedDate;

    @Column(name = "APPROVED_BY", length = 50)
    private String approvedBy;

    @Column(name = "APPROVED_DATE")
    private LocalDateTime approvedDate;

    @Column(name = "REJECT_REASON", length = 500)
    private String rejectReason;
}
