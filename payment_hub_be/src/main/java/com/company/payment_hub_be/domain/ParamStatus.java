package com.company.payment_hub_be.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

public enum ParamStatus {
    NEW(1, "Moi"),
    PENDING(3, "Cho duyet"),
    APPROVED(4, "Da duyet"),
    REJECTED(5, "Tu choi"),
    CANCELLED(7, "Huy duyet");

    private final int code;
    private final String description;

    ParamStatus(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static ParamStatus fromCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (ParamStatus value : values()) {
            if (value.code == code) {
                return value;
            }
        }
        throw new IllegalArgumentException("Invalid param status code: " + code);
    }

    @Converter(autoApply = true)
    public static class ConverterImpl
            implements AttributeConverter<ParamStatus, Integer> {

        @Override
        public Integer convertToDatabaseColumn(ParamStatus attribute) {
            return attribute == null ? null : attribute.getCode();
        }

        @Override
        public ParamStatus convertToEntityAttribute(Integer dbData) {
            return ParamStatus.fromCode(dbData);
        }
    }
}
