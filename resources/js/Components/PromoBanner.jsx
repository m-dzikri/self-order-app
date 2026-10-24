/**
 * Opening promo scratch banner (RFC-003, F3 / UI-4 / UI-5): tilted ticket
 * sticker announcing the SKETCHKOPI opening voucher.
 */
export default function PromoBanner() {
    return (
        <div className="relative -rotate-[0.8deg] rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-promo)] p-4 shadow-[var(--shadow-tactile-md)]">
            <div className="flex items-center gap-3">
                <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)]"
                >
                    <span className="material-symbols-outlined text-[var(--color-promo)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        redeem
                    </span>
                </span>
                <div className="min-w-0">
                    <p className="text-[12px] font-extrabold uppercase tracking-wide text-[var(--color-surface)]">
                        Promo Spesial
                    </p>
                    <p className="text-[14px] leading-[20px] font-bold text-[var(--color-surface)]">
                        Diskon 10% pesanan pertama
                    </p>
                    <p className="mt-1 text-[12px] leading-[16px] font-bold text-[var(--color-surface)]">
                        Gunakan kupon:{' '}
                        <strong className="rounded bg-[var(--color-surface-container-lowest)] px-1.5 py-0.5 tracking-wider text-[var(--color-promo)]">
                            SKETCHKOPI
                        </strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
