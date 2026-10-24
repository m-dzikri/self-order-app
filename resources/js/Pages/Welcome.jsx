import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import TableBadge from '../Components/TableBadge';
import PromoBanner from '../Components/PromoBanner';
import WifiMemoCard from '../Components/WifiMemoCard';
import TakeawayFormModal from '../Components/TakeawayFormModal';

/**
 * Welcome / order-session entry point (RFC-003, F1-F4, F23, F26).
 * Dine-in is locked by the ?table=XX QR (ARCH-4); without a table the
 * visitor starts in Takeaway mode and the session form opens on arrival.
 */
export default function Welcome({ appName, mode, tableNumber, orderSession }) {
    const isDineIn = mode === 'dine_in' && tableNumber !== null;
    const sessionComplete = Boolean(orderSession?.name && orderSession?.phone);
    const [formOpen, setFormOpen] = useState(false);
    const [formDismissed, setFormDismissed] = useState(false);

    // Takeaway without stored session data → the form greets the visitor.
    const autoOpen = !isDineIn && !sessionComplete && !formDismissed;

    return (
        <AppLayout>
            {/* Washi tape strip at the top of the page (UI-5) */}
            <div aria-hidden="true" className="mx-auto mb-6 h-6 w-40 -rotate-2 rounded-sm bg-[var(--color-primary)] opacity-80" />

            {isDineIn && <TableBadge tableNumber={tableNumber} />}

            {/* Mascot "Si Corat" polaroid frame (RFC-003 §3; inline SVG doodle) */}
            <div className="mx-auto mb-5 w-fit rotate-[1deg] rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] p-3 shadow-[var(--shadow-tactile-lg)]">
                <svg
                    aria-label="Maskot Si Corat sedang memegang cangkir"
                    className="h-28 w-28"
                    fill="none"
                    role="img"
                    stroke="var(--color-ink)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 96 96"
                >
                    {/* Cup body */}
                    <path d="M28 44h34v18a14 14 0 0 1-14 14h-6a14 14 0 0 1-14-14V44Z" fill="var(--color-container)" />
                    {/* Handle */}
                    <path d="M62 48h6a8 8 0 0 1 0 16h-6" />
                    {/* Steam doodles */}
                    <path d="M38 34c-3-4 3-6 0-10M50 34c-3-4 3-6 0-10" stroke="var(--color-promo)" />
                    {/* Face: two dot eyes + smile */}
                    <circle cx="40" cy="55" fill="var(--color-ink)" r="2" stroke="none" />
                    <circle cx="52" cy="55" fill="var(--color-ink)" r="2" stroke="none" />
                    <path d="M42 62c2 2 6 2 8 0" />
                    {/* Saucer */}
                    <path d="M22 80h48" stroke="var(--color-primary)" strokeWidth="4" />
                </svg>
                <p className="mt-1 -rotate-[4deg] text-center text-[13px] font-extrabold text-[var(--color-ink-soft)]">
                    Si Corat ☕
                </p>
            </div>

            <header className="mb-6 text-center">
                <h1 className="mb-2 text-[26px] leading-[34px] font-extrabold">
                    Hai! Selamat Datang di{' '}
                    <span className="relative text-[var(--color-ink)]">
                        {appName}
                        <span
                            aria-hidden="true"
                            className="absolute bottom-0 left-0 -z-10 h-2.5 w-full -rotate-1 rounded bg-[var(--color-primary)]"
                        />
                    </span>{' '}
                    ☕✨
                </h1>
                <p className="mx-auto max-w-xs text-[16px] leading-[24px] text-[var(--color-ink-soft)]">
                    Pesan langsung dari {isDineIn ? `meja ${tableNumber}` : 'mana aja'} tanpa ribet antre
                    &amp; tanpa download aplikasi!
                </p>
            </header>

            {sessionComplete ? (
                <div className="mb-4 rotate-[0.5deg] rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-container)] p-4 text-center shadow-[var(--shadow-tactile-md)]">
                    <p className="text-[16px] leading-[24px] font-bold">
                        Sampai ketemu, {orderSession.name}! ☕
                    </p>
                    <p className="mt-1 text-[14px] leading-[20px] text-[var(--color-ink-soft)]">
                        Nomor WhatsApp {orderSession.phone} · Ambil sekitar pukul {orderSession.pickupAt}
                    </p>
                </div>
            ) : (
                <div className="mb-4 rotate-[0.4deg] rounded-xl border-2 border-dashed border-[var(--color-outline)] bg-[var(--color-surface-container-low)] p-4 text-center">
                    <p className="text-[14px] leading-[20px] font-bold text-[var(--color-ink-soft)]">
                        {isDineIn
                            ? 'Mulai pesan dari meja — tanpa antre!'
                            : 'Bawa pulang? Isi dulu datanya biar pesananmu siap.'}
                    </p>
                </div>
            )}

            <div className="my-4">
                <PromoBanner />
            </div>

            <div className="my-4">
                <WifiMemoCard />
            </div>

            <div className="mt-6 mb-4 flex flex-col items-center">
                <Link
                    className="btn-tactile flex w-full items-center justify-center gap-3 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-6 py-4 text-[18px] font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
                    href="/katalog"
                >
                    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        restaurant_menu
                    </span>
                    Mulai Pesan Sekarang
                    <span aria-hidden="true" className="material-symbols-outlined">arrow_forward</span>
                </Link>
            </div>

            {/* ARCH-4: the dine-in session is locked, so the takeaway form is
                only offered while the visitor has not committed to a mode. */}
            {!sessionComplete && !isDineIn && (
                <div className="mb-3 text-center">
                    <button
                        className="min-h-[44px] rounded-lg px-4 py-2 text-[14px] font-bold underline text-[var(--color-ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
                        onClick={() => setFormOpen(true)}
                        type="button"
                    >
                        Ubah data pesan bawa pulang
                    </button>
                </div>
            )}

            <div className="text-center px-4">
                <p className="inline-flex items-center gap-2 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] px-3.5 py-2 text-[14px] leading-[20px] text-[var(--color-ink-soft)]">
                    <span aria-hidden="true" className="material-symbols-outlined">support_agent</span>
                    Butuh bantuan barista? Tekan tombol panggil atau lambaikan tangan ya! 👋
                </p>
            </div>

            <TakeawayFormModal
                onClose={() => {
                    setFormOpen(false);
                    setFormDismissed(true);
                }}
                open={formOpen || autoOpen}
            />
        </AppLayout>
    );
}
