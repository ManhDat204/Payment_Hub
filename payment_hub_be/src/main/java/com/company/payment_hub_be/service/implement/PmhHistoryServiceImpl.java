package com.company.payment_hub_be.service.implement;

import com.company.payment_hub_be.entity.PmhHistory;

import com.company.payment_hub_be.entity.User;
import com.company.payment_hub_be.payload.response.HistoryResponse;
import com.company.payment_hub_be.payload.response.PageResponse;
import com.company.payment_hub_be.repository.PmhHistoryCategory;
import com.company.payment_hub_be.repository.UserRepository;
import com.company.payment_hub_be.service.PmhHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PmhHistoryServiceImpl implements PmhHistoryService {
    private static final String GROUP_CATEGORY_OBJECT_TYPE = "PMH_GROUP_CATEGORY";

    private final PmhHistoryCategory historyRepository;
    private final UserRepository userRepository;

    @Override
    public List<PmhHistory> getAll() {
        return historyRepository.findAll();
    }

    @Override
    public PageResponse<HistoryResponse> getGroupCategoryHistory(Long id, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        return PageResponse.from(historyRepository
                .findByObjectTypeAndObjectIdOrderByActionTimeDescIdDesc(
                        GROUP_CATEGORY_OBJECT_TYPE,
                        id,
                        PageRequest.of(safePage, safeSize)
                )
                .map(this::toResponse));
    }

    private HistoryResponse toResponse(PmhHistory history) {
        String actionBy = history.getActionBy();
        String action = actionLabel(history);
        return new HistoryResponse(
                history.getId(),
                actionBy,
                displayName(actionBy),
                action,
                history.getActionTime(),
                history.getIp(),
                hasText(history.getDescription()) ? history.getDescription() : action
        );
    }

    private String displayName(String username) {
        if (!hasText(username)) {
            return "";
        }

        return userRepository.findByUsername(username)
                .map(User::getFullName)
                .filter(PmhHistoryServiceImpl::hasText)
                .orElse(username);
    }

    private static String actionLabel(PmhHistory history) {
        if (history.getActionType() == null) {
            return "";
        }

        return switch (history.getActionType()) {
            case CREATE -> "Thêm mới";
            case COPY -> "Sao chép";
            case UPDATE -> "Sửa";
            case DELETE -> "Xóa bản ghi";
            case SUBMIT -> "Gửi duyệt";
            case APPROVE -> "Phê duyệt";
            case REJECT -> "Từ chối";
            case CANCEL_APPROVE -> "Hủy phê duyệt";
        };
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
