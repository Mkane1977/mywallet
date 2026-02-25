package com.mywallet.dto.transaction;

import com.mywallet.domain.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionResponse {
    public Long id;
    public BigDecimal amount;
    public TransactionType type;
    public LocalDate date;
    public String description;
    public Long categoryId;
    public String categoryName;

    public TransactionResponse(Long id, BigDecimal amount, TransactionType type, LocalDate date,
                               String description, Long categoryId, String categoryName) {
        this.id = id;
        this.amount = amount;
        this.type = type;
        this.date = date;
        this.description = description;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
    }
}