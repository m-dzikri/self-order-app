import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatRupiah } from '../Utils/formatRupiah';

/**
 * OrderHistoryModal: Displays past orders and receipts for logged-in member
 * (RFC-008, F24, TC-008-2, SEC-3).
 */
export default function OrderHistoryModal({ isOpen, onClose, onLogout, memberUser }) {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        setIsLoading(true);
        setErrorMsg(null);

        axios
            .get('/member/history')
            .then((res) => {
                if (isMounted && res.data?.success) {
                    setOrders(res.data.orders || []);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setErrorMsg('Gagal memuat riwayat pesanan. Pastikan koneksi internet aktif.');
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleLogout = async () => {
        try {
            await axios.post('/member/logout');
            if (onLogout) onLogout();
            onClose();
        } catch {
            if (onLogout) onLogout();
            onClose();
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return { label: 'Selesai ✓', color: 'bg-emerald-100 text-emerald-900 border-emerald-700' };
            case 'ready':
                return { label: 'Siap Diambil/Diantar', color: 'bg-sky-100 text-sky-900 border-sky-700' };
            case 'in_progress':
                return { label: 'Sedang Diracik', color: 'bg-orange-100 text-orange-900 border-orange-700' };
            case 'confirmed':
                return { label: 'Pesanan Diterima', color: 'bg-yellow-100 text-yellow-900 border-yellow-700' };
            case 'unpaid_cashier':
                return { label: 'Menunggu Kasir', color: 'bg-amber-100 text-amber-900 border-amber-700' };
            default:
                return { label: status, color: 'bg-stone-100 text-stone-800 border-stone-600' };
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-[460px] max-h-[90vh] flex flex-col rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] p-5 marker-shadow-lg">
                {/* Washi Tape Header Decoration */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 -rotate-1 rounded-sm border border-[var(--color-ink)] bg-[var(--color-secondary-container)] px-4 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)]">
                    Riwayat Struk Member 📖
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-ink)] bg-[var(--color-surface-container)] text-[var(--color-ink)] hover:bg-[var(--color-surface-container-high)]"
                >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                </button>

                {/* Header Profile Info */}
                <div className="mt-2 flex items-center justify-between border-b-2 border-dashed border-[var(--color-outline-variant)] pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-primary-container)] text-base font-black shadow-[1.5px_1.5px_0px_var(--color-ink)]">
                            {memberUser?.name ? memberUser.name[0].toUpperCase() : 'M'}
                        </div>
                        <div>
                            <h2 className="font-headline text-sm font-extrabold text-[var(--color-ink)]">
                                {memberUser?.name || 'Member Kafe'}
                            </h2>
                            <p className="text-[11px] font-bold text-[var(--color-ink-soft)]">
                                {memberUser?.phone || '-'} • Member Aktif
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-lg border border-[var(--color-ink)] bg-[var(--color-surface-container)] px-2.5 py-1 text-[11px] font-extrabold text-[var(--color-promo)] hover:bg-rose-50 shadow-xs"
                    >
                        Keluar
                    </button>
                </div>

                {/* Body Content */}
                <div className="mt-3 flex-1 overflow-y-auto pr-1 space-y-3">
                    {isLoading && (
                        <div className="py-12 text-center">
                            <span className="material-symbols-outlined text-[28px] text-[var(--color-promo)] animate-spin">
                                progress_activity
                            </span>
                            <p className="mt-2 text-xs font-bold text-[var(--color-ink-soft)]">
                                Mengambil riwayat struk pesanan...
                            </p>
                        </div>
                    )}

                    {!isLoading && errorMsg && (
                        <div className="rounded-xl border border-[var(--color-ink)] bg-rose-50 p-3 text-center text-xs text-rose-800">
                            {errorMsg}
                        </div>
                    )}

                    {!isLoading && !errorMsg && orders.length === 0 && (
                        <div className="py-10 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-surface-container)]">
                                <span className="material-symbols-outlined text-[32px] text-[var(--color-ink-soft)]">
                                    receipt_long
                                </span>
                            </div>
                            <h3 className="mt-3 font-headline text-sm font-extrabold text-[var(--color-ink)]">
                                Belum Ada Riwayat Pesanan
                            </h3>
                            <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
                                Pesan menu favoritmu dan struk akan otomatis tersimpan di sini!
                            </p>
                        </div>
                    )}

                    {!isLoading &&
                        orders.map((order) => {
                            const badge = getStatusBadge(order.status);
                            return (
                                <div
                                    key={order.id}
                                    className="rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] p-3 shadow-[2px_2px_0px_var(--color-ink)] space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-extrabold text-xs text-[var(--color-ink)]">
                                                {order.order_code}
                                            </span>
                                            <span className="rounded bg-[var(--color-surface)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--color-ink)] border border-[var(--color-outline-variant)]">
                                                {order.session_type === 'dine_in'
                                                    ? `Meja ${order.table_number || '-'}`
                                                    : 'Takeaway'}
                                            </span>
                                        </div>
                                        <span className={`rounded-full border px-2 py-0.2 text-[10px] font-extrabold ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-xs text-[var(--color-ink)]">
                                        {order.items &&
                                            order.items.map((item) => (
                                                <div key={item.id} className="flex justify-between text-[11px]">
                                                    <span className="truncate">
                                                        {item.quantity}x {item.menu_name}
                                                    </span>
                                                    <span className="font-bold whitespace-nowrap ml-2">
                                                        {formatRupiah(item.total_price)}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-dashed border-[var(--color-outline-variant)] pt-2 text-xs">
                                        <span className="text-[10px] text-[var(--color-ink-soft)]">
                                            {order.formatted_date || order.created_at}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-headline font-black text-xs text-[var(--color-ink)]">
                                                {formatRupiah(order.total)}
                                            </span>
                                            <a
                                                href={`/order/track/${order.id}`}
                                                className="rounded-md border border-[var(--color-ink)] bg-[var(--color-primary-container)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-ink)] shadow-xs hover:bg-[var(--color-primary)] hover:text-white transition-all"
                                            >
                                                Lihat
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
