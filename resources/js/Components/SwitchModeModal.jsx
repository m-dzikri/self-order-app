import React from 'react';
import { router } from '@inertiajs/react';

/**
 * SwitchModeModal: Tactile sketchbook modal for switching between Dine-In and Takeaway mode.
 * Replaces browser's native window.confirm() dialog with on-brand theme.
 */
export default function SwitchModeModal({ isOpen, onClose, currentTableNumber, onOpenScanner }) {
    if (!isOpen) return null;

    const handleSwitchToTakeaway = () => {
        router.post(
            '/session/switch-mode',
            { mode: 'takeaway' },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/60 p-4 backdrop-blur-xs animate-fadeIn"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-[360px] rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] p-5 marker-shadow-lg text-center animate-scaleUp">
                {/* Washi Tape Header Decoration */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 -rotate-1 rounded-sm border border-[var(--color-ink)] bg-[var(--color-primary)] px-4 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)] select-none">
                    Ganti Mode Pesanan ☕
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup dialog"
                    className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-ink)] bg-[var(--color-surface-container)] text-[var(--color-ink)] hover:bg-[var(--color-surface-container-high)] active:scale-95 transition-all cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                </button>

                {/* Icon Illustration */}
                <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-secondary-container)] shadow-[2px_2px_0px_var(--color-ink)] -rotate-2">
                    <span className="material-symbols-outlined text-[30px] text-[var(--color-ink)]">
                        shopping_bag
                    </span>
                </div>

                {/* Title & Description */}
                <h3 className="mt-3.5 font-headline text-base font-extrabold text-[var(--color-ink)]">
                    Beralih ke Bawa Pulang?
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-ink-soft)] px-2">
                    Pesanan Anda saat ini tercatat untuk <span className="font-extrabold text-[var(--color-ink)]">Meja {currentTableNumber}</span>. 
                    Jika beralih ke <span className="font-extrabold text-[var(--color-promo)]">Takeaway</span>, pesanan akan disiapkan untuk diambil di konter bar.
                </p>

                {/* Action Buttons */}
                <div className="mt-5 space-y-2">
                    <button
                        type="button"
                        onClick={handleSwitchToTakeaway}
                        className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-4 py-2.5 text-xs font-black text-[var(--color-ink)] marker-shadow hover:bg-[var(--color-primary-dim)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                        <span>Ya, Ganti ke Bawa Pulang (Takeaway)</span>
                    </button>

                    {onOpenScanner && (
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onOpenScanner();
                            }}
                            className="flex w-full min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-[var(--color-ink)] bg-[var(--color-surface)] px-4 py-2 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-container)] active:scale-98 transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
                            <span>Pindai / Pindah Meja Lain</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full min-h-[38px] items-center justify-center rounded-xl border border-[var(--color-ink)] bg-[var(--color-surface-container)] px-4 py-2 text-xs font-bold text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-container-high)] active:scale-98 transition-all cursor-pointer"
                    >
                        <span>Tetap di Meja {currentTableNumber}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
