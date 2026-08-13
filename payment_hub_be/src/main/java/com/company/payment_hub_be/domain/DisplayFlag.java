package com.company.payment_hub_be.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

public enum DisplayFlag {
    NOT_APPROVED_YET(1, "Chua duyet, cho phep xoa"),
    WAS_APPROVED(2, "Da duyet, khong cho phep xoa");

    private final int code;
    private final String description;

    DisplayFlag(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static DisplayFlag fromCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (DisplayFlag value : values()) {
            if (value.code == code) {
                return value;
            }
        }
        throw new IllegalArgumentException("Invalid display flag code: " + code);
    }

    @Converter(autoApply = true)
    public static class ConverterImpl
            implements AttributeConverter<DisplayFlag, Integer> {

        @Override
        public Integer convertToDatabaseColumn(DisplayFlag attribute) {
            return attribute == null ? null : attribute.getCode();
        }

        @Override
        public DisplayFlag convertToEntityAttribute(Integer dbData) {
            return DisplayFlag.fromCode(dbData);
        }
    }
}
