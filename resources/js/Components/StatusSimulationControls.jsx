import React, { useState } from 'react';

/**
 * StatusSimulationControls: Interactive status simulation toolbar for Demo & Testing mode
 * (RFC-007, F22, TC-007-4).
 */
export default function StatusSimulationControls({ currentStatus, orderCode, onStatusChange }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);

    const stages = [
        { key: 'unpaid_cashier', label: '1. Kasir', color: 'bg-amber-100 text-amber-900 border-amber-800' },
        { key: 'confirmed', label: '2. Diterima', color: 'bg-blue-100 text-blue-900 border-blue-800' },
        { key: 'in_progress', label: '3. Diracik', color: 'bg-orange-100 text-orange-900 border-orange-800' },
        { key: 'ready', label: '4. Siap', color: 'bg-emerald-100 text-emerald-900 border-emerald-800' },
        { key: 'completed', label: '5. Selesai', color: 'bg-stone-200 text-stone-800 border-stone-800' },
    ];

    const handleSelectStatus = async (statusKey) => {
        setIsSimulating(true);
        try {
            const tokenMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = tokenMeta ? tokenMeta.getAttribute('content') : '';

            const res = await fetch(`/order/${encodeURIComponent(orderCode)}/simulate-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ status: statusKey }),
            });

            if (res.ok) {
                const data = await res.json();
                if (onStatusChange) {
                    onStatusChange(data.status);
                }
            }
        } catch (e) {
            console.error('Simulation error', e);
        } finally {
            setIsSimulating(false);
        }
    };

    return (
        <div className="fixed bottom-3 left-4 right-4 z-40 mx-auto max-w-[440px]">
            <div className="rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] p-3 marker-shadow-lg transition-all">
                {/* Header toggle */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 text-left"
                    >
                        <span className="material-symbols-outlined text-[18px] text-[var(--color-promo)] animate-spin">
                            settings
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold uppercase tracking-wide text-[var(--color-ink)]">
                                Mode Simulasi Demo (F22)
                            </span>
                            <span className="rounded bg-[var(--color-primary-container)] px-1.5 py-0.2 text-[10px] font-extrabold text-[var(--color-ink)]">
                                {currentStatus}
                            </span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-surface-container)]"
                    >
                        <span className="material-symbols-outlined text-[16px]">
                            {isExpanded ? 'expand_more' : 'expand_less'}
                        </span>
                    </button>
                </div>

                {/* Expanded controls */}
                {isExpanded && (
                    <div className="mt-3 border-t border-dashed border-[var(--color-outline-variant)] pt-2.5">
                        <p className="mb-2 text-[11px] font-bold text-[var(--color-ink-soft)]">
                            Klik status di bawah untuk menguji perubahan animasi stepper secara instan:
                        </p>
                        <div className="grid grid-cols-5 gap-1.5">
                            {stages.map((st) => {
                                const isActive = currentStatus === st.key;
                                return (
                                    <button
                                        key={st.key}
                                        type="button"
                                        disabled={isSimulating}
                                        onClick={() => handleSelectStatus(st.key)}
                                        className={`rounded-lg border-2 p-1.5 text-center text-[10px] font-extrabold transition-all ${
                                            isActive
                                                ? 'border-[var(--color-ink)] bg-[var(--color-primary)] text-white shadow-[2px_2px_0px_var(--color-ink)]'
                                                : `${st.color} hover:opacity-90 active:translate-y-0.5`
                                        }`}
                                    >
                                        {st.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
