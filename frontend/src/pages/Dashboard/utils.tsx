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

export function formatMoney(n: number) {
    const safe = Number.isFinite(n) ? n : 0;
    return safe.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function safeDate(d?: string) {
    return (d ?? "").slice(0, 10);
}

// Green palette (light to dark) for donut slices
export const GREEN_PIE_COLORS = [
    "#e8f5e9",
    "#c8e6c9",
    "#a5d6a7",
    "#81c784",
    "#66bb6a",
    "#4caf50",
    "#43a047",
    "#2e7d32",
    "#1b5e20",
];

// Single bar fill
export const GREEN_BAR_FILL = "#2e7d32";