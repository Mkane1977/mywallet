import { FormEvent, useMemo, useState } from "react";
import { confirmCsvImport, previewCsvImport } from "./api";
import { CsvPreviewResponse, ImportResult } from "./types";
import { formatMoney } from "./utils";

export function CsvImportModal({
                                   isOpen,
                                   userId,
                                   saving,
                                   setSaving,
                                   onClose,
                                   onImported,
                                   setError,
                               }: {
    isOpen: boolean;
    userId: string;
    saving: boolean;
    setSaving: (v: boolean) => void;
    onClose: () => void;
    onImported: () => Promise<void>;
    setError: (msg: string | null) => void;
}) {
    const greenBtn =
        "rounded bg-green-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60";
    const outlineBtn =
        "rounded border border-green-800 px-4 py-2 text-sm font-semibold text-green-900 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60";
    const grayBtn =
        "rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60";

    const [skipPending, setSkipPending] = useState(true);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvPreview, setCsvPreview] = useState<CsvPreviewResponse | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    const selectedCount = useMemo(() => {
        if (!csvPreview) return 0;
        return csvPreview.rows.filter((r) => r.selected).length;
    }, [csvPreview]);

    if (!isOpen) return null;

    const reset = () => {
        setImportResult(null);
        setCsvPreview(null);
        setCsvFile(null);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handlePreview = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setImportResult(null);
        setCsvPreview(null);

        if (!csvFile) {
            setError("Please select a CSV file.");
            return;
        }

        setSaving(true);
        try {
            const data = await previewCsvImport(userId, csvFile, skipPending);
            setCsvPreview(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Preview failed.");
        } finally {
            setSaving(false);
        }
    };

    const toggleRow = (rowNumber: number) => {
        if (!csvPreview) return;
        setCsvPreview({
            ...csvPreview,
            rows: csvPreview.rows.map((r) =>
                r.rowNumber === rowNumber ? { ...r, selected: !r.selected } : r
            ),
        });
    };

    const setAllSelected = (selected: boolean) => {
        if (!csvPreview) return;
        setCsvPreview({
            ...csvPreview,
            rows: csvPreview.rows.map((r) => (r.duplicate ? r : { ...r, selected })),
        });
    };

    const importSelected = async () => {
        if (!csvPreview) return;

        setError(null);
        setImportResult(null);

        setSaving(true);
        try {
            const result = await confirmCsvImport(userId, csvPreview.rows, true);
            setImportResult(result);
            await onImported();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Import failed.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={handleClose}>
            <div className="w-full max-w-5xl rounded-xl bg-[#eef1ef] p-4 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
                <div className="rounded-lg border-4 border-green-800 bg-white p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-green-900">Import Transactions (CSV)</h3>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="cursor-pointer rounded px-2 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handlePreview} className="mb-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-col gap-2">
                                <label className="inline-block">
  <span
      className="
      inline-block cursor-pointer rounded
      bg-green-800 px-4 py-2 text-sm font-semibold
      text-white transition hover:bg-green-900
    "
  >
    Choose CSV File
  </span>

                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                                        className="hidden"
                                    />
                                </label>

                                {csvFile && (
                                    <div className="mt-2 text-sm text-green-900">
                                        Selected: <span className="font-semibold">{csvFile.name}</span>
                                    </div>
                                )}

                                <label className="flex items-center gap-2 text-sm text-green-900">
                                    <input
                                        type="checkbox"
                                        checked={skipPending}
                                        onChange={(e) => setSkipPending(e.target.checked)}
                                    />
                                    Skip Pending transactions
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={handleClose} disabled={saving} className={grayBtn}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className={greenBtn}>
                                    {saving ? "Previewing..." : "Preview"}
                                </button>
                            </div>
                        </div>
                    </form>

                    {csvPreview && (
                        <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                            <div className="flex flex-wrap gap-x-6 gap-y-1">
                                <div>Total rows: <span className="font-semibold">{csvPreview.totalRows}</span></div>
                                <div>Parsed: <span className="font-semibold">{csvPreview.parsedRows}</span></div>
                                <div>Duplicates: <span className="font-semibold">{csvPreview.duplicates}</span></div>
                                <div>Skipped: <span className="font-semibold">{csvPreview.skipped}</span></div>
                            </div>

                            {csvPreview.errors?.length > 0 && (
                                <div className="mt-2 text-red-700">
                                    {csvPreview.errors.slice(0, 3).map((e, i) => (
                                        <div key={i}>• {e}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {csvPreview && (
                        <>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                <div className="text-sm text-green-900">
                                    Select the transactions you want to import.
                                    <span className="ml-2 text-green-800/80">(Duplicates are unchecked by default.)</span>
                                </div>

                                <div className="flex gap-2">
                                    <button type="button" className={outlineBtn} onClick={() => setAllSelected(true)} disabled={saving}>
                                        Select All
                                    </button>
                                    <button type="button" className={outlineBtn} onClick={() => setAllSelected(false)} disabled={saving}>
                                        Unselect All
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[380px] overflow-auto rounded border border-gray-200">
                                <table className="min-w-full text-sm text-green-900">
                                    <thead className="sticky top-0 bg-white">
                                    <tr className="border-b border-gray-200">
                                        <th className="px-3 py-3 text-left font-semibold">Import</th>
                                        <th className="px-3 py-3 text-left font-semibold">Date</th>
                                        <th className="px-3 py-3 text-left font-semibold">Description</th>
                                        <th className="px-3 py-3 text-left font-semibold">Category</th>
                                        <th className="px-3 py-3 text-left font-semibold">Type</th>
                                        <th className="px-3 py-3 text-right font-semibold">Amount</th>
                                        <th className="px-3 py-3 text-left font-semibold">Duplicate</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {csvPreview.rows.map((r) => (
                                        <tr key={r.rowNumber} className="border-b border-gray-100">
                                            <td className="px-3 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={r.selected}
                                                    onChange={() => toggleRow(r.rowNumber)}
                                                    disabled={saving || r.duplicate}
                                                />
                                            </td>
                                            <td className="px-3 py-3">{r.date}</td>
                                            <td className="px-3 py-3 max-w-[320px] truncate" title={r.description ?? ""}>
                                                {r.description ?? ""}
                                            </td>
                                            <td className="px-3 py-3">{r.categoryName}</td>
                                            <td className="px-3 py-3">{r.type}</td>
                                            <td className="px-3 py-3 text-right">{formatMoney(r.amount)}</td>
                                            <td className="px-3 py-3">
                                                {r.duplicate ? (
                                                    <span className="text-red-700" title={r.duplicateReason ?? ""}>
                              Yes
                            </span>
                                                ) : (
                                                    <span className="text-green-900/60">No</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-green-900/80">
                                    Selected: <span className="font-semibold">{selectedCount}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={importSelected}
                                    disabled={saving || selectedCount === 0}
                                    className={greenBtn}
                                >
                                    {saving ? "Importing..." : "Import Selected"}
                                </button>
                            </div>
                        </>
                    )}

                    {importResult && (
                        <div className="mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                            <div>Imported: <span className="font-semibold">{importResult.imported}</span></div>
                            <div>Skipped: <span className="font-semibold">{importResult.skipped}</span></div>
                            <div>Duplicates: <span className="font-semibold">{importResult.duplicates}</span></div>

                            {importResult.errors?.length > 0 && (
                                <div className="mt-2 text-red-700">
                                    {importResult.errors.slice(0, 5).map((e, i) => (
                                        <div key={i}>• {e}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}