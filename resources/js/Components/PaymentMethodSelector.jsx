/**
 * PaymentMethodSelector Component (RFC-006, F16).
 * Renders 3 selectable payment options: QRIS Instan, E-Wallet Langsung, Bayar di Kasir.
 * Adheres to tactile sketchbook design rules (UI-1, UI-4).
 */
export default function PaymentMethodSelector({ selectedMethod = 'qris', onChange }) {
    const options = [
        {
            id: 'qris',
            icon: '⚡',
            title: 'QRIS Instan',
            subtitle: 'BCA, GoPay, OVO, ShopeePay, Dana',
            badge: 'Scan & Bayar 15 Menit',
        },
        {
            id: 'ewallet',
            icon: '👛',
            title: 'E-Wallet Langsung',
            subtitle: 'Deeplink GoPay, ShopeePay atau OVO',
            badge: null,
        },
        {
            id: 'kasir',
            icon: '💵',
            title: 'Bayar di Kasir',
            subtitle: 'Tunai, Kartu Debit, atau EDC di meja kasir',
            badge: 'Menunggu Kasir',
        },
    ];

    return (
        <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-extrabold text-[var(--color-ink)]">
                    Pilih Cara Pembayaran
                </h3>
                <span className="text-[11px] font-bold text-[var(--color-promo)]">
                    Langsung Terverifikasi
                </span>
            </div>

            <div className="space-y-2" role="radiogroup" aria-label="Metode Pembayaran">
                {options.map((opt) => {
                    const isSelected = selectedMethod === opt.id;
                    return (
                        <label
                            key={opt.id}
                            onClick={() => onChange(opt.id)}
                            className={`relative flex cursor-pointer items-center justify-between rounded-xl border-2 border-[var(--color-ink)] p-3 transition-all ${
                                isSelected
                                    ? 'bg-[var(--color-primary)]/30 marker-shadow-md -rotate-0.5'
                                    : 'bg-[var(--color-surface-container-low)] marker-shadow-sm hover:bg-[var(--color-surface-container)]'
                            }`}
                        >
                            <input
                                type="radio"
                                name="payment_method"
                                value={opt.id}
                                checked={isSelected}
                                onChange={() => onChange(opt.id)}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-ink)] bg-[var(--color-primary)] text-lg shadow-[1.5px_1.5px_0px_var(--color-ink)]">
                                    {opt.icon}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-extrabold text-[var(--color-ink)]">
                                            {opt.title}
                                        </span>
                                        {opt.badge && isSelected ? (
                                            <span className="rounded bg-[var(--color-primary)] px-1.5 py-0.2 text-[9px] font-extrabold text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)]">
                                                {opt.badge}
                                            </span>
                                        ) : null}
                                    </div>
                                    <span className="text-[10px] text-[var(--color-ink-soft)]">
                                        {opt.subtitle}
                                    </span>
                                </div>
                            </div>

                            {/* Hand-drawn Radio Checked/Unchecked indicator */}
                            <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-ink)] transition-all ${
                                    isSelected
                                        ? 'bg-[var(--color-ink)] text-[var(--color-surface)] shadow-[1px_1px_0px_var(--color-ink)]'
                                        : 'bg-[var(--color-surface-container)]'
                                }`}
                            >
                                {isSelected ? (
                                    <span className="text-xs font-extrabold leading-none">✓</span>
                                ) : null}
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
