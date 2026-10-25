import { useState } from 'react';
import { formatRupiah } from '../Utils/formatRupiah';

/**
 * Coupon Promo Input Box (RFC-005, F13, TC-005-2).
 * Allows users to input promotional vouchers (SKETCHKOPI for 10% discount)
 * with tactile doodle voucher styling and instant visual feedback.
 */
export default function CouponInputBox({
    appliedCoupon,
    discountAmount = 0,
    onApplyCoupon,
    onRemoveCoupon,
}) {
    const [couponInput, setCouponInput] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleApply = (e) => {
        e?.preventDefault();
        const cleaned = couponInput.trim().toUpperCase();

        if (!cleaned) {
            setErrorMessage('Silakan ketik kode kupon terlebih dahulu.');
            return;
        }

        if (cleaned === 'SKETCHKOPI') {
            onApplyCoupon(cleaned);
            setErrorMessage('');
            setIsEditing(false);
            setCouponInput('');
        } else {
            setErrorMessage('Kode kupon tidak valid. Coba gunakan: SKETCHKOPI');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setErrorMessage('');
        setCouponInput('');
    };

    return (
        <div className="relative overflow-hidden rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] p-3.5 marker-shadow-md">
            {/* Header Voucher */}
            <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--color-ink)]">
                    <span aria-hidden="true" className="material-symbols-outlined text-[17px] text-[var(--color-promo)]">
                        confirmation_number
                    </span>
                    Kupon Diskon Corat-Coret
                </span>
                {appliedCoupon && !isEditing ? (
                    <span className="rounded-full border border-[var(--color-ink)] bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-ink)] rotate-1 shadow-[1px_1px_0px_var(--color-ink)]">
                        1 Kupon Terpasang
                    </span>
                ) : null}
            </div>

            {appliedCoupon && !isEditing ? (
                /* Active / Applied Coupon View */
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex flex-1 items-center justify-between rounded-lg border border-[var(--color-ink)] bg-[var(--color-surface-container)] px-3 py-2 shadow-inner">
                            <div className="flex items-center gap-2">
                                <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--color-ink)]">
                                    sell
                                </span>
                                <span className="font-extrabold tracking-wider text-sm text-[var(--color-ink)]">
                                    {appliedCoupon}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={onRemoveCoupon}
                                aria-label="Batalkan kupon promo"
                                className="flex h-6 w-6 items-center justify-center rounded text-sm font-bold text-[var(--color-promo)] hover:bg-[var(--color-surface-container-high)]"
                            >
                                ✕
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(true);
                                setCouponInput(appliedCoupon);
                            }}
                            className="btn-tactile rounded-lg border border-[var(--color-ink)] bg-[var(--color-surface-container)] px-3.5 py-2 text-xs font-extrabold text-[var(--color-ink)] shadow-[2px_2px_0px_var(--color-ink)] hover:bg-[var(--color-surface-container-high)] active:translate-y-0.5"
                        >
                            Ganti
                        </button>
                    </div>

                    {/* Green Savings Celebration Badge */}
                    <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-[var(--color-ink)] bg-[#D1F2D9] px-2.5 py-1.5 text-xs font-bold text-[#19632C] shadow-[1.5px_1.5px_0px_var(--color-ink)]">
                        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                            celebration
                        </span>
                        <span>
                            Asyik! Kamu hemat {formatRupiah(discountAmount)} dari kupon ini! 🎉
                        </span>
                    </div>
                </div>
            ) : (
                /* Coupon Input Form View */
                <form onSubmit={handleApply} className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={couponInput}
                                onChange={(e) => {
                                    setCouponInput(e.target.value.toUpperCase());
                                    if (errorMessage) setErrorMessage('');
                                }}
                                placeholder="Contoh: SKETCHKOPI"
                                aria-label="Masukkan kode kupon"
                                className="w-full rounded-lg border-2 border-[var(--color-ink)] bg-[var(--color-surface)] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] placeholder:text-[var(--color-outline)] focus:border-[var(--color-promo)] focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-tactile rounded-lg border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-4 py-2 text-xs font-extrabold text-[var(--color-ink)] shadow-[2px_2px_0px_var(--color-ink)] hover:bg-[var(--color-primary)] active:translate-y-0.5"
                        >
                            Pasang
                        </button>

                        {isEditing ? (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="rounded-lg border border-[var(--color-ink)] bg-[var(--color-surface-container)] px-2.5 py-2 text-xs font-bold text-[var(--color-ink)]"
                            >
                                Batal
                            </button>
                        ) : null}
                    </div>

                    {errorMessage ? (
                        <p className="text-[11px] font-bold text-[var(--color-error)]">
                            ⚠️ {errorMessage}
                        </p>
                    ) : (
                        <p className="text-[11px] font-semibold text-[var(--color-ink-soft)]">
                            💡 Gunakan kode voucher <span className="font-extrabold text-[var(--color-ink)]">SKETCHKOPI</span> untuk diskon 10%!
                        </p>
                    )}
                </form>
            )}
        </div>
    );
}
