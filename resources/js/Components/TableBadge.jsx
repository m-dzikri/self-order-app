/**
 * Sticker table badge (RFC-003, F1 / UI-4 / UI-5): tilted sticker with a
 * hand-drawn pin doodle, locking the dine-in table number (ARCH-4).
 */
export default function TableBadge({ tableNumber }) {
    return (
        <div className="mb-4 flex justify-center">
            <div className="relative -rotate-[1.5deg] rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-6 py-3 shadow-[var(--shadow-tactile-md)]">
                {/* Push-pin doodle (UI-5), hand-drawn stroke */}
                <svg
                    aria-hidden="true"
                    className="absolute -top-4 left-1/2 -translate-x-1/2 select-none"
                    fill="none"
                    height="28"
                    stroke="var(--color-promo)"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    width="28"
                >
                    <circle cx="12" cy="8" r="4.5" />
                    <path d="M12 12.5V21" />
                </svg>
                <p className="text-center text-[28px] leading-[36px] font-extrabold tracking-wide">
                    MEJA {tableNumber}
                </p>
            </div>
        </div>
    );
}
