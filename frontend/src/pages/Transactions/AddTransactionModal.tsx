import { FormEvent, useMemo, useState } from "react";
import { Category, TransactionType } from "./types";

export function AddTransactionModal({
                                        isOpen,
                                        saving,
                                        categories,
                                        onClose,
                                        onCreate,
                                        setError,
                                    }: {
    isOpen: boolean;
    saving: boolean;
    categories: Category[];
    onClose: () => void;
    onCreate: (payload: { type: TransactionType; amount: number; categoryId: number; date: string; description: string | null }) => Promise<void>;
    setError: (msg: string | null) => void;
}) {
    const inputBase =
        "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-200";
    const selectBase =
        "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-200";
    const textAreaBase =
        "w-full resize-none rounded border border-gray-300 bg-white px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-200";
    const greenBtn =
        "rounded bg-green-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60";
    const grayBtn =
        "rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60";

    const [newType, setNewType] = useState<TransactionType>("EXPENSE");
    const [newAmount, setNewAmount] = useState<string>("");
    const [newCategoryId, setNewCategoryId] = useState<number | "">("");
    const [newNote, setNewNote] = useState<string>("");

    const [newDate, setNewDate] = useState<string>(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    });

    const categoriesForType = useMemo(
        () => categories.filter((c) => c.type === newType),
        [categories, newType]
    );

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const amountNum = Number(newAmount);
        if (!newAmount || Number.isNaN(amountNum) || amountNum <= 0) {
            setError("Amount must be a number greater than 0.");
            return;
        }
        if (!newCategoryId) {
            setError("Please select a category.");
            return;
        }
        if (!newDate) {
            setError("Please select a date.");
            return;
        }

        await onCreate({
            type: newType,
            amount: amountNum,
            categoryId: Number(newCategoryId),
            date: newDate,
            description: newNote.trim() || null,
        });

        // reset on success
        setNewType("EXPENSE");
        setNewAmount("");
        setNewCategoryId("");
        setNewNote("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={onClose}>
            <div className="w-full max-w-md rounded-xl bg-[#eef1ef] p-4 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
                <div className="rounded-lg border-4 border-green-800 bg-white p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-green-900">Add Transaction</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded px-2 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 flex gap-6 text-green-900">
                            <label className="flex items-center gap-2 font-medium">
                                <input
                                    type="radio"
                                    checked={newType === "EXPENSE"}
                                    onChange={() => {
                                        setNewType("EXPENSE");
                                        setNewCategoryId("");
                                    }}
                                />
                                Expense
                            </label>

                            <label className="flex items-center gap-2 font-medium">
                                <input
                                    type="radio"
                                    checked={newType === "INCOME"}
                                    onChange={() => {
                                        setNewType("INCOME");
                                        setNewCategoryId("");
                                    }}
                                />
                                Income
                            </label>
                        </div>

                        <div className="mb-3">
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Amount"
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                                className={inputBase}
                                autoFocus
                            />
                        </div>

                        <div className="mb-3">
                            <select
                                value={newCategoryId}
                                onChange={(e) => setNewCategoryId(e.target.value ? Number(e.target.value) : "")}
                                className={selectBase}
                            >
                                <option value="">Select Category...</option>
                                {categoriesForType.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className={inputBase} />
                        </div>

                        <div className="mb-5">
              <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className={textAreaBase}
                  placeholder="Note (Optional)"
                  rows={2}
              />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={onClose} disabled={saving} className={grayBtn}>
                                Cancel
                            </button>
                            <button type="submit" disabled={saving} className={greenBtn}>
                                {saving ? "Saving..." : "Save Transaction"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}