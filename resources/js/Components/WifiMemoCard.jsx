import { useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '../Utils/copyToClipboard';

/**
 * Wi-Fi memo sticky note (RFC-003, F3) with one-tap password copy
 * (F4 / FR-29): tapping the password chip copies it and stamps
 * a "Tersalin! ✨" doodle over the note for a moment.
 */
export default function WifiMemoCard({ ssid = 'CoratCoret_Guest', password = 'ngopiyuk123' }) {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const handleCopy = async () => {
        const ok = await copyToClipboard(password);
        if (!ok) return;

        setCopied(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 1600);
    };

    return (
        <div className="relative rotate-[0.5deg] rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] p-4 shadow-[var(--shadow-tactile-md)]">
            {/* Washi tape holding the memo to the page (UI-5) */}
            <div
                aria-hidden="true"
                className="absolute -top-2.5 left-1/2 h-4 w-20 -translate-x-1/2 rotate-1 rounded-sm bg-[var(--color-primary)] opacity-80"
            />

            <div className="flex items-start justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-[var(--color-primary)]">
                        wifi
                    </span>
                    <div className="flex flex-col">
                        <span className="text-[12px] font-bold uppercase text-[var(--color-outline)]">
                            Koneksi Kafe
                        </span>
                        <span className="text-[14px] font-extrabold">{ssid}</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex flex-col items-end rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] px-2.5 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
                >
                    <span className="text-[12px] font-bold text-[var(--color-outline)]">Sandi</span>
                    <span className="text-[14px] font-extrabold tracking-wide text-[var(--color-on-primary)] select-all">
                        {password}
                    </span>
                </button>
            </div>

            {/* "Tersalin!" stamp doodle (F4 feedback) */}
            {copied && (
                <p
                    aria-live="polite"
                    className="pointer-events-none absolute -right-2 -top-3 rotate-[-8deg] rounded-lg border-2 border-[var(--color-promo)] bg-[var(--color-surface)] px-3 py-1 text-[16px] font-extrabold text-[var(--color-promo)]"
                    role="status"
                >
                    Tersalin! ✨
                </p>
            )}
        </div>
    );
}
