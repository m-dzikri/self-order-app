/**
 * SearchBar Component (RFC-004 F6):
 * Real-time instant search input with clear button and tactile sketchbook shadow.
 */
export default function SearchBar({ value, onChange, onClear, placeholder = 'Cari kopi, mie, atau camilan favoritmu...' }) {
    return (
        <div className="relative w-full">
            <div className="relative flex w-full items-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] p-1.5 marker-shadow-md transition-transform focus-within:translate-x-0.5 focus-within:translate-y-0.5">
                <div className="flex items-center justify-center pl-2.5 pr-1.5 text-[var(--color-ink)]">
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
                    </svg>
                </div>
                <input
                    id="menu-search-input"
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent px-2 py-1.5 font-semibold text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)]/60 focus:outline-none"
                    aria-label="Pencarian menu"
                />
                {value ? (
                    <button
                        id="clear-search-btn"
                        type="button"
                        onClick={onClear}
                        title="Bersihkan pencarian"
                        aria-label="Bersihkan pencarian"
                        className="mr-1 flex h-8 w-8 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-high)] text-[var(--color-ink)] marker-shadow-sm transition-all hover:bg-[var(--color-surface-dim)] active:translate-x-0.5 active:translate-y-0.5"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                        </svg>
                    </button>
                ) : null}
            </div>
        </div>
    );
}
