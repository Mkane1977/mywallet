package com.mywallet.dto.dashboard;

import java.math.BigDecimal;

public class CategorySpendingResponse {

    public Long categoryId;
    public String categoryName;
    public BigDecimal total;

    public CategorySpendingResponse(Long categoryId, String categoryName, BigDecimal total) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.total = total;
    }
}