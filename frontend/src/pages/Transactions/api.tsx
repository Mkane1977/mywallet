import { Category, Transaction, TransactionType } from "./types";
import { readErrorMessage, toNumber } from "./utils";


function requireUserId(userId: string) {
    if (!userId) throw new Error("Missing user session. Please log in again.");
}
// ============================
// CSV IMPORT API
// ============================

export async function previewCsvImport(
    userId: string,
    file: File,
    skipPending: boolean
) {
    if (!userId) throw new Error("Missing user session.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("skipPending", String(skipPending));

    const res = await fetch("/api/transactions/import/preview", {
        method: "POST",
        headers: {
            "X-USER-ID": userId,
        },
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Preview failed.");
    }

    return res.json();
}

export async function confirmCsvImport(
    userId: string,
    rows: any[],
    ignoreDuplicates: boolean
) {
    if (!userId) throw new Error("Missing user session.");

    const res = await fetch("/api/transactions/import/confirm", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-USER-ID": userId,
        },
        body: JSON.stringify({
            rows,
            ignoreDuplicates,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Import failed.");
    }

    return res.json();
}


export async function fetchCategories(userId: string): Promise<Category[]> {
    requireUserId(userId);

    const res = await fetch("/api/categories", {
        headers: { "X-USER-ID": userId },
    });

    if (!res.ok) throw new Error(await readErrorMessage(res));
    return (await res.json()) as Category[];
}

export type TransactionFilters = {
    type?: "ALL" | TransactionType;
    categoryId?: number | "";
    start?: string; // yyyy-mm-dd
    end?: string;   // yyyy-mm-dd
};

export async function fetchTransactions(userId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    requireUserId(userId);

    const qs = new URLSearchParams();

    const type = filters?.type;
    if (type && type !== "ALL") qs.set("type", type);

    const categoryId = filters?.categoryId;
    if (categoryId && Number(categoryId) > 0) qs.set("categoryId", String(categoryId));

    if (filters?.start) qs.set("start", filters.start);
    if (filters?.end) qs.set("end", filters.end);

    const url = qs.toString() ? `/api/transactions?${qs.toString()}` : "/api/transactions";

    const res = await fetch(url, {
        headers: { "X-USER-ID": userId },
    });

    if (!res.ok) throw new Error(await readErrorMessage(res));

    const raw: any[] = await res.json();

    const txs: Transaction[] = raw.map((t) => ({
        id: t.id,
        date: t.date,
        type: t.type,
        amount: toNumber(t.amount),
        description: t.description ?? null,
        note: t.note ?? null,
        categoryId: t.categoryId ?? t.category?.id ?? null,
        categoryName: t.categoryName ?? t.category?.name ?? null,
        category: t.category ?? null,
    }));

    txs.sort((a, b) => (a.date < b.date ? 1 : -1));
    return txs;
}

export async function createTransaction(
    userId: string,
    payload: {
        type: TransactionType;
        amount: number;
        categoryId: number;
        date: string;
        description: string | null;
    }
) {
    requireUserId(userId);

    const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-USER-ID": userId },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(await readErrorMessage(res));
}

export async function updateTransaction(
    userId: string,
    id: number,
    payload: {
        type: TransactionType;
        amount: number;
        categoryId: number;
        date: string;
        description: string | null;
    }
) {
    requireUserId(userId);

    const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-USER-ID": userId },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(await readErrorMessage(res));
}

export async function deleteTransaction(userId: string, id: number) {
    requireUserId(userId);

    const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
        headers: { "X-USER-ID": userId },
    });

    if (!res.ok) throw new Error(await readErrorMessage(res));




}