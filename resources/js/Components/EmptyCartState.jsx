import { Link } from '@inertiajs/react';

/**
 * Empty state for cart when no items have been added (RFC-005, F15, TC-005-4).
 * Adheres to tactile sketchbook design system (UI-1 - UI-5).
 */
export default function EmptyCartState() {
    return (
        <div
            role="status"
            aria-live="polite"
            className="my-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-outline)] bg-[var(--color-surface-container-low)] p-8 text-center marker-shadow-md"
        >
            {/* Friendly Sad Cup Sketch Doodle */}
            <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] shadow-[2px_2px_0px_var(--color-ink)] -rotate-2">
                <svg
                    aria-hidden="true"
                    className="h-16 w-16"
                    fill="none"
                    stroke="var(--color-ink)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 64 64"
                >
                    {/* Cup Body */}
                    <path
                        d="M16 26h28v18a10 10 0 0 1-10 10H26a10 10 0 0 1-10-10V26Z"
                        fill="var(--color-surface-container-high)"
                    />
                    {/* Handle */}
                    <path d="M44 30h4a6 6 0 0 1 0 12h-4" />
                    {/* Sad/Sleeping Eyes and Wavy Mouth */}
                    <path d="M24 36c1-2 3-2 4 0M32 36c1-2 3-2 4 0" />
                    <path d="M26 44c2-1 4-1 6 0" />
                    {/* Little Doodle Question / Tear */}
                    <path d="M40 20c-1-3 2-5 0-7" stroke="var(--color-promo)" strokeWidth="2" />
                    {/* Saucer */}
                    <path d="M12 56h36" stroke="var(--color-primary)" strokeWidth="3" />
                </svg>
                {/* Washi tape accent on top-right */}
                <span className="absolute -top-2 -right-2 h-4 w-10 rotate-12 rounded-xs bg-[var(--color-primary)] opacity-85 shadow-xs" />
            </div>

            <h2 className="text-lg font-extrabold text-[var(--color-ink)]">
                Keranjangmu masih kosong nih!
            </h2>
            <p className="mt-1.5 max-w-xs text-xs font-semibold text-[var(--color-ink-soft)] leading-relaxed">
                Belum ada sketsa pesanan yang dipilih. Yuk jelajahi menu kopi spesial dan kudapan lezat kami!
            </p>

            <Link
                href="/katalog"
                className="btn-tactile mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-5 py-3 text-sm font-extrabold text-[var(--color-ink)] marker-shadow-md hover:bg-[var(--color-primary)] active:translate-x-0.5 active:translate-y-0.5"
            >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                    menu_book
                </span>
                + Mulai Pilih Menu
            </Link>
        </div>
    );
}
