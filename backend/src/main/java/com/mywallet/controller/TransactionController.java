package com.mywallet.controller;

import com.mywallet.domain.TransactionType;
import com.mywallet.dto.dashboard.RecentTransactionResponse;
import com.mywallet.dto.transaction.*;
import com.mywallet.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }



    //  Data source for recent transactions sortable/filterable server-side
    @GetMapping("/recent")
    public List<RecentTransactionResponse> recent(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(defaultValue = "date") String sort,
            @RequestParam(defaultValue = "desc") String dir
    ) {
        return service.recent(userId, limit, categoryId, type, start, end, sort, dir);
    }

    @GetMapping("/{id}")
    public TransactionResponse getMine(@RequestHeader("X-USER-ID") Long userId, @PathVariable Long id) {
        return service.getMine(userId, id);
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createMine(
            @RequestHeader("X-USER-ID") Long userId,
            @Valid @RequestBody TransactionCreateRequest req
    ) {
        TransactionResponse created = service.createMine(userId, req);
        return ResponseEntity.created(URI.create("/api/transactions/" + created.id)).body(created);
    }

    @PutMapping("/{id}")
    public TransactionResponse updateMine(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody TransactionUpdateRequest req
    ) {
        return service.updateMine(userId, id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMine(@RequestHeader("X-USER-ID") Long userId, @PathVariable Long id) {
        service.deleteMine(userId, id);
        return ResponseEntity.noContent().build();
    }



    @GetMapping
    public Page<TransactionResponse> listMine(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            Pageable pageable
    ) {
        return service.listMinePage(userId, type, categoryId, start, end, pageable);
    }

}