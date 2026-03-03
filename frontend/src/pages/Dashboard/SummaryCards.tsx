import { formatMoney } from "./utils";

export function SummaryCards({
                                 totalIncome,
                                 totalExpenses,
                                 netBalance,
                             }: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
}) {
    const card = "rounded-lg border border-gray-200 bg-white p-5 shadow-sm";
    const label = "text-sm font-medium text-green-900/80";
    const value = "text-2xl font-semibold text-green-900";

    return (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className={card}>
                <div className={label}>Total Income</div>
                <div className={value}>{formatMoney(totalIncome)}</div>
            </div>
            <div className={card}>
                <div className={label}>Total Expenses</div>
                <div className={value}>{formatMoney(totalExpenses)}</div>
            </div>
            <div className={card}>
                <div className={label}>Net Balance</div>
                <div className={value}>{formatMoney(netBalance)}</div>
            </div>
        </div>
    );
}