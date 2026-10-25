import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link } from '@inertiajs/react';

/**
 * QRScannerModal: Tactile sketchbook modal for scanning cafe table QR codes.
 * Uses browser WebRTC camera stream with file-upload & manual fallback.
 */
export default function QRScannerModal({ isOpen, onClose, onDetectedTable }) {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'file' | 'manual'
    const [scannerError, setScannerError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [manualNumber, setManualNumber] = useState('');
    const [scanSuccessMessage, setScanSuccessMessage] = useState(null);

    const html5QrCodeRef = useRef(null);
    const fileInputRef = useRef(null);
    const readerElementId = 'html5-qr-reader-container';

    // Parse table number from URL, query parameter, or plain text
    const extractTableNumber = (decodedText) => {
        try {
            // Case 1: Full URL with ?table=XX or ?table=XX&...
            if (decodedText.includes('table=')) {
                const match = decodedText.match(/[?&]table=([0-9]{1,3})/);
                if (match && match[1]) {
                    return parseInt(match[1], 10);
                }
            }

            // Case 2: URL object parsing
            if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
                const url = new URL(decodedText);
                const tableParam = url.searchParams.get('table');
                if (tableParam && /^[1-9]\d{0,2}$/.test(tableParam)) {
                    return parseInt(tableParam, 10);
                }
            }

            // Case 3: Text like "MEJA-12", "Meja 12", "M-12", or simply "12"
            const textMatch = decodedText.match(/(?:meja|m)?[\s\-_:]*([1-9]\d{0,2})/i);
            if (textMatch && textMatch[1]) {
                return parseInt(textMatch[1], 10);
            }
        } catch {
            // ignore parse error
        }
        return null;
    };

    const handleSuccessScan = (decodedText) => {
        const tableNum = extractTableNumber(decodedText);
        if (tableNum && tableNum >= 1 && tableNum <= 999) {
            // Haptic vibration feedback if supported
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try { navigator.vibrate(100); } catch { /* ignore */ }
            }

            setScanSuccessMessage(`Berhasil memindai Meja ${tableNum}!`);

            // Stop camera immediately
            stopCamera().finally(() => {
                setTimeout(() => {
                    onDetectedTable(tableNum);
                }, 400);
            });
        } else {
            setScannerError(`QR terbaca: "${decodedText}", namun bukan format QR Meja Kopi Corat-Coret yang valid.`);
        }
    };

    const stopCamera = async () => {
        if (html5QrCodeRef.current) {
            try {
                if (html5QrCodeRef.current.isScanning) {
                    await html5QrCodeRef.current.stop();
                }
                html5QrCodeRef.current.clear();
            } catch (err) {
                console.warn('Error stopping camera:', err);
            } finally {
                html5QrCodeRef.current = null;
                setIsScanning(false);
            }
        }
    };

    // Start Camera when tab is 'camera'
    useEffect(() => {
        let isMounted = true;

        if (activeTab === 'camera') {
            setScannerError(null);
            // Delay slightly so DOM element is guaranteed to be rendered
            const timer = setTimeout(() => {
                const el = document.getElementById(readerElementId);
                if (!el || !isMounted) return;

                const qrScanner = new Html5Qrcode(readerElementId);
                html5QrCodeRef.current = qrScanner;

                const config = {
                    fps: 10,
                    qrbox: { width: 220, height: 220 },
                    aspectRatio: 1.0,
                };

                qrScanner
                    .start(
                        { facingMode: 'environment' },
                        config,
                        (decodedText) => {
                            if (isMounted) {
                                handleSuccessScan(decodedText);
                            }
                        },
                        (error) => {
                            // Normal search noise, no need to log every frame
                        }
                    )
                    .then(() => {
                        if (isMounted) setIsScanning(true);
                    })
                    .catch((err) => {
                        if (!isMounted) return;
                        console.warn('Camera access error:', err);
                        setIsScanning(false);
                        setScannerError(
                            'Kamera tidak dapat diakses atau izin ditolak. Anda bisa mencoba tab "Unggah Foto" atau "Ketik Nomor".'
                        );
                    });
            }, 300);

            return () => {
                isMounted = false;
                clearTimeout(timer);
                stopCamera();
            };
        } else {
            stopCamera();
        }
    }, [activeTab]);

    // Handle File Upload Scan
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScannerError(null);
        try {
            const scanner = html5QrCodeRef.current || new Html5Qrcode(readerElementId);
            const decodedText = await scanner.scanFile(file, true);
            handleSuccessScan(decodedText);
        } catch (err) {
            setScannerError('Tidak dapat mendeteksi QR Code dari gambar yang diunggah. Pastikan gambar jelas dan tidak buram.');
        }
    };

    // Handle Manual Submit
    const handleManualSubmit = (e) => {
        e.preventDefault();
        const num = parseInt(manualNumber, 10);
        if (num >= 1 && num <= 999) {
            onDetectedTable(num);
        } else {
            setScannerError('Harap masukkan nomor meja yang valid (1 - 999).');
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/70 p-4 backdrop-blur-xs animate-fadeIn"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-[400px] rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] p-5 marker-shadow-lg text-center animate-scaleUp">
                {/* Top Washi Tape Clip */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 -rotate-1 rounded-sm border border-[var(--color-ink)] bg-[var(--color-primary)] px-4 py-0.5 text-[11px] font-black uppercase tracking-wider text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)] select-none">
                    Pindai QR Meja 📷
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => {
                        stopCamera().finally(() => onClose());
                    }}
                    aria-label="Tutup dialog"
                    className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-ink)] bg-[var(--color-surface-container)] text-[var(--color-ink)] hover:bg-[var(--color-surface-container-high)] active:scale-95 transition-all cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                </button>

                {/* Title */}
                <div className="mt-2 text-center">
                    <h3 className="font-headline text-lg font-black text-[var(--color-ink)]">
                        Pindai Meja Kafe
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
                        Arahkan kamera ke stiker QR di atas mejamu
                    </p>
                </div>

                {/* Mode Selector Tabs */}
                <div className="mt-3 flex rounded-xl border border-[var(--color-ink)] bg-[var(--color-surface-container-low)] p-1 text-xs font-extrabold">
                    <button
                        type="button"
                        onClick={() => setActiveTab('camera')}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all ${
                            activeTab === 'camera'
                                ? 'bg-[var(--color-primary)] text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)]'
                                : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[15px]">videocam</span>
                        <span>Kamera</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('file')}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all ${
                            activeTab === 'file'
                                ? 'bg-[var(--color-primary)] text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)]'
                                : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[15px]">image</span>
                        <span>Unggah Foto</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all ${
                            activeTab === 'manual'
                                ? 'bg-[var(--color-primary)] text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)]'
                                : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[15px]">dialpad</span>
                        <span>Ketik Meja</span>
                    </button>
                </div>

                {/* Scanner Content Area */}
                <div className="mt-3 relative min-h-[240px] flex flex-col items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] p-2 overflow-hidden shadow-inner">
                    {/* Success Banner */}
                    {scanSuccessMessage && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--color-primary)] p-4 text-[var(--color-ink)]">
                            <span className="material-symbols-outlined text-[48px] animate-bounce">check_circle</span>
                            <p className="mt-2 font-headline text-base font-black">{scanSuccessMessage}</p>
                            <p className="text-xs font-bold opacity-80">Mengalihkan sesi ke meja...</p>
                        </div>
                    )}

                    {/* Tab 1: Live Camera Scanner */}
                    {activeTab === 'camera' && (
                        <div className="w-full flex flex-col items-center">
                            <div
                                id={readerElementId}
                                className="w-full max-w-[280px] rounded-lg overflow-hidden border border-dashed border-[var(--color-primary)]"
                            />
                            {!isScanning && !scannerError && (
                                <p className="mt-2 text-xs text-[var(--color-ink-soft)] animate-pulse">
                                    Menghubungkan ke kamera...
                                </p>
                            )}
                        </div>
                    )}

                    {/* Tab 2: File Upload Scanner */}
                    {activeTab === 'file' && (
                        <div className="w-full p-4 flex flex-col items-center justify-center text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-secondary-container)] shadow-[2px_2px_0px_var(--color-ink)] mb-3">
                                <span className="material-symbols-outlined text-[28px] text-[var(--color-ink)]">
                                    add_photo_alternate
                                </span>
                            </div>
                            <p className="text-xs font-bold text-[var(--color-ink)]">
                                Pilih tangkapan layar atau foto QR Meja
                            </p>
                            <p className="text-[11px] text-[var(--color-ink-soft)] mt-1">
                                Format PNG, JPG, atau WebP
                            </p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-3 flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[var(--color-ink)] bg-[var(--color-primary)] px-4 py-2 text-xs font-black text-[var(--color-ink)] marker-shadow hover:bg-[var(--color-primary-dim)] active:scale-95 transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                                <span>Pilih Gambar QR</span>
                            </button>
                        </div>
                    )}

                    {/* Tab 3: Manual Number Fallback */}
                    {activeTab === 'manual' && (
                        <form onSubmit={handleManualSubmit} className="w-full p-3 flex flex-col items-center">
                            <label htmlFor="manual-table-input" className="text-xs font-bold text-[var(--color-ink)] mb-2">
                                Masukkan nomor meja yang tertera:
                            </label>
                            <div className="flex items-center gap-2 w-full max-w-[200px]">
                                <input
                                    id="manual-table-input"
                                    type="number"
                                    min="1"
                                    max="999"
                                    placeholder="Contoh: 12"
                                    value={manualNumber}
                                    onChange={(e) => setManualNumber(e.target.value)}
                                    autoFocus
                                    className="w-full rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] px-3 py-2 text-center font-headline text-lg font-black text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>

                            {/* Quick Table Select Chips */}
                            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                                {[1, 2, 5, 10, 12, 20].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => onDetectedTable(t)}
                                        className="rounded-md border border-[var(--color-ink)] bg-[var(--color-surface-container)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-ink)] hover:bg-[var(--color-primary)] active:scale-95"
                                    >
                                        Meja {t}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={!manualNumber}
                                className="mt-4 flex w-full max-w-[200px] min-h-[38px] items-center justify-center gap-1 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-4 py-2 text-xs font-black text-[var(--color-ink)] marker-shadow disabled:opacity-50 hover:bg-[var(--color-primary-dim)] active:scale-95 transition-all cursor-pointer"
                            >
                                <span>Terapkan Meja</span>
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </form>
                    )}
                </div>

                {/* Error Banner */}
                {scannerError && (
                    <div className="mt-2.5 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface-container-high)] p-2 text-left text-[11px] leading-tight text-[var(--color-ink)] flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[var(--color-promo)] shrink-0">error</span>
                        <div className="flex-1">{scannerError}</div>
                    </div>
                )}

                {/* Bottom Helper Links */}
                <div className="mt-4 pt-3 border-t border-[var(--color-outline)] flex items-center justify-between text-[11px] text-[var(--color-ink-soft)] font-bold">
                    <Link
                        href="/meja-qr"
                        onClick={() => stopCamera()}
                        className="underline hover:text-[var(--color-ink)] flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[14px]">grid_view</span>
                        <span>Lihat Semua QR Meja Kafe</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => stopCamera().finally(() => onClose())}
                        className="hover:text-[var(--color-ink)]"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}
