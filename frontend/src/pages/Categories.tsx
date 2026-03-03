import { FormEvent, useEffect, useMemo, useState } from "react";

type CategoryType = "INCOME" | "EXPENSE";

type Category = {
    id: number;
    name: string;
    description: string | null;
    type: CategoryType;
};

const DEFAULT_EXPENSE_SUGGESTIONS = [
    "Rent",
    "Utilities",
    "Groceries",
    "Dining Out",
    "Gas",
    "Insurance",
    "Phone",
    "Internet",
    "Subscriptions",
    "Entertainment",
    "Medical",
    "Travel",
    "Childcare",
    "Debt Payment",
    "Savings",
];

const DEFAULT_INCOME_SUGGESTIONS = [
    "Salary",
    "Side Hustle",
    "Bonus",
    "Reimbursement",
    "Interest",
    "Gifts",
    "Tax Refund",
    "Rental Income",
];

async function readErrorMessage(response: Response) {
    try {
        const data = await response.json();
        if (data && typeof data.message === "string") return data.message;
        return `Request failed (${response.status})`;
    } catch {
        return `Request failed (${response.status})`;
    }
}

export function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<CategoryType>("EXPENSE");

    const [nameFocused, setNameFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editType, setEditType] = useState<CategoryType>("EXPENSE");

    const pageBg = "min-h-screen bg-[#eef1ef]";
    const titleText = "text-2xl font-semibold text-green-900";
    const tableWrap =
        "overflow-x-auto rounded-md border border-gray-200 bg-[#eef1ef]";
    const tableBase = "min-w-full text-sm text-green-900";
    const thBase = "px-6 py-4 font-semibold";
    const tdBase = "px-6 py-5 align-middle";
    const rowBase = "border-t border-gray-200";

    const inputBase =
        "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-200";

    const selectBase =
        "rounded border border-gray-300 bg-white px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-200";

    const greenBtn =
        "rounded bg-green-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60";

    const grayBtn =
        "rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60";

    const actionBox =
        "inline-flex overflow-hidden rounded border border-gray-300 bg-gray-200/60";
    const actionBtn =
        "px-5 py-2 text-sm font-medium text-green-900 transition hover:bg-gray-300/70 disabled:cursor-not-allowed disabled:opacity-60";
    const divider = "w-px bg-gray-300";

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) throw new Error("Missing user session.");

                const response = await fetch("/api/categories", {
                    headers: { "X-USER-ID": userId },
                });

                if (!response.ok) throw new Error(await readErrorMessage(response));

                setCategories(await response.json());
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load.");
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const existingNamesForType = useMemo(() => {
        return categories
            .filter((c) => c.type === type)
            .map((c) => c.name.toLowerCase());
    }, [categories, type]);

    const isDuplicateName = useMemo(() => {
        const n = name.trim().toLowerCase();
        if (!n) return false;
        return existingNamesForType.includes(n);
    }, [name, existingNamesForType]);

    const canSaveNew = useMemo(
        () => name.trim().length > 0 && !isDuplicateName && !saving,
        [name, isDuplicateName, saving]
    );

    const mergedSuggestions = useMemo(() => {
        const defaults =
            type === "EXPENSE"
                ? DEFAULT_EXPENSE_SUGGESTIONS
                : DEFAULT_INCOME_SUGGESTIONS;

        const combined = [...categories.filter(c => c.type === type).map(c => c.name), ...defaults];
        return Array.from(new Set(combined));
    }, [categories, type]);

    const filteredSuggestions = useMemo(() => {
        const q = name.trim().toLowerCase();
        if (!q) return mergedSuggestions.slice(0, 6);
        if (q.length < 2) return [];
        return mergedSuggestions
            .filter((s) => s.toLowerCase().includes(q))
            .slice(0, 8);
    }, [name, mergedSuggestions]);

    const handleAdd = async (event: FormEvent) => {
        event.preventDefault();

        if (isDuplicateName) {
            setError(`"${name.trim()}" already exists for ${type}.`);
            return;
        }

        setSaving(true);
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) throw new Error("Missing user session.");

            const response = await fetch("/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-USER-ID": userId,
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    type,
                }),
            });

            if (!response.ok) throw new Error(await readErrorMessage(response));

            setIsAddOpen(false);
            setName("");
            setDescription("");
            setType("EXPENSE");
            setCategories(await (await fetch("/api/categories", {
                headers: { "X-USER-ID": userId }
            })).json());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add.");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (id: number) => {
        setSaving(true);
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) throw new Error("Missing user session.");

            const response = await fetch(`/api/categories/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-USER-ID": userId,
                },
                body: JSON.stringify({
                    name: editName.trim(),
                    description: editDescription.trim() || null,
                    type: editType,
                }),
            });

            if (!response.ok) throw new Error(await readErrorMessage(response));

            setEditingId(null);
            setCategories(await (await fetch("/api/categories", {
                headers: { "X-USER-ID": userId }
            })).json());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this category?")) return;

        setSaving(true);
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) throw new Error("Missing user session.");

            await fetch(`/api/categories/${id}`, {
                method: "DELETE",
                headers: { "X-USER-ID": userId },
            });

            setCategories(categories.filter((c) => c.id !== id));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={pageBg}>
            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className={titleText}>Manage Categories</h2>
                    <button onClick={() => setIsAddOpen(true)} className={greenBtn}>
                        + Add Category
                    </button>
                </div>

                {error && (
                    <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className={tableWrap}>
                    <table className={tableBase}>
                        <thead>
                        <tr>
                            <th className={thBase}>Category</th>
                            <th className={thBase}>Description</th>
                            <th className={thBase}>Type</th>
                            <th className={thBase}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categories.map((c) => {
                            const isEditing = editingId === c.id;
                            return (
                                <tr key={c.id} className={rowBase}>
                                    <td className={`${tdBase} font-semibold`}>
                                        {isEditing ? (
                                            <input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className={inputBase}
                                            />
                                        ) : (
                                            c.name
                                        )}
                                    </td>

                                    <td className={tdBase}>
                                        {isEditing ? (
                                            <input
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                className={inputBase}
                                            />
                                        ) : (
                                            c.description || "-"
                                        )}
                                    </td>

                                    <td className={tdBase}>
                                        {isEditing ? (
                                            <select
                                                value={editType}
                                                onChange={(e) =>
                                                    setEditType(e.target.value as CategoryType)
                                                }
                                                className={selectBase}
                                            >
                                                <option value="EXPENSE">EXPENSE</option>
                                                <option value="INCOME">INCOME</option>
                                            </select>
                                        ) : (
                                            c.type
                                        )}
                                    </td>

                                    <td className={tdBase}>
                                        {isEditing ? (
                                            <div className={actionBox}>
                                                <button
                                                    onClick={() => handleUpdate(c.id)}
                                                    className={actionBtn}
                                                >
                                                    Save
                                                </button>
                                                <div className={divider} />
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className={actionBtn}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={actionBox}>
                                                <button
                                                    onClick={() => {
                                                        setEditingId(c.id);
                                                        setEditName(c.name);
                                                        setEditDescription(c.description ?? "");
                                                        setEditType(c.type);
                                                    }}
                                                    className={actionBtn}
                                                >
                                                    Edit
                                                </button>
                                                <div className={divider} />
                                                <button
                                                    onClick={() => handleDelete(c.id)}
                                                    className={actionBtn}
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

                {isAddOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                        onClick={() => setIsAddOpen(false)}
                    >
                        <div
                            className="w-full max-w-md rounded-xl bg-[#eef1ef] p-4 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="rounded-lg border-4 border-green-800 bg-white p-6">
                                <h3 className="mb-4 text-xl font-semibold text-green-900">
                                    Add Category
                                </h3>

                                <form onSubmit={handleAdd}>
                                    <div className="mb-4 flex gap-6 text-green-900">
                                        <label>
                                            <input
                                                type="radio"
                                                checked={type === "EXPENSE"}
                                                onChange={() => setType("EXPENSE")}
                                            />{" "}
                                            Expense
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                checked={type === "INCOME"}
                                                onChange={() => setType("INCOME")}
                                            />{" "}
                                            Income
                                        </label>
                                    </div>

                                    <div className="relative mb-3">
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onFocus={() => setNameFocused(true)}
                                            onBlur={() =>
                                                setTimeout(() => setNameFocused(false), 120)
                                            }
                                            placeholder="Category Name"
                                            className={inputBase}
                                        />

                                        {nameFocused && filteredSuggestions.length > 0 && (
                                            <div className="absolute z-50 mt-1 w-full rounded border border-gray-300 bg-white shadow-lg">
                                                {filteredSuggestions.map((s) => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            setName(s);
                                                        }}
                                                        className="block w-full px-3 py-2 text-left text-sm text-green-900 hover:bg-gray-100"
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {isDuplicateName && (
                                            <div className="mt-2 rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
                                                This category already exists for {type}.
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Description (Optional)"
                                        className={`${inputBase} mb-5`}
                                    />

                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddOpen(false)}
                                            className={grayBtn}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={!canSaveNew}
                                            className={greenBtn}
                                        >
                                            {saving ? "Saving..." : "Save Category"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}