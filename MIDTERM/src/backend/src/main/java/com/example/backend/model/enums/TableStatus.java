package com.example.backend.model.enums;

public enum TableStatus {
    CLOSED(0),
    OPENED(1),
    OCCUPIED(2);

    private final int value;

    TableStatus(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static TableStatus fromValue(int value) {
        for (TableStatus status : TableStatus.values()) {
            if (status.getValue() == value) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid TableStatus value: " + value);
    }
}
