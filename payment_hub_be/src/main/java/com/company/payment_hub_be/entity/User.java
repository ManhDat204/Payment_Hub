package com.company.payment_hub_be.entity;

import com.company.payment_hub_be.domain.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "USERS")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;
    
    @Column(name = "FULL_NAME", length = 255)
    private String fullName;
}
