package com.mywallet.dto.transaction.importing;

import com.mywallet.domain.TransactionType;

import java.math.BigDecimal;

public class CsvImportPreviewRow {
    public long rowNumber;

    public String status;
    public String currency;
    public String accountName;

    public String date;          //  yyyy-MM-dd
    public TransactionType type; // INCOME/EXPENSE
    public BigDecimal amount;    // positive

    public String categoryName;  // CSV category
    public String description;   // merged

    public boolean duplicate;    // detected in DB
    public String duplicateReason;

    public boolean selected = true; //for CSV preview

    public CsvImportPreviewRow() {}
}