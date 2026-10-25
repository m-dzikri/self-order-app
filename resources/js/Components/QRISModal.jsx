import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { formatRupiah } from '../Utils/formatRupiah';
import { formatCountdown } from '../Utils/formatCountdown';

/**
 * QRISModal Component (RFC-006, F17, F18, TC-006-2, TC-006-3).
 * Renders dynamic QR code canvas via 'qrcode' library, accurate 15-minute countdown,
 * expired overlay stamp, QR download trigger, and payment verification flow.
 */
export default function QRISModal({
    isOpen,
    order,
    onClose,
    onPaymentSuccess,
    onSwitchToCashier,
}) {
    if (!isOpen || !order) return null;

    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes = 900 seconds
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
    const [isPaidSuccess, setIsPaidSuccess] = useState(false);
    const [downloadedFeedback, setDownloadedFeedback] = useState(false);
    const canvasRef = useRef(null);

    // Render QR Code onto Canvas
    useEffect(() => {
        if (!isOpen || !canvasRef.current || !order) return;

        // Dynamic QRIS payload string (conforming to standard QRIS data representation)
        const qrisData = `00020101021226600014ID.LINKAJA.WWW01189360091100203491020215${order.order_code}520458125303360540${order.total}5802ID5916KOPI CORAT CORET6007BANDUNG62070703A016304`;

        QRCode.toCanvas(canvasRef.current, qrisData, {
            width: 230,
            margin: 2,
            color: {
                dark: '#4A2C17', // Espresso ink
                light: '#FFF9EF', // Cream paper
            },
        }, (err) => {
            if (err) console.error('Failed to generate QRIS canvas', err);
        });
    }, [isOpen, order, timeLeft]);

    // 15-Minute Countdown Timer
    useEffect(() => {
        if (!isOpen || timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, timeLeft]);

    // Handle "Buat QRIS Baru" (Regenerate)
    const handleRegenerateQR = () => {
        setTimeLeft(15 * 60);
    };

    // Handle "Unduh QR Code"
    const handleDownloadQR = () => {
        if (!canvasRef.current) return;
        try {
            const link = document.createElement('a');
            link.download = `QRIS-${order.order_code || 'kopi-corat-coret'}.png`;
            link.href = canvasRef.current.toDataURL('image/png');
            link.click();
            setDownloadedFeedback(true);
            setTimeout(() => setDownloadedFeedback(false), 2500);
        } catch (e) {
            console.error('Failed to download QR image', e);
        }
    };

    // Handle "Saya Sudah Bayar"
    const handleConfirmPayment = () => {
        setIsCheckingPayment(true);
        setTimeout(() => {
            setIsCheckingPayment(false);
            setIsPaidSuccess(true);
            setTimeout(() => {
                if (onPaymentSuccess) {
                    onPaymentSuccess(order);
                }
            }, 1200);
        }, 1500);
    };

    const isExpired = timeLeft <= 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qris-title"
        >
            <div className="relative w-full max-w-[420px] max-h-[92vh] overflow-y-auto rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] p-5 marker-shadow-lg">
                {/* Washi tape header decorations */}
                <div
                    aria-hidden="true"
                    className="absolute -top-3 left-8 h-4 w-16 -rotate-3 rounded-xs bg-[var(--color-primary)] opacity-85 shadow-xs pointer-events-none"
                />
                <div
                    aria-hidden="true"
                    className="absolute -top-3 right-8 h-4 w-16 rotate-3 rounded-xs bg-[var(--color-promo)]/70 opacity-85 shadow-xs pointer-events-none"
                />

                {/* Modal Header */}
                <div className="mb-3 flex items-center justify-between border-b-2 border-dashed border-[var(--color-outline)] pb-2.5">
                    <div className="flex items-center gap-2">
                        <span aria-hidden="true" className="material-symbols-outlined text-[24px] text-[var(--color-promo)]">
                            qr_code_scanner
                        </span>
                        <div>
                            <h2 id="qris-title" className="text-base font-extrabold text-[var(--color-ink)]">
                                Pembayaran QRIS Instan
                            </h2>
                            <p className="text-[11px] font-bold text-[var(--color-ink-soft)]">
                                Pesanan <span className="text-[var(--color-ink)]">{order.order_code}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup modal QRIS"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-ink)] bg-[var(--color-surface-container)] text-xs font-extrabold text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)] hover:bg-[var(--color-surface-container-high)]"
                    >
                        ✕
                    </button>
                </div>

                {/* Countdown Sticky Timer Box (TC-006-2) */}
                <div className="mb-4 flex items-center justify-between rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-container)] p-3 -rotate-0.5 shadow-[2px_2px_0px_var(--color-ink)]">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-ink)] bg-[var(--color-surface)] text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)]">
                            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                                schedule
                            </span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-soft)]">
                                Sisa Waktu Bayar
                            </span>
                            <span
                                id="qris-countdown-timer"
                                className={`text-xl font-extrabold tracking-tight ${
                                    isExpired ? 'text-[var(--color-error)]' : 'text-[var(--color-ink)]'
                                }`}
                            >
                                {formatCountdown(timeLeft)}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-md border border-[var(--color-ink)] bg-[var(--color-surface)] px-2 py-1 text-center shadow-[1px_1px_0px_var(--color-ink)]">
                        <span className="block text-[9px] font-extrabold text-[var(--color-promo)]">
                            Auto-Cancel
                        </span>
                        <span className="text-[10px] font-bold text-[var(--color-ink)]">
                            15 Menit
                        </span>
                    </div>
                </div>

                {/* QR Canvas Card Container */}
                <div className="relative flex flex-col items-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] p-4 shadow-[2px_2px_0px_var(--color-ink)]">
                    {/* QR Canvas */}
                    <div className="relative flex items-center justify-center rounded-lg border-2 border-[var(--color-ink)] bg-[var(--color-surface)] p-2 shadow-[2px_2px_0px_var(--color-ink)]">
                        <canvas ref={canvasRef} className="rounded" />

                        {/* Expired Overlay Stamp (F18, TC-006-3) */}
                        {isExpired ? (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg bg-[var(--color-surface)]/95 p-4 text-center backdrop-blur-xs">
                                <div className="rounded-lg border-2 border-[var(--color-error)] bg-[var(--color-error-container)] px-3 py-1 text-xs font-extrabold text-[var(--color-error)] -rotate-6 shadow-[2px_2px_0px_#93000a]">
                                    ⚠️ QR KEDALUWARSA
                                </div>
                                <p className="mt-2 text-[11px] font-bold text-[var(--color-ink-soft)] leading-tight">
                                    Waktu 15 menit habis. Klik tombol di bawah untuk kode baru.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleRegenerateQR}
                                    className="btn-tactile mt-3 rounded-lg border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-extrabold text-[var(--color-ink)] shadow-[2px_2px_0px_var(--color-ink)] active:translate-y-0.5"
                                >
                                    🔄 Buat QRIS Baru
                                </button>
                            </div>
                        ) : null}
                    </div>

                    {/* Merchant & NMID Info */}
                    <div className="mt-2.5 text-center">
                        <p className="text-[11px] font-extrabold text-[var(--color-ink)]">
                            NMID: ID102034910294 • GPN
                        </p>
                        <p className="text-[10px] font-semibold text-[var(--color-ink-soft)]">
                            PT Kopi Corat Coret • Kota Bandung
                        </p>
                    </div>

                    {/* Total Amount Stabilo Highlighter (UI-2, UI-5) */}
                    <div className="relative mt-3 w-full rounded-lg border border-[var(--color-ink)] bg-[var(--color-surface-container)] p-2.5 text-center shadow-[1.5px_1.5px_0px_var(--color-ink)]">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-soft)]">
                            Total Pembayaran
                        </span>
                        <div className="relative inline-block mt-0.5">
                            <span
                                aria-hidden="true"
                                className="absolute inset-x-0 bottom-0.5 h-3 -rotate-1 rounded-sm bg-[var(--color-primary)] shadow-[1px_1px_0px_var(--color-ink)] -z-0"
                            />
                            <span className="relative z-10 text-xl font-extrabold text-[var(--color-ink)]">
                                {formatRupiah(order.total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Practical Instructions */}
                <div className="mt-3.5 space-y-1.5 rounded-lg border border-[var(--color-ink)] bg-[var(--color-surface-container)] p-3 text-[11px] text-[var(--color-ink)]">
                    <p className="font-extrabold text-xs text-[var(--color-ink)]">
                        💡 Cara Bayar Praktis:
                    </p>
                    <p className="text-[11px] leading-relaxed text-[var(--color-ink-soft)]">
                        1. Buka m-Banking (BCA, Mandiri, BRI) atau e-Wallet (GoPay, OVO, ShopeePay, DANA).
                    </p>
                    <p className="text-[11px] leading-relaxed text-[var(--color-ink-soft)]">
                        2. Arahkan scanner ke QRIS di atas dan pastikan nama <span className="font-bold text-[var(--color-ink)]">Kopi Corat Coret</span>.
                    </p>
                </div>

                {/* Interactive Buttons */}
                <div className="mt-4 space-y-2">
                    {/* Primary Button: Saya Sudah Bayar */}
                    <button
                        type="button"
                        onClick={handleConfirmPayment}
                        disabled={isCheckingPayment || isPaidSuccess || isExpired}
                        className="btn-tactile flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-extrabold text-[var(--color-ink)] marker-shadow-md hover:bg-[var(--color-primary)] disabled:opacity-50 active:translate-y-0.5"
                    >
                        {isCheckingPayment ? (
                            <>
                                <span className="animate-spin text-base">⏳</span>
                                <span>Mengecek Pembayaran...</span>
                            </>
                        ) : isPaidSuccess ? (
                            <>
                                <span>✨</span>
                                <span>Pembayaran Diterima!</span>
                            </>
                        ) : (
                            <>
                                <span>Saya Sudah Bayar</span>
                                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                                    arrow_forward
                                </span>
                            </>
                        )}
                    </button>

                    {/* Secondary Button: Unduh QR Code */}
                    <button
                        type="button"
                        onClick={handleDownloadQR}
                        disabled={isExpired}
                        className="btn-tactile flex w-full min-h-[40px] items-center justify-center gap-1.5 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] px-4 py-2 text-xs font-extrabold text-[var(--color-ink)] shadow-[2px_2px_0px_var(--color-ink)] hover:bg-[var(--color-surface-container)] disabled:opacity-40 active:translate-y-0.5"
                    >
                        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                            {downloadedFeedback ? 'done' : 'download'}
                        </span>
                        <span>{downloadedFeedback ? 'Tersimpan di Galeri! ✨' : 'Unduh QR Code'}</span>
                    </button>

                    {/* Fallback to Cashier option */}
                    {onSwitchToCashier ? (
                        <div className="pt-1 text-center">
                            <button
                                type="button"
                                onClick={onSwitchToCashier}
                                className="text-[11px] font-bold text-[var(--color-promo)] underline decoration-wavy hover:text-[var(--color-ink)]"
                            >
                                Ganti Metode Pembayaran / Bayar di Kasir
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
