package com.mywallet.dto.transaction.importing;

import java.util.ArrayList;
import java.util.List;

public class CsvImportConfirmRequest {
    public List<CsvImportPreviewRow> rows = new ArrayList<>();
    public boolean skipDuplicates = true;

    public CsvImportConfirmRequest() {}
}