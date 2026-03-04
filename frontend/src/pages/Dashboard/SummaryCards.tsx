import { useMemo, useRef, useState } from "react";
import { formatMoney, safeDate } from "./utils";
import type { RecentTransactionResponse } from "./types";
import { fetchTransactionsPage } from "./api";

function HoverBox({
                      title,
                      totalLabel,
                      items,
                      loading,
                  }: {
    title: string;
    totalLabel: string;
    items: RecentTransactionResponse[];
    loading: boolean;
}) {
    return (
        <div className="absolute z-20 mt-2 w-[380px] rounded border border-gray-200 bg-white p-3 text-sm shadow-lg">
            <div className="mb-2 flex items-center justify-between">
                <div className="font-semibold text-green-900">{title}</div>
                <div className="text-green-900/70">{totalLabel}</div>
            </div>

            {loading ? (
                <div className="text-green-900/70">Loading…</div>
            ) : items.length === 0 ? (
                <div className="text-green-900/70">No transactions in this range.</div>
            ) : (
                <div className="max-h-56 overflow-auto">
                    {items.map((t) => (
                        <div key={t.id} className="flex items-center justify-between gap-3 border-t border-gray-100 py-2">
                            <div className="min-w-0">
                                <div className="truncate text-green-900">
                                    {t.categoryName}
                                    {t.description ? <span className="text-green-900/70"> — {t.description}</span> : null}
                                </div>
                                <div className="text-xs text-green-900/60">{safeDate(t.date)}</div>
                            </div>
                            <div className="shrink-0 tabular-nums text-green-900">{formatMoney(t.amount)}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-2 text-xs text-green-900/60">Showing most recent items in this range.</div>
        </div>
    );
}

export function SummaryCards({
                                 userId,
                                 start,
                                 end,
                                 totalIncome,
                                 totalExpenses,
                                 netBalance,
                             }: {
    userId: string;
    start?: string;
    end?: string;
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
}) {
    const card = "relative rounded-lg border border-gray-200 bg-white p-5 shadow-sm";
    const label = "text-sm font-medium text-green-900/80";
    const value = "text-2xl font-semibold text-green-900";

    const [hover, setHover] = useState<"INCOME" | "EXPENSE" | null>(null);
    const [loadingHover, setLoadingHover] = useState(false);
    const [hoverItems, setHoverItems] = useState<RecentTransactionResponse[]>([]);

    // cache by key so you don't refetch on tiny mouse moves
    const cacheRef = useRef(new Map<string, RecentTransactionResponse[]>());

    const totalLabel = useMemo(() => {
        if (hover === "INCOME") return formatMoney(totalIncome);
        if (hover === "EXPENSE") return formatMoney(totalExpenses);
        return "";
    }, [hover, totalIncome, totalExpenses]);

    async function ensureHoverLoaded(kind: "INCOME" | "EXPENSE") {
        const key = `${kind}:${start ?? ""}:${end ?? ""}`;

        const cached = cacheRef.current.get(key);
        if (cached) {
            setHoverItems(cached);
            return;
        }

        setLoadingHover(true);
        try {
            const res = await fetchTransactionsPage({
                userId,
                type: kind,
                start,
                end,
                size: 50,
                sort: "date,desc",
            });
            cacheRef.current.set(key, res.content);
            setHoverItems(res.content);
        } catch {
            setHoverItems([]);
        } finally {
            setLoadingHover(false);
        }
    }

    return (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div
                className={card}
                onMouseEnter={() => {
                    setHover("INCOME");
                    void ensureHoverLoaded("INCOME");
                }}
                onMouseLeave={() => setHover(null)}
            >
                <div className={label}>Total Income</div>
                <div className={value}>{formatMoney(totalIncome)}</div>
                {hover === "INCOME" ? (
                    <HoverBox title="Income (range)" totalLabel={totalLabel} items={hoverItems} loading={loadingHover} />
                ) : null}
            </div>

            <div
                className={card}
                onMouseEnter={() => {
                    setHover("EXPENSE");
                    void ensureHoverLoaded("EXPENSE");
                }}
                onMouseLeave={() => setHover(null)}
            >
                <div className={label}>Total Expenses</div>
                <div className={value}>{formatMoney(totalExpenses)}</div>
                {hover === "EXPENSE" ? (
                    <HoverBox title="Expenses (range)" totalLabel={totalLabel} items={hoverItems} loading={loadingHover} />
                ) : null}
            </div>

            <div className={card}>
                <div className={label}>Net Balance</div>
                <div className={value}>{formatMoney(netBalance)}</div>
            </div>
        </div>
    );
}