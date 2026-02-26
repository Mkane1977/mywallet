package com.mywallet.controller;

import com.mywallet.dto.dashboard.DashboardSummaryResponse;
import com.mywallet.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
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
}