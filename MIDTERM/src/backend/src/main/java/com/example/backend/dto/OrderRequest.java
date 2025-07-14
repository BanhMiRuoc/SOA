package com.example.backend.dto;

import lombok.Data;
import lombok.ToString;
import java.util.List;

@Data
@ToString
public class OrderRequest {
    private List<OrderItemRequest> items;
}
