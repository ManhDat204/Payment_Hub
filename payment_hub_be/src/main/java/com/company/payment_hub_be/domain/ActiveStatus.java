package com.company.payment_hub_be.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

public enum ActiveStatus {
    INACTIVE(0, "Khong hoat dong"),
    ACTIVE(1, "Hoat dong");

    private final int code;
    private final String description;

    ActiveStatus(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static ActiveStatus fromCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (ActiveStatus value : values()) {
            if (value.code == code) {
                return value;
            }
        }
        throw new IllegalArgumentException("Invalid active status code: " + code);
    }

    @Converter(autoApply = true)
    public static class ConverterImpl
            implements AttributeConverter<ActiveStatus, Integer> {

        @Override
        public Integer convertToDatabaseColumn(ActiveStatus attribute) {
            return attribute == null ? null : attribute.getCode();
        }

        @Override
        public ActiveStatus convertToEntityAttribute(Integer dbData) {
            return ActiveStatus.fromCode(dbData);
        }
    }
}
