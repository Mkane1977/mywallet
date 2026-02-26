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

        BigDecimal totalIncome = txRepo.sumAmountByType(userId, TransactionType.INCOME, start, end);
        BigDecimal totalExpenses = txRepo.sumAmountByType(userId, TransactionType.EXPENSE, start, end);

        // If you store expenses as positive numbers, net is income - expenses.
        // If you store expenses as negative numbers, net would be income + expenses.
        BigDecimal netBalance = totalIncome.subtract(totalExpenses);

        List<CategorySpendingResponse> spending = txRepo.spendingByCategory(userId, start, end);
        List<RecentTransactionResponse> recent =
                txRepo.recentForDashboard(userId, start, end, PageRequest.of(0, Math.max(1, recentLimit)));

        return new DashboardSummaryResponse(totalIncome, totalExpenses, netBalance, spending, recent);
    }
}