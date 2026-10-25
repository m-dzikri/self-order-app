/**
 * EmptyMenuState Component (RFC-004 F7):
 * Friendly sketchbook sad-cup illustration when search returns zero results.
 */
export default function EmptyMenuState({ searchQuery = '', onReset }) {
    return (
        <div
            className="my-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-outline)] bg-[var(--color-surface-container-low)] p-6 text-center marker-shadow-sm"
            role="status"
            aria-live="polite"
        >
            <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-surface-container)] text-3xl marker-shadow-sm -rotate-3">
                ☕
                <span className="absolute -bottom-1 -right-1 text-sm">💧</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--color-ink)]">
                Menu tidak ditemukan!
            </h3>
            <p className="mt-1 max-w-xs text-sm text-[var(--color-ink-soft)]">
                {searchQuery ? (
                    <>
                        Kata kunci <span className="font-bold underline decoration-wavy decoration-[var(--color-promo)]">"{searchQuery}"</span> belum digambar di menu. Coba cari kudapan lain!
                    </>
                ) : (
                    'Belum ada menu di kategori ini. Coba cek kategori lainnya ya!'
                )}
            </p>
            {onReset && searchQuery ? (
                <button
                    type="button"
                    onClick={onReset}
                    className="btn-tactile mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-4 py-2 font-bold text-sm text-[var(--color-ink)]"
                >
                    Tampilkan Semua Menu
                </button>
            ) : null}
        </div>
    );
}
