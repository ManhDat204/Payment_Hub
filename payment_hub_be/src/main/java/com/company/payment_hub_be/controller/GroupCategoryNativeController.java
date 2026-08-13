package com.company.payment_hub_be.controller;

import com.company.payment_hub_be.service.GroupCategoryApiService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/group-categories/native")
public class GroupCategoryNativeController extends GroupCategoryController {
    public GroupCategoryNativeController(@Qualifier("groupCategoryNativeService") GroupCategoryApiService service) {
        super(service);
    }
}
