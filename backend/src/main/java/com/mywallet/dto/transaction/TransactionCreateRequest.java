package com.mywallet.dto.transaction;

import com.mywallet.domain.TransactionType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionCreateRequest {

    @NotNull
    @DecimalMin("0.01")
    public BigDecimal amount;

    @NotNull
    public TransactionType type;

    @NotNull
    public LocalDate date;


    @Size(max = 120)
    public String description;

    @NotNull
    public Long categoryId;
}