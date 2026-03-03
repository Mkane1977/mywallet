import { useEffect, useMemo, useState } from "react";
import {
    fetchCategories,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    TransactionFilters,
} from "./api";
import { AddTransactionModal } from "./AddTransactionModal";
import { CsvImportModal } from "./CsvImportModal";
import { TransactionsTable } from "./TransactionsTable";
import { Category, Transaction, TransactionType } from "./types";
import { FilterBar, RangePreset } from "./FilterBar";

export default function Transactions() {
    const pageBg = "min-h-screen bg-[#eef1ef]";
    const titleText = "text-2xl font-semibold text-green-900";
    const greenBtn =
        "rounded bg-green-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60";
    const outlineBtn =
        "rounded border border-green-800 px-4 py-2 text-sm font-semibold text-green-900 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60";

    const userId = useMemo(() => localStorage.getItem("userId") ?? "", []);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Filters (server-side)
    const [type, setType] = useState<"ALL" | TransactionType>("ALL");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [preset, setPreset] = useState<RangePreset>("ALL");
    const [start, setStart] = useState<string>("");
    const [end, setEnd] = useState<string>("");

    const [isAddOpen, setIsAddOpen] = useState(false);

    const [isUploadOpen, setIsUploadOpen] = useState(false); // ✅ NEW

    const currentFilters: TransactionFilters = useMemo(() => {
        const f: TransactionFilters = { type, categoryId };
        if (start) f.start = start;
        if (end) f.end = end;
        return f;
    }, [type, categoryId, start, end]);

    const loadCategoriesOnly = async () => {
        const cats = await fetchCategories(userId);
        setCategories(cats);
    };

    const loadTransactionsOnly = async () => {
        const txs = await fetchTransactions(userId, currentFilters);
        setTransactions(txs);
    };

    const loadAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [cats, txs] = await Promise.all([
                fetchCategories(userId),
                fetchTransactions(userId, currentFilters),
            ]);
            setCategories(cats);
            setTransactions(txs);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load transactions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadAll();

    }, []);

    const applyFilters = async () => {
        setLoading(true);
        setError(null);
        try {
            await loadTransactionsOnly();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load transactions.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (payload: {
        type: TransactionType;
        amount: number;
        categoryId: number;
        date: string;
        description: string | null;
    }) => {
        setSaving(true);
        setError(null);
        try {
            await createTransaction(userId, payload);
            setIsAddOpen(false);
            await loadTransactionsOnly();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to add transaction.");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (
        id: number,
        payload: {
            type: TransactionType;
            amount: number;
            categoryId: number;
            date: string;
            description: string | null;
        }
    ) => {
        setSaving(true);
        setError(null);
        try {
            await updateTransaction(userId, id, payload);
            await loadTransactionsOnly();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to update transaction.");
            throw e;
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        setSaving(true);
        setError(null);
        try {
            await deleteTransaction(userId, id);
            await loadTransactionsOnly();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to delete transaction.");
            throw e;
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={pageBg}>
            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className={titleText}>Transactions</h2>

                    <div className="flex items-center gap-3">
                        {/* Upload CSV */}
                        <button
                            type="button"
                            className={outlineBtn}
                            onClick={() => setIsUploadOpen(true)}
                        >
                            Upload CSV
                        </button>

                        <button
                            type="button"
                            className={outlineBtn}
                            onClick={() => void loadCategoriesOnly()}
                            disabled={loading}
                        >
                            Refresh Categories
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsAddOpen(true)}
                            className={greenBtn}
                        >
                            + Add Transaction
                        </button>
                    </div>
                </div>

                <FilterBar
                    categories={categories}
                    type={type}
                    setType={setType}
                    categoryId={categoryId}
                    setCategoryId={setCategoryId}
                    preset={preset}
                    setPreset={setPreset}
                    start={start}
                    setStart={setStart}
                    end={end}
                    setEnd={setEnd}
                    onApply={() => void applyFilters()}
                    loading={loading}
                />

                {error && (
                    <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-md border border-gray-200 bg-white p-6 text-green-900/80">
                        Loading transactions...
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="rounded-md border border-gray-200 bg-white p-6 text-green-900/80">
                        No transactions found for these filters.
                    </div>
                ) : (
                    <TransactionsTable
                        transactions={transactions}
                        categories={categories}
                        saving={saving}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        setError={setError}
                    />
                )}

                <AddTransactionModal
                    isOpen={isAddOpen}
                    saving={saving}
                    categories={categories}
                    onClose={() => setIsAddOpen(false)}
                    onCreate={handleCreate}
                    setError={setError}
                />

                {/* CSV Import modal */}
                <CsvImportModal
                    isOpen={isUploadOpen}
                    userId={userId}
                    saving={saving}
                    setSaving={setSaving}
                    onClose={() => setIsUploadOpen(false)}
                    onImported={loadAll}
                    setError={setError}
                />
            </main>
        </div>
    );
}