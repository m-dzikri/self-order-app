import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import OrderStatusStepper from '../Components/OrderStatusStepper';
import MiniDoodleCanvas from '../Components/MiniDoodleCanvas';
import StatusSimulationControls from '../Components/StatusSimulationControls';
import MemberButton from '../Components/MemberButton';
import { formatRupiah } from '../Utils/formatRupiah';

/**
 * Real-Time Order Tracking Page (RFC-007, F21, F22, UI-1, UI-4, SEC-3).
 * Design source: desain-web/06_pelacak_pesanan_real_time/code.html
 */
export default function Tracker({ order }) {
    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [callToast, setCallToast] = useState(null);
    const [isCallingServer, setIsCallingServer] = useState(false);

    // Format created_at to readable time string (e.g. 14:28 WIB)
    const orderTimeStr = React.useMemo(() => {
        try {
            const date = new Date(order.created_at);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes} WIB`;
        } catch {
            return 'Baru saja';
        }
    }, [order.created_at]);

    // Dynamic estimated wait time calculation based on status
    const estimatedTime = React.useMemo(() => {
        switch (currentStatus) {
            case 'unpaid_cashier':
                return 'Menunggu Kasir';
            case 'confirmed':
                return '10–15 Menit';
            case 'in_progress':
                return '5–8 Menit';
            case 'ready':
                return 'Siap Disajikan!';
            case 'completed':
                return 'Pesanan Selesai';
            default:
                return '8–12 Menit';
        }
    }, [currentStatus]);

    // Real-Time Polling Effect (every 3.5 seconds)
    useEffect(() => {
        let isMounted = true;

        const pollInterval = setInterval(async () => {
            if (currentStatus === 'completed' || currentStatus === 'cancelled') {
                return;
            }

            try {
                const res = await fetch(`/order/${encodeURIComponent(order.order_code)}/status-poll`, {
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (res.ok && isMounted) {
                    const data = await res.json();
                    if (data.success && data.status && data.status !== currentStatus) {
                        setCurrentStatus(data.status);
                    }
                }
            } catch (err) {
                // Silently ignore temporary polling network errors
            }
        }, 3500);

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };
    }, [order.order_code, currentStatus]);

    // Call server button handler
    const handleCallServer = async () => {
        setIsCallingServer(true);
        try {
            const tokenMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = tokenMeta ? tokenMeta.getAttribute('content') : '';

            const res = await fetch(`/order/${encodeURIComponent(order.order_code)}/call-server`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setCallToast(data.message || 'Panggilan terkirim!');
            } else {
                setCallToast('Pelayan sedang menuju ke mejamu! 🛎️');
            }
        } catch {
            setCallToast('Pelayan sedang menuju ke mejamu! 🛎️');
        } finally {
            setIsCallingServer(false);
            setTimeout(() => setCallToast(null), 3500);
        }
    };

    const isPaid = currentStatus !== 'unpaid_cashier';
    const totalItemsCount = (order.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);

    return (
        <AppLayout>
            <Head title={`Pelacak Pesanan ${order.order_code} - Kopi Corat-Coret`} />

            {/* Floating Toast Notification */}
            {callToast && (
                <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-[420px] animate-bounce">
                    <div className="flex items-center gap-2 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary-container)] px-4 py-3 marker-shadow-lg text-xs font-extrabold text-[var(--color-ink)]">
                        <span className="material-symbols-outlined text-[20px] text-[var(--color-promo)]">
                            notifications_active
                        </span>
                        <span>{callToast}</span>
                    </div>
                </div>
            )}

            {/* Custom Sketchbook Header */}
            <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-[var(--color-outline-variant)] pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary-container)] shadow-[2px_2px_0px_var(--color-ink)] rotate-2">
                        <span className="material-symbols-outlined text-[22px] text-[var(--color-ink)]">
                            local_cafe
                        </span>
                    </div>
                    <div>
                        <h1 className="font-headline text-lg font-extrabold tracking-tight text-[var(--color-ink)]">
                            Kopi Corat-Coret
                        </h1>
                        <div className="flex items-center gap-1.5">
                            <span className="inline-block -rotate-2 rounded-sm border border-[var(--color-ink)] bg-[var(--color-secondary-container)] px-1.5 py-0.2 text-[10px] font-extrabold text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)]">
                                {order.session_type === 'dine_in' ? `Meja ${order.table_number || '-'}` : 'Takeaway'}
                            </span>
                            <span className="text-[11px] font-bold text-[var(--color-ink-soft)]">
                                Live Order Tracker
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <MemberButton onToast={(msg) => setCallToast(msg)} />

                    <Link
                        href="/katalog"
                        className="flex h-10 items-center gap-1.5 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] px-3 text-xs font-extrabold text-[var(--color-ink)] shadow-[2px_2px_0px_var(--color-ink)] hover:bg-[var(--color-surface-container)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                        <span>Menu</span>
                    </Link>
                </div>
            </div>

            <div className="space-y-4 pb-20">
                {/* 1. Top Washi Tape Sticky Banner */}
                <div className="relative flex items-center justify-center py-1">
                    <div className="relative flex select-none items-center gap-2 -rotate-2 rounded-md border-2 border-[var(--color-ink)] bg-[var(--color-secondary-container)] px-5 py-1.5 text-xs font-extrabold text-[var(--color-ink)] shadow-[2px_2px_0px_var(--color-ink)]">
                        <span className="h-2 w-2 rounded-full bg-[var(--color-promo)] animate-ping" />
                        <span>
                            Pesanan {order.order_code} • {order.session_type === 'dine_in' ? `Meja ${order.table_number}` : `Takeaway (${order.customer_name || 'Tamu'})`}
                        </span>
                        <span className="material-symbols-outlined text-[16px]">draw</span>
                    </div>
                </div>

                {/* 2. Estimated Time Card (Warm Cream Notepad) */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container)] p-4 marker-shadow">
                    {/* Washi tape corner accent */}
                    <div className="absolute -top-3 -right-6 h-6 w-20 rotate-45 border-b border-[var(--color-ink)] bg-[var(--color-primary-container)]/80 shadow-xs" />

                    <div className="flex items-start gap-3.5">
                        <div className="flex h-12 w-12 min-w-[48px] items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary-container)] shadow-[2px_2px_0px_var(--color-ink)] rotate-2">
                            <span className="material-symbols-outlined text-[28px] text-[var(--color-ink)] animate-pulse">
                                timer
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-headline text-base font-extrabold text-[var(--color-ink)]">
                                    Perkiraan Siap: {estimatedTime}
                                </span>
                            </div>
                            <p className="mt-1 text-xs leading-snug text-[var(--color-ink-soft)]">
                                Barista kami sedang meracik pesananmu dengan sepenuh hati! ☕🎨
                            </p>
                            <div className="mt-2.5 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                                <span className="text-[11px] font-extrabold text-[var(--color-primary)]">
                                    Waktu pemesanan: {orderTimeStr}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Real-time Doodle Stepper */}
                <OrderStatusStepper
                    status={currentStatus}
                    paymentMethod={order.payment_method}
                    sessionType={order.session_type}
                    tableNumber={order.table_number}
                    createdAt={orderTimeStr}
                />

                {/* 4. Interactive Sketchbook Entertainment: "Corat-Coret Mini" */}
                <MiniDoodleCanvas />

                {/* 5. Order Details Accordion / Torn Paper Receipt Docket */}
                <div className="relative rounded-t-2xl border-2 border-b-0 border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] p-4 shadow-[3px_3px_0px_var(--color-ink)]">
                    <details className="group" open>
                        <summary className="flex cursor-pointer list-none items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px] text-[var(--color-secondary)]">
                                    receipt_long
                                </span>
                                <span className="font-headline text-sm font-extrabold text-[var(--color-ink)]">
                                    Rincian Pesanan ({totalItemsCount} Menu)
                                </span>
                            </div>
                            <span className="material-symbols-outlined text-[22px] text-[var(--color-ink-soft)] transition-transform group-open:rotate-180">
                                expand_more
                            </span>
                        </summary>

                        <div className="mt-3.5 space-y-3 border-t border-dashed border-[var(--color-outline-variant)] pt-3 text-xs">
                            {order.items &&
                                order.items.map((item, idx) => (
                                    <div key={item.id || idx} className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 font-extrabold text-[var(--color-ink)]">
                                                <span className="flex h-5 w-5 items-center justify-center rounded border border-[var(--color-ink)] bg-[var(--color-primary-container)] text-[10px]">
                                                    {item.quantity}x
                                                </span>
                                                <span className="truncate">{item.menu_name}</span>
                                            </div>
                                            {item.modifiers_summary && (
                                                <p className="mt-0.5 ml-6.5 text-[11px] text-[var(--color-ink-soft)]">
                                                    {item.modifiers_summary}
                                                </p>
                                            )}
                                            {item.special_notes && (
                                                <p className="mt-0.5 ml-6.5 italic text-[10px] text-[var(--color-promo)]">
                                                    Catatan: "{item.special_notes}"
                                                </p>
                                            )}
                                        </div>
                                        <span className="font-extrabold whitespace-nowrap text-[var(--color-ink)]">
                                            {formatRupiah(item.total_price)}
                                        </span>
                                    </div>
                                ))}

                            {/* Subtotal, Discount & Taxes */}
                            <div className="mt-3 border-t border-[var(--color-outline-variant)] pt-2 space-y-1 text-xs">
                                <div className="flex justify-between text-[var(--color-ink-soft)]">
                                    <span>Subtotal Menu</span>
                                    <span className="font-bold">{formatRupiah(order.subtotal)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-[var(--color-promo)] font-bold">
                                        <span>Diskon Kupon ({order.coupon_code || '10%'})</span>
                                        <span>- {formatRupiah(order.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[var(--color-ink-soft)]">
                                    <span>PB1 Restoran (10%)</span>
                                    <span className="font-bold">{formatRupiah(order.pb1_tax)}</span>
                                </div>
                            </div>

                            {/* Total with LUNAS / BELUM LUNAS Stamp Badge */}
                            <div className="mt-3 flex items-center justify-between rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container)] p-3 shadow-[1.5px_1.5px_0px_var(--color-ink)]">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--color-ink-soft)]">
                                        Total Pembayaran
                                    </span>
                                    <span className="font-headline text-lg font-black text-[var(--color-ink)]">
                                        {formatRupiah(order.total)}
                                    </span>
                                </div>

                                {/* Stamp Badge */}
                                {isPaid ? (
                                    <div className="flex items-center gap-1 -rotate-3 rounded-md border-2 border-[var(--color-ink)] bg-[#d2e7d6] px-2.5 py-1 text-xs font-black uppercase tracking-wider text-[var(--color-ink)] shadow-[1.5px_1.5px_0px_var(--color-ink)]">
                                        <span className="material-symbols-outlined text-[16px]">verified</span>
                                        <span>LUNAS • {order.payment_method?.toUpperCase()}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 rotate-2 rounded-md border-2 border-[var(--color-ink)] bg-amber-200 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-[var(--color-ink)] shadow-[1.5px_1.5px_0px_var(--color-ink)]">
                                        <span className="material-symbols-outlined text-[16px]">pending</span>
                                        <span>BAYAR DI KASIR</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </details>

                    {/* Faux Zigzag Perforated Edge Indicator */}
                    <div className="mt-3 flex w-full justify-between overflow-hidden text-[var(--color-outline)] select-none opacity-60">
                        {Array.from({ length: 18 }).map((_, i) => (
                            <span key={i}>▲</span>
                        ))}
                    </div>
                </div>

                {/* 6. Bottom Interactive Action Buttons */}
                <div className="space-y-2.5 pt-2">
                    <Link
                        href="/katalog"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-primary-container)] py-3 px-4 font-headline text-sm font-extrabold text-[var(--color-ink)] marker-shadow hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-center"
                    >
                        <span>Pesan Tambahan (Kopi/Snack Lagi)</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>

                    <button
                        type="button"
                        disabled={isCallingServer}
                        onClick={handleCallServer}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] py-2.5 px-4 text-xs font-extrabold text-[var(--color-ink)] shadow-[2px_2px_0px_var(--color-ink)] hover:bg-[var(--color-surface-container)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px] text-[var(--color-promo)] animate-pulse">
                            notifications
                        </span>
                        <span>
                            {order.session_type === 'dine_in' && order.table_number
                                ? `Panggil Pelayan / Barista Meja ${order.table_number}`
                                : 'Panggil Barista di Konter'}
                        </span>
                    </button>
                </div>
            </div>

            {/* 7. Demo Status Simulation Toolbar (F22, TC-007-4) */}
            <StatusSimulationControls
                currentStatus={currentStatus}
                orderCode={order.order_code}
                onStatusChange={(newStatus) => setCurrentStatus(newStatus)}
            />
        </AppLayout>
    );
}
