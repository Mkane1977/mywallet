package com.mywallet.service;

import com.mywallet.domain.TransactionType;
import com.mywallet.dto.dashboard.CategorySpendingResponse;
import com.mywallet.dto.dashboard.DashboardSummaryResponse;
import com.mywallet.dto.dashboard.RecentTransactionResponse;
import com.mywallet.repository.TransactionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final TransactionRepository txRepo;

    public DashboardService(TransactionRepository txRepo) {
        this.txRepo = txRepo;
    }

    public DashboardSummaryResponse getSummary(Long userId, LocalDate start, LocalDate end, int recentLimit) {

        boolean hasRange = (start != null && end != null);


        if (start != null && end == null) end = start;
        if (end != null && start == null) start = end;

        if (start != null && end != null && start.isAfter(end)) {
            LocalDate tmp = start;
            start = end;
            end = tmp;
        }

        BigDecimal totalIncome;
        BigDecimal totalExpenses;
        List<CategorySpendingResponse> spending;
        List<RecentTransactionResponse> recent;

        if (start != null && end != null) {
            totalIncome = txRepo.sumAmountByTypeInRange(userId, TransactionType.INCOME, start, end);
            totalExpenses = txRepo.sumAmountByTypeInRange(userId, TransactionType.EXPENSE, start, end);
            spending = txRepo.spendingByCategoryInRange(userId, start, end);
            recent = txRepo.recentForDashboardInRange(
                    userId, start, end, PageRequest.of(0, Math.max(1, recentLimit))
            );
        } else {
            totalIncome = txRepo.sumAmountByType(userId, TransactionType.INCOME);
            totalExpenses = txRepo.sumAmountByType(userId, TransactionType.EXPENSE);
            spending = txRepo.spendingByCategory(userId);
            recent = txRepo.recentForDashboard(userId, PageRequest.of(0, Math.max(1, recentLimit)));
        }

        if (totalIncome == null) totalIncome = BigDecimal.ZERO;
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

        BigDecimal netBalance = totalIncome.subtract(totalExpenses);

        return new DashboardSummaryResponse(totalIncome, totalExpenses, netBalance, spending, recent);
    }
}