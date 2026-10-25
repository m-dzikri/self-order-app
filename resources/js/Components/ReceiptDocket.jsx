import { formatRupiah } from '../Utils/formatRupiah';

/**
 * Receipt Docket ("Nota Sementara Robek") - RFC-005, F14, TC-005-3.
 * Mimics physical ripped thermal paper receipt with perforation doodle line,
 * breakdown of subtotal, coupon discount, 10% PB1 tax, stabilo yellow highlighted total,
 * and authentic zigzag perforated bottom border.
 */
export default function ReceiptDocket({
    subtotal = 0,
    discount = 0,
    pb1Tax = 0,
    total = 0,
    totalQuantity = 0,
    couponCode = null,
    orderSession = {},
}) {
    const sessionLabel =
        orderSession?.type === 'dine_in' && orderSession?.table_number
            ? `Pesanan Meja ${orderSession.table_number} (Dine-In)`
            : 'Pesanan Bawa Pulang (Takeaway)';

    return (
        <div className="relative mb-6 rounded-t-xl border-2 border-b-0 border-[var(--color-ink)] bg-[#FFF1D6] px-4 pt-5 pb-7 marker-shadow-md">
            {/* Receipt Header */}
            <div className="pb-3 text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-soft)]">
                    Kopi Corat-Coret
                </div>
                <h3 className="mt-0.5 text-lg font-extrabold tracking-tight text-[var(--color-ink)]">
                    NOTA SEMENTARA
                </h3>
                <p className="mt-1 text-[11px] font-semibold text-[var(--color-ink-soft)]">
                    Dicetak otomatis dari {sessionLabel}
                </p>

                {/* Doodle Perforation Divider */}
                <div className="my-2.5 flex items-center justify-center overflow-hidden text-[var(--color-outline)]">
                    <span className="font-mono text-xs tracking-widest select-none whitespace-nowrap">
                        ~ - ~ - ~ - ~ - ~ - ~ - ~ - ~ - ~ - ~ - ~
                    </span>
                </div>
            </div>

            {/* Line Items Breakdown */}
            <div className="space-y-2 text-xs font-semibold text-[var(--color-ink)]">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                    <span>Subtotal ({totalQuantity} Item)</span>
                    <span className="font-bold">{formatRupiah(subtotal)}</span>
                </div>

                {/* Coupon Discount (if applied) */}
                {discount > 0 ? (
                    <div className="flex items-center justify-between font-bold text-[var(--color-promo)]">
                        <span className="flex items-center gap-1.5">
                            <span>Diskon Promo (10%)</span>
                            {couponCode ? (
                                <span className="rounded bg-[var(--color-primary)] px-1 py-0.2 text-[10px] font-extrabold text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)]">
                                    {couponCode}
                                </span>
                            ) : null}
                        </span>
                        <span>-{formatRupiah(discount)}</span>
                    </div>
                ) : null}

                {/* PB1 Resto Tax (10%) */}
                <div className="flex items-center justify-between text-[var(--color-ink-soft)]">
                    <span>PB1 Resto &amp; Kafe (10%)</span>
                    <span>{formatRupiah(pb1Tax)}</span>
                </div>

                {/* System Rounding */}
                <div className="flex items-center justify-between text-[var(--color-ink-soft)]">
                    <span>Pembulatan Sistem</span>
                    <span>Rp 0</span>
                </div>

                {/* Divider Line */}
                <div className="my-2 border-t-2 border-dashed border-[var(--color-outline)]" />

                {/* Total Bayar Highlight with Stabilo Background */}
                <div className="relative flex items-baseline justify-between pt-1">
                    <div className="flex flex-col">
                        <span className="text-base font-extrabold text-[var(--color-ink)]">
                            Total Bayar
                        </span>
                        <span className="text-[10px] text-[var(--color-ink-soft)]">
                            Sudah termasuk pajak resto
                        </span>
                    </div>

                    <div className="relative">
                        {/* Stabilo Yellow Highlighter Backdrop (UI-2, UI-5) */}
                        <span
                            aria-hidden="true"
                            className="absolute inset-x-0 -inset-y-1 -rotate-1 rounded-sm bg-[var(--color-primary)] shadow-[1.5px_1.5px_0px_var(--color-ink)] -z-0"
                        />
                        <span className="relative z-10 px-2 py-0.5 text-lg font-extrabold text-[var(--color-ink)]">
                            {formatRupiah(total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Authentic Zigzag Perforation Cut Border at Bottom (UI-5) */}
            <div className="absolute -bottom-3 left-[-2px] right-[-2px] h-3 overflow-hidden pointer-events-none">
                <svg
                    className="h-3 w-full fill-[#FFF1D6]"
                    preserveAspectRatio="none"
                    viewBox="0 0 120 12"
                >
                    <path d="M0,0 L5,12 L10,0 L15,12 L20,0 L25,12 L30,0 L35,12 L40,0 L45,12 L50,0 L55,12 L60,0 L65,12 L70,0 L75,12 L80,0 L85,12 L90,0 L95,12 L100,0 L105,12 L110,0 L115,12 L120,0 V12 H0 Z" />
                </svg>
            </div>
        </div>
    );
}
