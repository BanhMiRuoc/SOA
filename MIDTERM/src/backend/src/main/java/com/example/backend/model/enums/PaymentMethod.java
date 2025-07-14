package com.example.backend.model.enums;

import lombok.Getter;

@Getter
public enum PaymentMethod {
    CASH,           // Tiền mặt
    CREDIT_CARD,    // Thẻ tín dụng
    DEBIT_CARD,     // Thẻ ghi nợ
    MOMO,           // Ví điện tử MoMo
    VNPAY,          // VNPay
    ZALOPAY         // ZaloPay
} 