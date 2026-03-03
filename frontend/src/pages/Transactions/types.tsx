export type TransactionType = "INCOME" | "EXPENSE";

export type Category = {
    id: number;
    name: string;
    description: string | null;
    type: TransactionType;
};

export type Transaction = {
    id: number;
    date: string;
    type: TransactionType;
    amount: number;

    description?: string | null;
    note?: string | null;

    categoryId?: number | null;
    categoryName?: string | null;
    category?: { id: number; name: string } | null;
};

export type CsvPreviewRow = {
    rowNumber: number;
    status?: string | null;
    currency?: string | null;
    accountName?: string | null;

    date: string; // yyyy-mm-dd
    type: TransactionType;
    amount: number; // positive
    categoryName: string;
    description: string | null;

    duplicate: boolean;
    duplicateReason?: string | null;
    selected: boolean;
};

export type CsvPreviewResponse = {
    totalRows: number;
    parsedRows: number;
    duplicates: number;
    skipped: number;
    rows: CsvPreviewRow[];
    errors: string[];
};

export type ImportResult = {
    imported: number;
    skipped: number;
    duplicates: number;
    errors: string[];
};