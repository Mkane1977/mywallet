package com.mywallet.dto.dashboard;

import com.mywallet.domain.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RecentTransactionResponse {

    public Long id;
    public LocalDate date;
    public TransactionType type;
    public BigDecimal amount;

    public Long categoryId;
    public String categoryName;

    public String description;

    public RecentTransactionResponse(
            long id,
            LocalDate date,
            TransactionType type,
            BigDecimal amount,
            long categoryId,
            String categoryName
    ) {
        this.id = id;
        this.date = date;
        this.type = type;
        this.amount = amount;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
    }

    public RecentTransactionResponse(
            long id,
            LocalDate date,
            TransactionType type,
            BigDecimal amount,
            long categoryId,
            String categoryName,
            String description
    ) {
        this(id, date, type, amount, categoryId, categoryName);
        this.description = description;
    }

}