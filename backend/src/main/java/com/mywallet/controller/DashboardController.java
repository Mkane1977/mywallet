package com.mywallet.controller;

import com.mywallet.domain.TransactionType;
import com.mywallet.dto.dashboard.DashboardSummaryResponse;
import com.mywallet.dto.dashboard.RecentTransactionResponse;
import com.mywallet.service.DashboardService;
import com.mywallet.service.TransactionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService service;
    private final TransactionService transactionService;

    public DashboardController(DashboardService service, TransactionService transactionService) {
        this.service = service;
        this.transactionService = transactionService;
    }

    @GetMapping
    public DashboardSummaryResponse summary(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(defaultValue = "5") int recentLimit
    ) {
        return service.getSummary(userId, start, end, recentLimit);
    }


    @GetMapping("/category-breakdown")
    public List<RecentTransactionResponse> categoryBreakdown(
            @RequestHeader("X-USER-ID") Long userId,
            @RequestParam Long categoryId,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return transactionService.recent(
                userId,
                limit,
                categoryId,
                TransactionType.EXPENSE,
                start,
                end,
                "date",
                "desc"
        );
    }
}