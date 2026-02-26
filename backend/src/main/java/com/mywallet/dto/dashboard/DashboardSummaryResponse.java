package com.mywallet.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryResponse {
    public BigDecimal totalIncome;
    public BigDecimal totalExpenses;
    public BigDecimal netBalance;

    public List<CategorySpendingResponse> spendingByCategory;
    public List<RecentTransactionResponse> recentTransactions;

    public DashboardSummaryResponse(
            BigDecimal totalIncome,
            BigDecimal totalExpenses,
            BigDecimal netBalance,
            List<CategorySpendingResponse> spendingByCategory,
            List<RecentTransactionResponse> recentTransactions
    ) {
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.netBalance = netBalance;
        this.spendingByCategory = spendingByCategory;
        this.recentTransactions = recentTransactions;
    }
}