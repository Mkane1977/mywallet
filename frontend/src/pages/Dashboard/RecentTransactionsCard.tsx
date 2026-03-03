import { RecentTransactionResponse } from "./types";
import { formatMoney, safeDate } from "./utils";
import type { RecentSortKey, SortDir } from "./api";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
    if (!active) return <span className="ml-1 opacity-40">↕</span>;
    return <span className="ml-1">{dir === "asc" ? "▲" : "▼"}</span>;
}

export function RecentTransactionsCard({
                                           loading,
                                           recentLimit,
                                           rows,
                                           sortKey,
                                           sortDir,
                                           onSortChange,
                                           activeCategoryName,
                                           onClearCategoryFilter,
                                       }: {
    loading: boolean;
    recentLimit: number;
    rows: RecentTransactionResponse[];

    sortKey: RecentSortKey;
    sortDir: SortDir;
    onSortChange: (key: RecentSortKey) => void;

    activeCategoryName?: string | null;
    onClearCategoryFilter?: () => void;
}) {
    const card = "rounded-lg border border-gray-200 bg-white p-5 shadow-sm";

    const thClickable =
        "px-4 py-3 text-left font-semibold text-green-900 select-none cursor-pointer hover:bg-green-50";
    const thRightClickable =
        "px-4 py-3 text-right font-semibold text-green-900 select-none cursor-pointer hover:bg-green-50";
    const thStatic = "px-4 py-3 text-left font-semibold text-green-900";

    return (
        <div className={card}>
            <div className="mb-4">
                <div className="text-lg font-semibold text-green-900">Recent Transactions</div>
                <div className="text-sm text-green-900/70">
                    Showing last {Math.max(1, recentLimit || 5)} transactions
                </div>

                {activeCategoryName ? (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-900">
                        <span className="font-medium">Category:</span>
                        <span>{activeCategoryName}</span>
                        {onClearCategoryFilter && (
                            <button
                                type="button"
                                className="ml-1 rounded-full px-2 py-0.5 hover:bg-green-100"
                                onClick={onClearCategoryFilter}
                                title="Clear category filter"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ) : null}
            </div>

            {loading ? (
                <div className="rounded border border-gray-200 bg-[#eef1ef] p-6 text-green-900/80">
                    Loading...
                </div>
            ) : rows.length === 0 ? (
                <div className="rounded border border-gray-200 bg-[#eef1ef] p-6 text-green-900/80">
                    No recent transactions.
                </div>
            ) : (
                <div className="overflow-x-auto rounded border border-gray-200">
                    <table className="min-w-full text-sm">
                        <thead className="bg-white">
                        <tr className="border-b border-gray-200">
                            <th className={thClickable} onClick={() => onSortChange("date")}>
                                Date <SortIcon active={sortKey === "date"} dir={sortDir} />
                            </th>
                            <th className={thClickable} onClick={() => onSortChange("category")}>
                                Category <SortIcon active={sortKey === "category"} dir={sortDir} />
                            </th>
                            <th className={thClickable} onClick={() => onSortChange("type")}>
                                Type <SortIcon active={sortKey === "type"} dir={sortDir} />
                            </th>
                            <th className={thRightClickable} onClick={() => onSortChange("amount")}>
                                Amount <SortIcon active={sortKey === "amount"} dir={sortDir} />
                            </th>
                            <th className={thStatic}>Note</th>
                        </tr>
                        </thead>

                        <tbody className="bg-[#eef1ef]">
                        {rows.map((t) => (
                            <tr key={t.id} className="border-b border-gray-200 hover:bg-green-50/40">
                                <td className="px-4 py-3 text-green-900">{safeDate(t.date)}</td>
                                <td className="px-4 py-3 text-green-900">{t.categoryName}</td>
                                <td className="px-4 py-3 text-green-900">{t.type}</td>
                                <td className="px-4 py-3 text-right text-green-900 tabular-nums">
                                    {formatMoney(t.amount)}
                                </td>
                                <td className="px-4 py-3 text-green-900/80">
                                    {t.description ? (
                                        <span title={t.description} className="inline-block max-w-[220px] truncate">
                        {t.description}
                      </span>
                                    ) : (
                                        ""
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}