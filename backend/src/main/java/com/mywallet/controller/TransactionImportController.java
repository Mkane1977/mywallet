package com.mywallet.controller;

import com.mywallet.dto.transaction.TransactionImportResult;
import com.mywallet.dto.transaction.importing.CsvImportConfirmRequest;
import com.mywallet.dto.transaction.importing.CsvImportPreviewResponse;
import com.mywallet.service.TransactionService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/transactions/import")
@CrossOrigin
public class TransactionImportController {

    private final TransactionService txService;

    public TransactionImportController(TransactionService txService) {
        this.txService = txService;
    }

    @PostMapping(value = "/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CsvImportPreviewResponse preview(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "true") boolean skipPending
    ) {
        return txService.previewCsvImport(userId, file, skipPending);
    }

    @PostMapping("/confirm")
    public TransactionImportResult confirm(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestBody CsvImportConfirmRequest req
    ) {
        return txService.confirmCsvImport(userId, req);
    }
}