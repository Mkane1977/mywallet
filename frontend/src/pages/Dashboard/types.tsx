export type TransactionType = "INCOME" | "EXPENSE";

export type CategorySpendingResponse = {
    id: number;
    name: string;
    total: number; // BigDecimal -> may arrive as number or string; normalize in api
};

export type RecentTransactionResponse = {
    id: number;
    date: string; // or Date
    type: "INCOME" | "EXPENSE";
    amount: number;
    categoryId: number;
    categoryName: string;
    description?: string | null;
};

export type DashboardSummaryResponse = {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    spendingByCategory: CategorySpendingResponse[];
    recentTransactions: RecentTransactionResponse[];
};


export type ChartMode = "BAR" | "DONUT";


export type SpendingRow = {
    id: number;
    name: string;
    total: number;
    pct: number;
};