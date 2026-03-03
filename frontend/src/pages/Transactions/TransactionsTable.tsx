import { useEffect, useMemo, useRef, useState } from "react";
import { Category, Transaction, TransactionType } from "./types";
import { formatMoney, normalizeNote, safeDate } from "./utils";
import { NotePopover } from "./NotePopover";

export function TransactionsTable({
                                      transactions,
                                      categories,
                                      saving,
                                      onUpdate,
                                      onDelete,
                                      setError,
                                  }: {
    transactions: Transaction[];
    categories: Category[];
    saving: boolean;
    onUpdate: (id: number, payload: { type: TransactionType; amount: number; categoryId: number; date: string; description: string | null }) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    setError: (msg: string | null) => void;
}) {
    const thBase = "px-6 py-4 font-semibold text-green-900";
    const tdBase = "px-6 py-5 align-middle text-green-900";
    const rowBase = "border-t border-gray-200";
    const inputBase =
        "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-200";
    const selectBase =
        "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-200";
    const textAreaBase =
        "w-full resize-none rounded border border-gray-300 bg-white px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-200";

    const actionBox = "inline-flex overflow-hidden rounded border border-gray-300 bg-gray-200/60";
    const actionBtn =
        "px-5 py-2 text-sm font-medium text-green-900 transition hover:bg-gray-300/70 disabled:cursor-not-allowed disabled:opacity-60";
    const divider = "w-px bg-gray-300";

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editType, setEditType] = useState<TransactionType>("EXPENSE");
    const [editAmount, setEditAmount] = useState<string>("");
    const [editCategoryId, setEditCategoryId] = useState<number | "">("");
    const [editDate, setEditDate] = useState<string>("");
    const [editNote, setEditNote] = useState<string>("");

    const editCategoriesForType = useMemo(
        () => categories.filter((c) => c.type === editType),
        [categories, editType]
    );

    const startEdit = (t: Transaction) => {
        setError(null);
        setEditingId(t.id);
        setEditType(t.type);
        setEditAmount(String(t.amount));
        setEditDate(safeDate(t.date));
        setEditNote(normalizeNote(t));
        const cid = t.categoryId ?? t.category?.id ?? "";
        setEditCategoryId(cid ? Number(cid) : "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditType("EXPENSE");
        setEditAmount("");
        setEditCategoryId("");
        setEditDate("");
        setEditNote("");
    };

    const handleUpdateClick = async (id: number) => {
        setError(null);

        const amountNum = Number(editAmount);
        if (!editAmount || Number.isNaN(amountNum) || amountNum <= 0) {
            setError("Amount must be a number greater than 0.");
            return;
        }
        if (!editCategoryId) {
            setError("Please select a category.");
            return;
        }
        if (!editDate) {
            setError("Please select a date.");
            return;
        }

        await onUpdate(id, {
            type: editType,
            amount: amountNum,
            categoryId: Number(editCategoryId),
            date: editDate,
            description: editNote.trim() || null,
        });

        cancelEdit();
    };

    const handleDeleteClick = async (id: number) => {
        setError(null);
        if (!window.confirm("Delete this transaction?")) return;
        await onDelete(id);
        if (editingId === id) cancelEdit();
    };

    // Auto grow text area
    const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    useEffect(() => {
        if (editingId == null) return;
        const el = editTextareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [editingId, editNote]);

    return (
        <div className="overflow-x-auto rounded-md border border-gray-200 bg-[#eef1ef]">
            <table className="min-w-full text-sm text-green-900">
                <thead>
                <tr>
                    <th className={thBase}>Date</th>
                    <th className={thBase}>Category</th>
                    <th className={thBase}>Type</th>
                    <th className={thBase}>Amount</th>
                    <th className={thBase}>Note</th>
                    <th className={thBase}>Actions</th>
                </tr>
                </thead>

                <tbody>
                {transactions.map((t) => {
                    const isEditing = editingId === t.id;
                    const categoryLabel = t.categoryName ?? t.category?.name ?? "-";
                    const noteText = normalizeNote(t);

                    return (
                        <tr key={t.id} className={rowBase}>
                            <td className={tdBase}>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className={inputBase}
                                    />
                                ) : (
                                    safeDate(t.date)
                                )}
                            </td>

                            <td className={tdBase}>
                                {isEditing ? (
                                    <select
                                        value={editCategoryId}
                                        onChange={(e) => setEditCategoryId(e.target.value ? Number(e.target.value) : "")}
                                        className={selectBase}
                                    >
                                        <option value="">Select...</option>
                                        {editCategoriesForType.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    categoryLabel
                                )}
                            </td>

                            <td className={tdBase}>
                                {isEditing ? (
                                    <select
                                        value={editType}
                                        onChange={(e) => {
                                            const next = e.target.value as TransactionType;
                                            setEditType(next);
                                            setEditCategoryId("");
                                        }}
                                        className={selectBase}
                                    >
                                        <option value="EXPENSE">EXPENSE</option>
                                        <option value="INCOME">INCOME</option>
                                    </select>
                                ) : (
                                    t.type
                                )}
                            </td>

                            <td className={tdBase}>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        className={inputBase}
                                    />
                                ) : (
                                    formatMoney(t.amount)
                                )}
                            </td>

                            <td className={`${tdBase}`}>
                                {isEditing ? (
                                    <textarea
                                        ref={editTextareaRef}
                                        value={editNote}
                                        onChange={(e) => setEditNote(e.target.value)}
                                        className={textAreaBase}
                                        placeholder="Optional note"
                                        rows={1}
                                    />
                                ) : noteText ? (
                                    <NotePopover noteText={noteText} />
                                ) : (
                                    <span className="text-green-900/40"></span>
                                )}
                            </td>

                            <td className={tdBase}>
                                {isEditing ? (
                                    <div className={actionBox}>
                                        <button
                                            type="button"
                                            disabled={saving}
                                            onClick={() => void handleUpdateClick(t.id)}
                                            className={`${actionBtn} cursor-pointer`}
                                        >
                                            Save
                                        </button>
                                        <div className="w-px bg-gray-300" />
                                        <button
                                            type="button"
                                            disabled={saving}
                                            onClick={cancelEdit}
                                            className={`${actionBtn} cursor-pointer`}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className={actionBox}>
                                        <button
                                            type="button"
                                            disabled={saving}
                                            onClick={() => startEdit(t)}
                                            className={`${actionBtn} cursor-pointer`}
                                        >
                                            Edit
                                        </button>
                                        <div className={divider} />
                                        <button
                                            type="button"
                                            disabled={saving}
                                            onClick={() => void handleDeleteClick(t.id)}
                                            className={`${actionBtn} cursor-pointer`}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}