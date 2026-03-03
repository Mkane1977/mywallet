import { useEffect, useMemo, useState } from "react";
import { fetchDashboardSummary, fetchRecentTransactions, type RecentSortKey, type SortDir } from "./api";
import { ChartMode, DashboardSummaryResponse, RecentTransactionResponse } from "./types";
import { SummaryCards } from "./SummaryCards";
import { SpendingByCategoryCard } from "./SpendingByCategoryCard";
import { RecentTransactionsCard } from "./RecentTransactionsCard";

export default function Dashboard() {
    const userId = localStorage.getItem("userId") ?? "";

    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [start, setStart] = useState<string>("");
    const [end, setEnd] = useState<string>("");
    const [recentLimit, setRecentLimit] = useState<number>(5);

    const [mode, setMode] = useState<ChartMode>("BAR");
    const [data, setData] = useState<DashboardSummaryResponse | null>(null);
    const [recentRows, setRecentRows] = useState<RecentTransactionResponse[]>([]);

    // UI state
    const [sortKey, setSortKey] = useState<RecentSortKey>("date");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
    const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);

    const pageBg = "min-h-screen bg-[#eef1ef]";
    const titleText = "text-2xl font-semibold text-green-900";
    const label = "text-sm font-medium text-green-900/80";
    const inputBase =
        "rounded border border-gray-300 bg-white px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-200";
    const greenBtn =
        "rounded bg-green-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60";

    const titleRangeLabel = useMemo(() => {
        if (start || end) return `Range: ${start ? start : "…"} → ${end ? end : "…"}`;
        return "All time";
    }, [start, end]);

    async function loadSummary() {
        setLoadingSummary(true);
        setError(null);
        try {
            const res = await fetchDashboardSummary({
                userId,
                start: start || undefined,
                end: end || undefined,
                recentLimit, // still used by your dashboard endpoint, but we won't rely on it for table
            });
            setData(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load dashboard.");
            setData(null);
        } finally {
            setLoadingSummary(false);
        }
    }

    async function loadRecent() {
        setLoadingRecent(true);
        setError(null);
        try {
            const rows = await fetchRecentTransactions({
                userId,
                limit: recentLimit,
                start: start || undefined,
                end: end || undefined,
                categoryId: activeCategoryId,
                sort: sortKey,
                dir: sortDir,
            });
            setRecentRows(rows);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load recent transactions.");
            setRecentRows([]);
        } finally {
            setLoadingRecent(false);
        }
    }

    async function loadAll() {
        await Promise.all([loadSummary(), loadRecent()]);
    }

    useEffect(() => {
        void loadAll();

    }, []);

    function onSortChange(key: RecentSortKey) {
        setSortKey((prevKey) => {
            if (prevKey !== key) {
                setSortDir("asc"); // new column defaults to asc
                return key;
            }
            setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
            return prevKey;
        });
    }

    // When sort or category filter changes, refetch recent
    useEffect(() => {
        void loadRecent();

    }, [sortKey, sortDir, activeCategoryId]);

    return (
        <div className={pageBg}>
            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h2 className={titleText}>Dashboard</h2>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2">
                            <label className={label}>Start</label>
                            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputBase} />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className={label}>End</label>
                            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputBase} />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className={label}>Recent</label>
                            <select value={recentLimit} onChange={(e) => setRecentLimit(Number(e.target.value))} className={inputBase}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                // When applying filters, clear category filter so results match range
                                setActiveCategoryId(null);
                                setActiveCategoryName(null);
                                void loadAll();
                            }}
                            disabled={loadingSummary || loadingRecent}
                            className={greenBtn}
                        >
                            {loadingSummary || loadingRecent ? "Loading..." : "Apply"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                <SummaryCards totalIncome={data?.totalIncome ?? 0} totalExpenses={data?.totalExpenses ?? 0} netBalance={data?.netBalance ?? 0} />

                <div className="grid gap-4 lg:grid-cols-2">
                    <SpendingByCategoryCard
                        titleRangeLabel={titleRangeLabel}
                        mode={mode}
                        setMode={setMode}
                        userId={userId}
                        start={start || undefined}
                        end={end || undefined}
                        spendingByCategory={(data?.spendingByCategory ?? []).map((c) => ({
                            id: c.id,
                            name: c.name,
                            total: c.total,
                        }))}
                        onSelectCategory={(categoryId, categoryName) => {
                            setActiveCategoryId(categoryId);
                            setActiveCategoryName(categoryName);
                        }}
                    />

                    <RecentTransactionsCard
                        loading={loadingRecent}
                        recentLimit={recentLimit}
                        rows={recentRows}
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSortChange={onSortChange}
                        activeCategoryName={activeCategoryName}
                        onClearCategoryFilter={() => {
                            setActiveCategoryId(null);
                            setActiveCategoryName(null);
                        }}
                    />
                </div>
            </main>
        </div>
    );
}