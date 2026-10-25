import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import QRCode from 'qrcode';
import QRScannerModal from '../Components/QRScannerModal';

/**
 * Individual Acrylic Standee Card for Cafe Table
 */
function TableCard({ table, onScanSuccess }) {
    const canvasRef = useRef(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!canvasRef.current || !table.url) return;

        QRCode.toCanvas(
            canvasRef.current,
            table.url,
            {
                width: 170,
                margin: 2,
                color: {
                    dark: '#4A2C17', // Espresso ink
                    light: '#FFF9EF', // Warm cream paper
                },
                errorCorrectionLevel: 'M',
            },
            (err) => {
                if (err) console.error('Error generating table QR:', err);
            }
        );
    }, [table.url]);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(table.url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="table-card relative flex flex-col items-center justify-between rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] p-5 text-center marker-shadow transition-all hover:-translate-y-0.5 hover:marker-shadow-lg break-inside-avoid">
            {/* Top Washi Tape Clip */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 -rotate-1 rounded-sm border border-[var(--color-ink)] bg-[var(--color-primary)] px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)] select-none">
                Kopi Corat-Coret ☕
            </div>

            {/* Standee Header */}
            <div className="mt-2 w-full">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-ink-soft)]">
                    Self-Order Table Stand
                </span>
                <h3 className="font-headline text-2xl font-black text-[var(--color-ink)] tracking-tight">
                    {table.label}
                </h3>
            </div>

            {/* QR Code Canvas */}
            <div className="relative my-3 flex items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] p-2 shadow-[2px_2px_0px_var(--color-ink)]">
                <canvas ref={canvasRef} className="block max-w-full h-auto rounded-lg" />
                <div className="absolute -bottom-2 -right-2 rounded-full border border-[var(--color-ink)] bg-[var(--color-primary)] p-1 text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)]">
                    <span className="material-symbols-outlined text-[14px] block">qr_code_2</span>
                </div>
            </div>

            {/* Step Instructions */}
            <div className="w-full rounded-xl border border-dashed border-[var(--color-outline)] bg-[var(--color-surface-container-low)]/50 p-2 text-left">
                <p className="text-[10px] font-extrabold text-[var(--color-ink)] mb-1 text-center">
                    Cara Pesan Tanpa Antre:
                </p>
                <ol className="text-[10px] text-[var(--color-ink-soft)] space-y-0.5 leading-tight">
                    <li className="flex items-center gap-1">
                        <span className="font-bold text-[var(--color-ink)]">1.</span> Buka kamera HP / Google Lens
                    </li>
                    <li className="flex items-center gap-1">
                        <span className="font-bold text-[var(--color-ink)]">2.</span> Arahkan kamera ke QR di atas
                    </li>
                    <li className="flex items-center gap-1">
                        <span className="font-bold text-[var(--color-ink)]">3.</span> Pesan & bayar langsung dari meja!
                    </li>
                </ol>
            </div>

            {/* Interactive Demo Actions (Hidden in Print) */}
            <div className="print:hidden mt-3 flex w-full items-center gap-2">
                <Link
                    href={`/?table=${table.number}`}
                    className="flex-1 min-h-[34px] flex items-center justify-center gap-1 rounded-lg border border-[var(--color-ink)] bg-[var(--color-primary)] px-2 py-1 text-[11px] font-black text-[var(--color-ink)] hover:bg-[var(--color-primary-dim)] active:scale-95 transition-all shadow-[1px_1px_0px_var(--color-ink)]"
                    title={`Mulai sesi sebagai ${table.label}`}
                >
                    <span>Masuk Meja</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </Link>

                <button
                    type="button"
                    onClick={handleCopy}
                    className="min-h-[34px] px-2.5 flex items-center justify-center rounded-lg border border-[var(--color-ink)] bg-[var(--color-surface-container)] text-[11px] font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-container-high)] active:scale-95 transition-all shadow-[1px_1px_0px_var(--color-ink)]"
                    title="Salin URL Meja ini"
                >
                    <span className="material-symbols-outlined text-[14px]">
                        {copied ? 'check' : 'content_copy'}
                    </span>
                </button>
            </div>
        </div>
    );
}

export default function TableQrList({ appName = 'Kopi Corat-Coret', tables = [], currentSession = {} }) {
    const [filterRange, setFilterRange] = useState('all');
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const filteredTables = tables.filter((t) => {
        if (filterRange === '1-5') return t.number >= 1 && t.number <= 5;
        if (filterRange === '6-10') return t.number >= 6 && t.number <= 10;
        if (filterRange === '11-20') return t.number >= 11 && t.number <= 20;
        return true;
    });

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-ink)] p-4 md:p-8 font-body">
            <Head title={`Cetak Standee QR Meja Kafe - ${appName}`} />

            {/* Print Styling Helper */}
            <style>{`
                @media print {
                    body {
                        background: #fff !important;
                        color: #000 !important;
                        padding: 0 !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-grid {
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 16px !important;
                    }
                    .table-card {
                        box-shadow: none !important;
                        border: 2px solid #000 !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }
            `}</style>

            <div className="mx-auto max-w-5xl">
                {/* Header Section (Hidden during Print) */}
                <div className="no-print mb-8 rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] p-5 md:p-6 marker-shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/katalog"
                                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container)] text-lg font-bold marker-shadow hover:bg-[var(--color-surface-container-high)] active:scale-95 transition-all"
                                title="Kembali ke Katalog"
                            >
                                ←
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="rounded-sm border border-[var(--color-ink)] bg-[var(--color-primary)] px-2 py-0.5 text-[11px] font-black uppercase text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)]">
                                        Operasional Kafe
                                    </span>
                                    <span className="text-xs text-[var(--color-ink-soft)] font-bold">
                                        {tables.length} Nomor Meja Tersedia
                                    </span>
                                </div>
                                <h1 className="mt-1 font-headline text-2xl md:text-3xl font-black text-[var(--color-ink)]">
                                    Standee Akrilik QR Meja Kafe ☕
                                </h1>
                            </div>
                        </div>

                        {/* Top Action CTAs */}
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsScannerOpen(true)}
                                className="flex min-h-[42px] items-center gap-2 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-secondary-container)] px-3.5 py-2 text-xs font-black text-[var(--color-ink)] marker-shadow hover:bg-[var(--color-secondary)] active:scale-95 transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                                <span>Coba Scanner Kamera</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex min-h-[42px] items-center gap-2 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-4 py-2 text-xs font-black text-[var(--color-ink)] marker-shadow hover:bg-[var(--color-primary-dim)] active:scale-95 transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">print</span>
                                <span>Cetak Kartu Meja (PDF)</span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-4 text-xs md:text-sm text-[var(--color-ink-soft)] leading-relaxed border-t border-[var(--color-outline)] pt-3">
                        Halaman ini digunakan oleh kasir/owner kafe untuk menghasilkan dan mencetak kartu akrilik nomor meja.
                        Setiap QR Code di bawah membawa parameter URL <code className="bg-[var(--color-surface-container)] px-1.5 py-0.5 rounded font-mono font-bold text-[var(--color-ink)]">?table=XX</code>.
                        Saat pelanggan memindai dengan kamera ponsel aslinya, sesi pemesanan otomatis terkunci di meja tersebut.
                    </p>

                    {/* Filter Pills */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[var(--color-ink)] mr-1">Tampilkan:</span>
                        {[
                            { id: 'all', label: 'Semua Meja (1-20)' },
                            { id: '1-5', label: 'Meja 01 - 05' },
                            { id: '6-10', label: 'Meja 06 - 10' },
                            { id: '11-20', label: 'Meja 11 - 20' },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                type="button"
                                onClick={() => setFilterRange(btn.id)}
                                className={`rounded-lg border border-[var(--color-ink)] px-3 py-1 text-xs font-bold transition-all shadow-[1px_1px_0px_var(--color-ink)] ${
                                    filterRange === btn.id
                                        ? 'bg-[var(--color-primary)] text-[var(--color-ink)] font-black'
                                        : 'bg-[var(--color-surface-container)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-container-high)]'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid of Acrylic Table Standee Cards */}
                <div className="print-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {filteredTables.map((table) => (
                        <TableCard
                            key={table.number}
                            table={table}
                            onScanSuccess={() => {}}
                        />
                    ))}
                </div>
            </div>

            {/* In-App Camera QR Scanner Modal */}
            <QRScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onDetectedTable={(tableNum) => {
                    setIsScannerOpen(false);
                    router.post(
                        '/session/switch-mode',
                        { mode: 'dine_in', table_number: tableNum },
                        {
                            onSuccess: () => {
                                router.visit('/katalog');
                            },
                        }
                    );
                }}
            />
        </div>
    );
}
