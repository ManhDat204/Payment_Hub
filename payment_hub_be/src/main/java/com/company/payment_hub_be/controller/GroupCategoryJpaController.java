package com.company.payment_hub_be.controller;

import com.company.payment_hub_be.service.GroupCategoryApiService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/group-categories/jpa")
public class GroupCategoryJpaController extends GroupCategoryController {
    public GroupCategoryJpaController(@Qualifier("groupCategoryJpaService") GroupCategoryApiService service) {
        super(service);
    }
}
