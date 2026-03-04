import { DashboardSummaryResponse, RecentTransactionResponse } from "./types";
import { readErrorMessage, toNumber } from "./utils";


export async function fetchCategoryBreakdown(params: {
    userId: string;
    categoryId: number;
    limit?: number;
    start?: string;
    end?: string;
}): Promise<RecentTransactionResponse[]> {
    const { userId, categoryId, limit, start, end } = params;

    if (!userId) throw new Error("Missing user session. Please log in again.");

    const qs = new URLSearchParams();
    qs.set("categoryId", String(categoryId));
    qs.set("limit", String(Math.max(1, limit ?? 50)));
    if (start) qs.set("start", start);
    if (end) qs.set("end", end);

    const res = await fetch(`/api/dashboard/category-breakdown?${qs.toString()}`, {
        headers: { "X-USER-ID": userId },
    });

    if (!res.ok) throw new Error(await readErrorMessage(res));

    const raw = (await res.json()) as any[];

    return (raw ?? []).map((t: any) => ({
        ...t,
        amount: toNumber(t.amount),
    }));
}

export async function fetchTransactionsPage(params: {

    userId: string;
    type?: "INCOME" | "EXPENSE";
    start?: string;
    end?: string;
    page?: number;
    size?: number;
    sort?: string; //  "date,desc"
}): Promise<{ content: RecentTransactionResponse[]; totalElements: number }> {
    const { userId, type, start, end, page = 0, size = 50, sort = "date,desc" } = params;

    if (!userId) throw new Error("Missing user session. Please log in again.");

    const qs = new URLSearchParams();
    if (type) qs.set("type", type);
    if (start) qs.set("start", start);
    if (end) qs.set("end", end);
    qs.set("page", String(page));
    qs.set("size", String(size));
    qs.set("sort", sort);

    const res = await fetch(`/api/transactions?${qs.toString()}`, {
        headers: { "X-USER-ID": userId },
    });
    if (!res.ok) throw new Error(await readErrorMessage(res));

    const raw = await res.json(); // Spring Page JSON
    const content = (raw.content ?? []).map((t: any) => ({
        ...t,
        amount: toNumber(t.amount),
    }));

    return { content, totalElements: raw.totalElements ?? content.length };
}


export async function fetchDashboardSummary(params: {
    userId: string;
    start?: string;
    end?: string;
    recentLimit: number;
}): Promise<DashboardSummaryResponse> {
    const { userId, start, end, recentLimit } = params;

    if (!userId) throw new Error("Missing user session. Please log in again.");

    const qs = new URLSearchParams();
    if (start) qs.set("start", start);
    if (end) qs.set("end", end);
    qs.set("recentLimit", String(Math.max(1, recentLimit || 5)));

    const res = await fetch(`/api/dashboard?${qs.toString()}`, {
        headers: { "X-USER-ID": userId },
    });

    if (!res.ok) throw new Error(await readErrorMessage(res));

    const raw = (await res.json()) as DashboardSummaryResponse;

    return {
        totalIncome: toNumber((raw as any).totalIncome),
        totalExpenses: toNumber((raw as any).totalExpenses),
        netBalance: toNumber((raw as any).netBalance),
        spendingByCategory: (raw.spendingByCategory ?? []).map((c: any) => ({
            id: c.id,
            name: c.name,
            total: toNumber(c.total),
        })),
        recentTransactions: (raw.recentTransactions ?? []).map((t: any) => ({
            ...t,
            amount: toNumber(t.amount),
        })),
    };
}

// Sorting types
export type RecentSortKey = "date" | "category" | "type" | "amount";
export type SortDir = "asc" | "desc";

// Server-side sorting + optional category filter
export async function fetchRecentTransactions(params: {
    userId: string;
    limit: number;
    start?: string;
    end?: string;
    categoryId?: number | null;
    type?: "INCOME" | "EXPENSE";
    sort?: RecentSortKey;
    dir?: SortDir;
}): Promise<RecentTransactionResponse[]> {
    const { userId, limit, start, end, categoryId, type, sort, dir } = params;

    if (!userId) throw new Error("Missing user session. Please log in again.");

    // Map UI sort keys to backend fields (Transaction entity fields)
    const sortField =
        sort === "category" ? "category.name" : //  works only if JPA sorting supports join path
            sort === "amount" ? "amount" :
                sort === "type" ? "type" :
                    "date";


    const effectiveSortField = sort === "category" ? "date" : sortField;

    const qs = new URLSearchParams();
    qs.set("page", "0");
    qs.set("size", String(Math.max(1, limit || 5)));
    qs.set("sort", `${effectiveSortField},${dir ?? "desc"}`);

    if (start) qs.set("start", start);
    if (end) qs.set("end", end);
    if (categoryId != null) qs.set("categoryId", String(categoryId));
    if (type) qs.set("type", type);

    const res = await fetch(`/api/transactions?${qs.toString()}`, {
        headers: { "X-USER-ID": userId },
    });

    if (!res.ok) throw new Error(await readErrorMessage(res));

    const page = await res.json();
    const raw: any[] = (page?.content ?? []) as any[];

    return raw.map((t: any) => ({
        ...t,
        amount: toNumber(t.amount),
    }));





}