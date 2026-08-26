package com.company.payment_hub_be.entity;

import com.company.payment_hub_be.domain.ActionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "PMH_HISTORY")
@Getter
@Setter
@NoArgsConstructor
public class PmhHistory {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "pmh_history_seq"
    )
    @SequenceGenerator(
            name = "pmh_history_seq",
            sequenceName = "PMH_HISTORY_SEQ",
            allocationSize = 1
    )
    private Long id;

    @Column(name = "OBJECT_ID", nullable = false)
    private Long objectId;

    @Column(name = "OBJECT_TYPE", nullable = false)
    private String objectType;

    @Enumerated(EnumType.STRING)
    @Column(name = "ACTION_TYPE", nullable = false)
    private ActionType actionType;

    @Lob
    @Column(name = "OLD_DATA")
    private String oldData;

    @Lob
    @Column(name = "NEW_DATA")
    private String newData;

    @Column(name = "ACTION_BY", nullable = false)
    private String actionBy;

    @Column(name = "ACTION_TIME", nullable = false)
    private LocalDateTime actionTime;

    @Column(name = "IP", length = 45)
    private String ip;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;
}
