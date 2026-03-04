import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,} from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChartMode, SpendingRow, RecentTransactionResponse } from "./types";
import { formatMoney, GREEN_BAR_FILL, GREEN_PIE_COLORS } from "./utils";
import { fetchCategoryBreakdown } from "./api";

type SpendingInputRow = { id: number; name: string; total: number };

function buildSpendingRows(input: SpendingInputRow[]): { total: number; rows: SpendingRow[] } {
    const cleaned = input
        .map((r) => ({ ...r, total: Math.max(0, r.total) }))
        .filter((r) => r.total > 0);

    const total = cleaned.reduce((sum, r) => sum + r.total, 0);
    if (cleaned.length === 0) return { total: 0, rows: [] };

    const MAX_SLICES = 7;
    const MIN_PCT_FOR_OWN_SLICE = 0.04;

    const sorted = [...cleaned].sort((a, b) => b.total - a.total);

    const top = sorted.slice(0, MAX_SLICES);
    const rest = sorted.slice(MAX_SLICES);

    const kept: typeof top = [];
    const bucketed: typeof top = [];

    for (const r of top) {
        const pct = total === 0 ? 0 : r.total / total;
        if (pct < MIN_PCT_FOR_OWN_SLICE) bucketed.push(r);
        else kept.push(r);
    }

    const otherTotal =
        rest.reduce((sum, r) => sum + r.total, 0) + bucketed.reduce((sum, r) => sum + r.total, 0);

    const rows: SpendingRow[] = [
        ...kept.map((r) => ({
            id: r.id,
            name: r.name,
            total: r.total,
            pct: total === 0 ? 0 : r.total / total,
        })),
        ...(otherTotal > 0
            ? [
                {
                    id: -1,
                    name: "Other",
                    total: otherTotal,
                    pct: total === 0 ? 0 : otherTotal / total,
                },
            ]
            : []),
    ];

    return { total, rows };
}

function TopTxnList({ items }: { items: RecentTransactionResponse[] }) {
    return (
        <div className="mt-2">
            <div className="text-xs font-semibold text-green-900/70">Top transactions</div>
            <div className="mt-1 space-y-1">
                {items.map((t) => (
                    <div key={t.id} className="flex justify-between gap-4 text-sm">
            <span className="max-w-[220px] truncate text-green-900/90">
              {t.description || t.categoryName || "Transaction"}
            </span>
                        <span className="tabular-nums text-green-900">{formatMoney(t.amount)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SpendingByCategoryCard({
                                           titleRangeLabel,
                                           mode,
                                           setMode,
                                           spendingByCategory,

                                           userId,
                                           start,
                                           end,
                                           onSelectCategory,
                                       }: {
    titleRangeLabel: string;
    mode: ChartMode;
    setMode: (m: ChartMode) => void;
    spendingByCategory: SpendingInputRow[];

    userId: string;
    start?: string;
    end?: string;
    onSelectCategory: (categoryId: number, categoryName: string) => void;
}) {
    const card = "rounded-lg border border-gray-200 bg-white p-5 shadow-sm";
    const greenBtn =
        "rounded bg-green-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60";
    const outlineBtn =
        "rounded border border-green-800 px-4 py-2 text-sm font-semibold text-green-900 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60";

    const chart = useMemo(() => buildSpendingRows(spendingByCategory), [spendingByCategory]);

    const cacheRef = useRef(new Map<string, RecentTransactionResponse[]>());

    const SpendingTooltip = ({ active, payload }: any) => {
        const [items, setItems] = useState<RecentTransactionResponse[] | null>(null);

        const p = active && payload && payload.length ? payload[0]?.payload : null;
        const categoryId = p?.id;
        const isOther = categoryId === -1;

        useEffect(() => {
            if (!active || !p || categoryId == null || isOther) return;

            const key = `${categoryId}:${start ?? ""}:${end ?? ""}`;
            const cached = cacheRef.current.get(key);
            if (cached) {
                setItems(cached);
                return;
            }

            setItems(null);
            fetchCategoryBreakdown({ userId, categoryId, limit: 5, start, end })
                .then((data) => {
                    cacheRef.current.set(key, data);
                    setItems(data);
                })
                .catch(() => setItems([]));
        }, [active, categoryId, isOther, start, end]);

        if (!active || !p) return null;

        const pctLabel = `${Math.round((p.pct ?? 0) * 100)}%`;

        return (
            <div className="rounded border border-gray-200 bg-white px-3 py-2 text-sm shadow">
                <div className="font-semibold text-green-900">{p.name}</div>
                <div className="text-green-900/80">
                    {formatMoney(p.total)} · {pctLabel}
                </div>

                {!isOther ? (
                    items === null ? (
                        <div className="mt-2 text-green-900/70">Loading…</div>
                    ) : items.length === 0 ? (
                        <div className="mt-2 text-green-900/70">No transactions</div>
                    ) : (
                        <TopTxnList items={items} />
                    )
                ) : (
                    <div className="mt-2 text-green-900/60">“Other” is an aggregate bucket.</div>
                )}

                {!isOther ? (
                    <div className="mt-2 text-xs text-green-900/60">Click to filter Recent Transactions</div>
                ) : null}
            </div>
        );
    };

    return (
        <div className={card}>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <div className="text-lg font-semibold text-green-900">Spending by Category</div>
                    <div className="text-sm text-green-900/70">{titleRangeLabel}</div>
                </div>

                <div className="flex gap-2">
                    <button type="button" className={mode === "BAR" ? greenBtn : outlineBtn} onClick={() => setMode("BAR")}>
                        Bar
                    </button>
                    <button type="button" className={mode === "DONUT" ? greenBtn : outlineBtn} onClick={() => setMode("DONUT")}>
                        Donut
                    </button>
                </div>
            </div>

            {chart.rows.length === 0 ? (
                <div className="rounded border border-gray-200 bg-[#eef1ef] p-6 text-green-900/80">
                    No expense data for this range.
                </div>
            ) : (
                <div className="h-80 w-full">
                    {mode === "BAR" ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chart.rows} layout="vertical" margin={{ left: 8, right: 16 }}>
                                <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                                <YAxis type="category" dataKey="name" width={110} />
                                <Tooltip content={<SpendingTooltip />} />
                                <Bar
                                    dataKey="total"
                                    fill={GREEN_BAR_FILL}
                                    onClick={(barData: any) => {
                                        const p = barData?.payload;
                                        if (!p || p.id === -1) return;
                                        onSelectCategory(p.id, p.name);
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Tooltip content={<SpendingTooltip />} />
                                <Pie
                                    data={chart.rows}
                                    dataKey="total"
                                    nameKey="name"
                                    innerRadius="55%"
                                    outerRadius="85%"
                                    paddingAngle={2}
                                    onClick={(slice: any) => {
                                        const p = slice?.payload;
                                        if (!p || p.id === -1) return;
                                        onSelectCategory(p.id, p.name);
                                    }}
                                >
                                    {chart.rows.map((_, idx) => (
                                        <Cell key={idx} fill={GREEN_PIE_COLORS[idx % GREEN_PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            )}

            {chart.rows.length > 0 && (
                <div className="mt-4 grid gap-2">
                    {chart.rows
                        .slice()
                        .sort((a, b) => b.total - a.total)
                        .map((r) => (
                            <button
                                key={r.name}
                                type="button"
                                className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-green-50"
                                onClick={() => {
                                    if (r.id === -1) return;
                                    onSelectCategory(r.id, r.name);
                                }}
                                title={r.id === -1 ? "Other is an aggregate bucket" : "Click to filter recent transactions"}
                            >
                                <div className="text-green-900">{r.name}</div>
                                <div className="text-green-900/80">
                                    {formatMoney(r.total)} · {Math.round(r.pct * 100)}%
                                </div>
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
}