import { Transaction } from "./types";

export async function readErrorMessage(response: Response) {
    try {
        const data = await response.json();
        if (data && typeof data.message === "string") return data.message;
        return `Request failed (${response.status})`;
    } catch {
        try {
            const text = await response.text();
            return text || `Request failed (${response.status})`;
        } catch {
            return `Request failed (${response.status})`;
        }
    }
}

export function toNumber(v: any): number {
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
    return 0;
}

export function safeDate(d?: string) {
    return (d ?? "").slice(0, 10);
}

export function formatMoney(n: number) {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function normalizeNote(t: Transaction): string {
    return ((t.description ?? t.note ?? "") as string).trim();
}