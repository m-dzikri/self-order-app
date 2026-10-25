import { formatRupiah } from '../Utils/formatRupiah';

/**
 * CashierInstructionModal Component (RFC-006, F19, TC-006-4).
 * Displays order code, amount due, and step-by-step instructions
 * for paying cash or card at the cashier counter.
 */
export default function CashierInstructionModal({
    isOpen,
    order,
    onClose,
    onViewTracker,
}) {
    if (!isOpen || !order) return null;

    const isDineIn = order.session_type === 'dine_in' && order.table_number;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cashier-title"
        >
            <div className="relative w-full max-w-[400px] overflow-hidden rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] p-5 marker-shadow-lg">
                {/* Washi tape topper */}
                <div
                    aria-hidden="true"
                    className="absolute -top-3 left-1/2 h-4 w-24 -translate-x-1/2 rotate-1 rounded-xs bg-[var(--color-primary)] opacity-85 shadow-xs pointer-events-none"
                />

                {/* Header */}
                <div className="mb-4 text-center">
                    <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-container)] text-3xl shadow-[2px_2px_0px_var(--color-ink)] -rotate-3">
                        💵
                    </div>
                    <span className="rounded-full border border-[var(--color-ink)] bg-[var(--color-primary)] px-2.5 py-0.5 text-[10px] font-extrabold text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)]">
                        Status: Menunggu Pembayaran di Kasir
                    </span>
                    <h2 id="cashier-title" className="mt-2 text-lg font-extrabold text-[var(--color-ink)]">
                        Pesanan Telah Dicatat!
                    </h2>
                    <p className="text-xs font-semibold text-[var(--color-ink-soft)]">
                        {isDineIn
                            ? `Pesanan untuk Meja ${order.table_number}`
                            : 'Pesanan untuk Bawa Pulang (Takeaway)'}
                    </p>
                </div>

                {/* Order Code Highlight Note */}
                <div className="mb-4 rounded-xl border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-surface-container-low)] p-3 text-center">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-ink-soft)]">
                        Kode Pesanan Anda
                    </span>
                    <span className="mt-1 block text-2xl font-extrabold tracking-wider text-[var(--color-promo)]">
                        {order.order_code}
                    </span>
                    <div className="mt-2 border-t border-dashed border-[var(--color-outline)] pt-2 text-xs font-bold text-[var(--color-ink)]">
                        Total Bayar: <span className="font-extrabold">{formatRupiah(order.total)}</span>
                    </div>
                </div>

                {/* Instruction steps */}
                <div className="space-y-2 rounded-xl border border-[var(--color-ink)] bg-[var(--color-surface-container)] p-3.5 text-xs text-[var(--color-ink)]">
                    <p className="font-extrabold text-[var(--color-ink)]">
                        📋 Petunjuk Pembayaran:
                    </p>
                    <div className="space-y-1.5 text-[11px] font-semibold text-[var(--color-ink-soft)]">
                        <p>1. Datangi meja kasir / barista bar kami.</p>
                        <p>2. Tunjukkan atau sebutkan kode <span className="font-bold text-[var(--color-ink)]">{order.order_code}</span>.</p>
                        <p>3. Bayar tunai, kartu debit, atau EDC. Staf akan langsung memproses pesananmu!</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 space-y-2">
                    <button
                        type="button"
                        onClick={onViewTracker}
                        className="btn-tactile flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-extrabold text-[var(--color-ink)] marker-shadow-md hover:bg-[var(--color-primary)] active:translate-y-0.5"
                    >
                        <span>Lihat Status Pesanan</span>
                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                            arrow_forward
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-tactile w-full rounded-xl border border-[var(--color-ink)] bg-[var(--color-surface-container-low)] py-2 text-xs font-bold text-[var(--color-ink)] shadow-[1.5px_1.5px_0px_var(--color-ink)] hover:bg-[var(--color-surface-container)]"
                    >
                        Tutup &amp; Pesan Lagi
                    </button>
                </div>
            </div>
        </div>
    );
}
