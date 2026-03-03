package com.mywallet.dto.transaction;

import java.util.ArrayList;
import java.util.List;

public class TransactionImportResult {
    public int imported;
    public int skipped;
    public List<String> errors = new ArrayList<>();
    public int duplicates;

    public TransactionImportResult() {}

    public TransactionImportResult(int imported, int skipped, List<String> errors) {
        this.imported = imported;
        this.skipped = skipped;
        this.errors = errors;
    }
}