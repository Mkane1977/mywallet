import { useEffect, useState } from "react";

export function NotePopover({ noteText }: { noteText: string }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        const onMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest("[data-note-popover]")) return;
            if (target.closest("[data-note-trigger]")) return;
            setOpen(false);
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("mousedown", onMouseDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("mousedown", onMouseDown);
        };
    }, [open]);

    return (
        <div className="relative">
            <button
                type="button"
                data-note-trigger
                onClick={() => setOpen((v) => !v)}
                className="cursor-pointer text-sm font-semibold text-green-900 underline underline-offset-2 hover:text-green-800"
            >
                View
            </button>

            {open && (
                <div
                    data-note-popover
                    className="absolute left-0 top-full z-40 mt-2 w-72 rounded-lg border border-gray-300 bg-white p-3 text-sm text-green-900 shadow-lg"
                >
                    <div className="mb-2 flex items-start justify-between gap-2">
                        <span className="font-semibold">Note</span>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="cursor-pointer rounded px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                        >
                            Close
                        </button>
                    </div>

                    <div className="whitespace-pre-wrap break-words text-green-900/90">{noteText}</div>
                </div>
            )}
        </div>
    );
}