import { Category, TransactionType } from "./types";

export type RangePreset = "ALL" | "LAST_30" | "LAST_60" | "LAST_90" | "CUSTOM";

function yyyyMmDd(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export function presetToDates(preset: RangePreset): { start?: string; end?: string } {
    if (preset === "ALL") return {};
    const end = new Date();
    const start = new Date(end);

    const days =
        preset === "LAST_30" ? 30 :
            preset === "LAST_60" ? 60 :
                preset === "LAST_90" ? 90 : 0;

    if (days > 0) start.setDate(end.getDate() - days);

    return { start: yyyyMmDd(start), end: yyyyMmDd(end) };
}

export function FilterBar({
                              categories,
                              type,
                              setType,
                              categoryId,
                              setCategoryId,
                              preset,
                              setPreset,
                              start,
                              setStart,
                              end,
                              setEnd,
                              onApply,
                              loading,
                          }: {
    categories: Category[];
    type: "ALL" | TransactionType;
    setType: (v: "ALL" | TransactionType) => void;

    categoryId: number | "";
    setCategoryId: (v: number | "") => void;

    preset: RangePreset;
    setPreset: (v: RangePreset) => void;

    start: string;
    setStart: (v: string) => void;

    end: string;
    setEnd: (v: string) => void;

    onApply: () => void;
    loading: boolean;
}) {
    const inputBase =
        "rounded border border-gray-300 bg-white px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-200";
    const greenBtn =
        "rounded bg-green-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60";

    const filteredCategories = categories.filter((c) => type === "ALL" || c.type === type);

    const onPresetChange = (value: RangePreset) => {
        setPreset(value);

        if (value === "CUSTOM") return;

        const d = presetToDates(value);
        setStart(d.start ?? "");
        setEnd(d.end ?? "");
    };

    return (
        <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-green-900/80">Type</label>
                    <select
                        value={type}
                        onChange={(e) => {
                            const next = e.target.value as any;
                            setType(next);
                            // If category no longer fits type, reset it
                            setCategoryId("");
                        }}
                        className={inputBase}
                    >
                        <option value="ALL">All</option>
                        <option value="EXPENSE">Expense</option>
                        <option value="INCOME">Income</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-green-900/80">Category</label>
                    <select
                        value={categoryId === "" ? "" : String(categoryId)}
                        onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                        className={inputBase}
                    >
                        <option value="">All</option>
                        {filteredCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-green-900/80">Range</label>
                    <select
                        value={preset}
                        onChange={(e) => onPresetChange(e.target.value as RangePreset)}
                        className={inputBase}
                    >
                        <option value="ALL">All time</option>
                        <option value="LAST_30">Last 30 days</option>
                        <option value="LAST_60">Last 60 days</option>
                        <option value="LAST_90">Last 90 days</option>
                        <option value="CUSTOM">Custom</option>
                    </select>
                </div>

                {preset === "CUSTOM" && (
                    <>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-green-900/80">Start</label>
                            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputBase} />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-green-900/80">End</label>
                            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputBase} />
                        </div>
                    </>
                )}

                <div className="ml-auto">
                    <button type="button" onClick={onApply} disabled={loading} className={greenBtn}>
                        {loading ? "Loading..." : "Apply"}
                    </button>
                </div>
            </div>
        </div>
    );
}