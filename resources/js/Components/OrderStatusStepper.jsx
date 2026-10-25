import React from 'react';

/**
 * Visual Tactile Stepper for Real-Time Order Tracking (RFC-007, F21, UI-1, UI-4, DATA-4).
 * Reflects stages: unpaid_cashier -> confirmed -> in_progress -> ready -> completed.
 */
export default function OrderStatusStepper({ status, paymentMethod, sessionType, tableNumber, createdAt }) {
    const isCashierFlow = paymentMethod === 'kasir' || status === 'unpaid_cashier';

    // Define sequence based on payment method
    const steps = isCashierFlow
        ? [
              {
                  key: 'unpaid_cashier',
                  title: 'Menunggu Kasir',
                  desc: 'Tunjukkan nomor pesanan ke kasir untuk menyelesaikan pembayaran.',
                  icon: 'point_of_sale',
                  progressPercent: 20,
                  activeBadge: 'Menunggu Pembayaran',
              },
              {
                  key: 'confirmed',
                  title: 'Pesanan Diterima',
                  desc: 'Pembayaran terverifikasi, struk masuk antrean dapur & barista.',
                  icon: 'receipt_long',
                  progressPercent: 40,
                  activeBadge: 'Antrean Dapur',
              },
              {
                  key: 'in_progress',
                  title: 'Sedang Diracik',
                  desc: 'Barista sedang meracik kopi dan menyiapkan hidanganmu dengan sepenuh hati.',
                  icon: 'coffee_maker',
                  progressPercent: 75,
                  activeBadge: 'Sedang Diracik',
              },
              {
                  key: 'ready',
                  title: sessionType === 'dine_in' && tableNumber ? `Siap Diantar ke Meja ${tableNumber}` : 'Siap Diambil di Konter',
                  desc: sessionType === 'dine_in' ? 'Pelayan kafe sedang membawa pesanan langsung ke mejamu.' : 'Pesananmu sudah siap di konter pengambilan.',
                  icon: 'notifications_active',
                  progressPercent: 95,
                  activeBadge: 'Siap Disajikan!',
              },
              {
                  key: 'completed',
                  title: 'Selesai & Dinikmati',
                  desc: 'Selamat menyeruput dan berkreasi di Kopi Corat-Coret!',
                  icon: 'sentiment_very_satisfied',
                  progressPercent: 100,
                  activeBadge: 'Selesai',
              },
          ]
        : [
              {
                  key: 'confirmed',
                  title: 'Pesanan Diterima',
                  desc: 'Struk pesanan sudah masuk antrean peracikan barista & dapur.',
                  icon: 'receipt_long',
                  progressPercent: 30,
                  activeBadge: 'Pesanan Diterima',
              },
              {
                  key: 'in_progress',
                  title: 'Sedang Diracik',
                  desc: 'Barista sedang menuang susu dan mengaduk racikan spesial pilihanmu.',
                  icon: 'coffee_maker',
                  progressPercent: 70,
                  activeBadge: 'Sedang Diracik',
              },
              {
                  key: 'ready',
                  title: sessionType === 'dine_in' && tableNumber ? `Siap Diantar ke Meja ${tableNumber}` : 'Siap Diambil di Konter',
                  desc: sessionType === 'dine_in' ? 'Pelayan kafe akan membawa pesanan langsung ke mejamu.' : 'Silakan ambil pesanan hangatmu di konter bar.',
                  icon: 'notifications_active',
                  progressPercent: 95,
                  activeBadge: 'Siap Disajikan!',
              },
              {
                  key: 'completed',
                  title: 'Selesai & Dinikmati',
                  desc: 'Selamat menyeruput dan berkreasi di Kopi Corat-Coret!',
                  icon: 'sentiment_very_satisfied',
                  progressPercent: 100,
                  activeBadge: 'Selesai',
              },
          ];

    // Find current active index
    const activeIndex = Math.max(0, steps.findIndex((s) => s.key === status));
    const currentStep = steps[activeIndex] || steps[0];

    return (
        <div className="rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] p-4 marker-shadow">
            {/* Header info */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[var(--color-ink)]">Proses Racikan</span>
                    <span className="inline-block -rotate-1 rounded-full border border-[var(--color-ink)] bg-[var(--color-primary-container)] px-2 py-0.5 text-[11px] font-extrabold text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)]">
                        Tahap {activeIndex + 1} dari {steps.length}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-promo)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-promo)] animate-ping" />
                    <span>Live Update</span>
                </div>
            </div>

            {/* Stepper list */}
            <div className="relative space-y-3.5 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-1 before:rounded-full before:bg-[var(--color-outline-variant)]">
                {steps.map((step, idx) => {
                    const isCompleted = idx < activeIndex;
                    const isActive = idx === activeIndex;
                    const isUpcoming = idx > activeIndex;

                    if (isActive) {
                        return (
                            <div
                                key={step.key}
                                className="relative flex items-start gap-3.5 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary-container)]/30 p-3 shadow-[2px_2px_0px_var(--color-ink)] -rotate-0.5 transition-all"
                            >
                                <div className="relative z-10 flex h-10 w-10 min-w-[40px] items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-primary-container)] shadow-[2px_2px_0px_var(--color-ink)] animate-bounce">
                                    <span className="material-symbols-outlined text-[22px] text-[var(--color-ink)]">
                                        {step.icon}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-extrabold text-[var(--color-ink)]">{step.title}</span>
                                        <span className="inline-block rotate-1 rounded-full border border-[var(--color-ink)] bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-on-primary)] shadow-[1px_1px_0px_var(--color-ink)] animate-pulse">
                                            {step.activeBadge}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink)]">{step.desc}</p>

                                    {/* Progress bar */}
                                    <div className="mt-2.5 flex items-center gap-2">
                                        <div className="h-2.5 w-full overflow-hidden rounded-full border border-[var(--color-ink)] bg-[var(--color-surface-container-highest)]">
                                            <div
                                                className="h-full rounded-full bg-[var(--color-primary-container)] transition-all duration-700"
                                                style={{ width: `${step.progressPercent}%` }}
                                            />
                                        </div>
                                        <span className="whitespace-nowrap text-[11px] font-extrabold text-[var(--color-ink)]">
                                            {step.progressPercent}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    if (isCompleted) {
                        return (
                            <div key={step.key} className="relative flex items-start gap-3.5 pt-0.5">
                                <div className="relative z-10 flex h-10 w-10 min-w-[40px] items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[#d2e7d6] shadow-[2px_2px_0px_var(--color-ink)]">
                                    <span className="material-symbols-outlined text-[20px] text-[var(--color-ink)] font-bold">
                                        {step.icon}
                                    </span>
                                    <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--color-ink)] bg-[var(--color-promo)] text-white shadow-xs">
                                        <span className="material-symbols-outlined text-[10px] font-black">check</span>
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1 pt-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-extrabold text-[var(--color-ink)] line-through opacity-70">
                                            {step.title}
                                        </span>
                                        <span className="rounded bg-[var(--color-surface-container)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--color-ink-soft)]">
                                            Lengkap ✓
                                        </span>
                                    </div>
                                    <p className="text-xs text-[var(--color-ink-soft)]">{step.desc}</p>
                                </div>
                            </div>
                        );
                    }

                    // Upcoming step
                    return (
                        <div key={step.key} className="relative flex items-start gap-3.5 opacity-55 pt-0.5">
                            <div className="relative z-10 flex h-10 w-10 min-w-[40px] items-center justify-center rounded-full border border-[var(--color-outline)] bg-[var(--color-surface-container-high)] shadow-[1.5px_1.5px_0px_var(--color-outline)]">
                                <span className="material-symbols-outlined text-[20px] text-[var(--color-ink-soft)]">
                                    {step.icon}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1">
                                <span className="font-bold text-[var(--color-ink)]">{step.title}</span>
                                <p className="text-xs text-[var(--color-ink-soft)]">{step.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
