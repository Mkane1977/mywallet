package com.mywallet.dto.transaction.importing;

import java.util.ArrayList;
import java.util.List;

public class CsvImportPreviewResponse {
    public int totalRows;
    public int parsedRows;
    public int duplicates;
    public int skipped;
    public List<CsvImportPreviewRow> rows = new ArrayList<>();
    public List<String> errors = new ArrayList<>();

    public CsvImportPreviewResponse() {}
}