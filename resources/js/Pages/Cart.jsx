import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '../Layouts/AppLayout';
import CartItemCard from '../Components/CartItemCard';
import CouponInputBox from '../Components/CouponInputBox';
import ReceiptDocket from '../Components/ReceiptDocket';
import EmptyCartState from '../Components/EmptyCartState';
import CustomizerDrawer from '../Components/CustomizerDrawer';
import PaymentMethodSelector from '../Components/PaymentMethodSelector';
import QRISModal from '../Components/QRISModal';
import CashierInstructionModal from '../Components/CashierInstructionModal';
import { formatRupiah } from '../Utils/formatRupiah';
import { calculateCartTotals } from '../Utils/calculateCartTotals';

/**
 * Shopping Cart & Payment Checkout Page (RFC-005, RFC-006, F12-F19).
 * Features complete cart modification, coupon discounts, PB1 tax,
 * and 3 payment methods with dynamic 15-minute QRIS & Cashier flows.
 */
export default function Cart({
    appName = 'Kopi Corat-Coret',
    menus = [],
    orderSession = {},
    defaultPromo = {},
}) {
    // 1. Initialize Cart Items from LocalStorage
    const [cartItems, setCartItems] = useState(() => {
        try {
            const raw = localStorage.getItem('sketchbook_cart');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    // 2. Initialize Applied Coupon from LocalStorage
    const [appliedCoupon, setAppliedCoupon] = useState(() => {
        try {
            return localStorage.getItem('sketchbook_coupon') || null;
        } catch {
            return null;
        }
    });

    // 3. Item currently being edited in CustomizerDrawer
    const [editingItem, setEditingItem] = useState(null);

    // 4. Payment method selector (RFC-006, F16)
    const [selectedPayment, setSelectedPayment] = useState('qris');

    // 5. Checkout state & modals (RFC-006, F17, F18, F19)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeQRISOrder, setActiveQRISOrder] = useState(null);
    const [activeCashierOrder, setActiveCashierOrder] = useState(null);

    // 6. User feedback banner
    const [feedbackToast, setFeedbackToast] = useState(null);

    // Persist cart items to localStorage
    const persistCart = (newItems) => {
        setCartItems(newItems);
        try {
            localStorage.setItem('sketchbook_cart', JSON.stringify(newItems));
        } catch (e) {
            console.error('Failed to persist cart items', e);
        }
    };

    // Calculate cart totals (subtotal, discount, pb1Tax, total)
    const totals = useMemo(() => {
        return calculateCartTotals(cartItems, appliedCoupon);
    }, [cartItems, appliedCoupon]);

    // Handle quantity update (F12)
    const handleUpdateQuantity = (itemKey, newQuantity) => {
        const updated = cartItems.map((item) => {
            if (item.itemKey === itemKey) {
                const qty = Math.max(1, Math.min(20, Number(newQuantity)));
                const unit = Number(item.unitPrice ?? item.basePrice ?? 0);
                return {
                    ...item,
                    quantity: qty,
                    totalPrice: unit * qty,
                };
            }
            return item;
        });
        persistCart(updated);
    };

    // Handle removing item with feedback (F12)
    const handleRemoveItem = (itemKey) => {
        const removed = cartItems.find((i) => i.itemKey === itemKey);
        const updated = cartItems.filter((i) => i.itemKey !== itemKey);
        persistCart(updated);

        setFeedbackToast(
            removed
                ? `🗑️ ${removed.name} telah dihapus dari sketsa pesanan.`
                : 'Item berhasil dihapus dari pesanan.',
        );
        setTimeout(() => setFeedbackToast(null), 3500);
    };

    // Handle applying coupon (F13)
    const handleApplyCoupon = (code) => {
        setAppliedCoupon(code);
        try {
            localStorage.setItem('sketchbook_coupon', code);
        } catch {
            // ignore
        }
        setFeedbackToast(`🎉 Kupon diskon ${code} berhasil dipasang!`);
        setTimeout(() => setFeedbackToast(null), 3000);
    };

    // Handle removing coupon (F13)
    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        try {
            localStorage.removeItem('sketchbook_coupon');
        } catch {
            // ignore
        }
        setFeedbackToast('Kupon diskon telah dibatalkan.');
        setTimeout(() => setFeedbackToast(null), 3000);
    };

    // Handle opening CustomizerDrawer for editing an item (F12)
    const handleOpenEdit = (item) => {
        setEditingItem(item);
    };

    // Handle saving modified variant from CustomizerDrawer (F12)
    const handleSaveEditedVariant = (updatedPayload) => {
        if (!editingItem) return;

        // Recompute deterministic itemKey (DATA-3)
        const newItemKey = [
            updatedPayload.menuId,
            updatedPayload.temperature || 'none',
            updatedPayload.sugarLevel || 'none',
            updatedPayload.spiceLevel || 'none',
            updatedPayload.eggOption || 'none',
            updatedPayload.milk?.name || 'none',
            (updatedPayload.toppings || []).map((t) => t.name).sort().join(','),
            updatedPayload.notes || '',
        ].join('|');

        const updated = cartItems.map((item) => {
            if (item.itemKey === editingItem.itemKey) {
                return {
                    ...updatedPayload,
                    itemKey: newItemKey,
                };
            }
            return item;
        });

        persistCart(updated);
        setEditingItem(null);
        setFeedbackToast(`✨ Varian ${updatedPayload.name} berhasil diperbarui!`);
        setTimeout(() => setFeedbackToast(null), 3000);
    };

    // Handle Checkout Submission (RFC-006, F16, F19)
    const handleCheckout = async () => {
        if (cartItems.length === 0 || isSubmitting) return;

        setIsSubmitting(true);
        setFeedbackToast(null);

        const payload = {
            payment_method: selectedPayment,
            coupon_code: appliedCoupon,
            session_type: orderSession?.type || (orderSession?.table_number ? 'dine_in' : 'takeaway'),
            table_number: orderSession?.table_number || null,
            customer_name: orderSession?.customer_name || orderSession?.name || null,
            customer_phone: orderSession?.customer_phone || orderSession?.phone || null,
            pickup_time: orderSession?.pickup_time || orderSession?.pickupAt || null,
            items: cartItems.map((i) => ({
                menuId: i.menuId,
                quantity: i.quantity,
                temperature: i.temperature,
                sugarLevel: i.sugarLevel,
                spiceLevel: i.spiceLevel,
                eggOption: i.eggOption,
                milk: i.milk,
                toppings: i.toppings,
                notes: i.notes,
            })),
        };

        try {
            const response = await axios.post('/order/checkout', payload);
            const createdOrder = response.data?.order;

            if (createdOrder) {
                // Clear cart from client storage
                try {
                    localStorage.removeItem('sketchbook_cart');
                    localStorage.removeItem('sketchbook_coupon');
                    localStorage.setItem('sketchbook_active_order', JSON.stringify(createdOrder));
                } catch {
                    // ignore
                }

                setCartItems([]);
                setAppliedCoupon(null);

                // Open appropriate modal according to payment method (RFC-006)
                if (createdOrder.payment_method === 'kasir') {
                    setActiveCashierOrder(createdOrder);
                } else {
                    setActiveQRISOrder(createdOrder);
                }
            }
        } catch (err) {
            console.error('Checkout failed', err);
            const errorMsg =
                err.response?.data?.message || 'Gagal memproses pesanan. Silakan periksa kembali keranjang belanja.';
            setFeedbackToast(`⚠️ ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Find full menu object for CustomizerDrawer
    const editingMenu = useMemo(() => {
        if (!editingItem) return null;
        return (
            menus.find((m) => m.id === editingItem.menuId) || {
                id: editingItem.menuId,
                name: editingItem.name,
                price: editingItem.basePrice,
                category: { slug: 'kopi-susu' },
                modifiers: [],
            }
        );
    }, [editingItem, menus]);

    const isDineIn = orderSession.type === 'dine_in' && orderSession.table_number;

    return (
        <AppLayout>
            <Head title={`Keranjang Pesanan - ${appName}`} />

            {/* Sticky Top Header */}
            <header className="mb-4 flex items-center justify-between border-b-2 border-dashed border-[var(--color-outline)] pb-3">
                <div className="flex items-center gap-2.5">
                    <Link
                        href="/katalog"
                        aria-label="Kembali ke katalog menu"
                        className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] text-base font-extrabold text-[var(--color-ink)] marker-shadow-sm hover:bg-[var(--color-surface-container)] active:translate-y-0.5"
                    >
                        ←
                    </Link>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm text-[var(--color-ink)]">
                                {appName}
                            </span>
                            {isDineIn ? (
                                <span className="rounded-sm border border-[var(--color-ink)] bg-[var(--color-primary)] px-1.5 py-0.2 text-[11px] font-extrabold text-[var(--color-ink)] -rotate-1 shadow-[1px_1px_0px_var(--color-ink)]">
                                    Meja {orderSession.table_number}
                                </span>
                            ) : (
                                <span className="rounded-sm border border-[var(--color-ink)] bg-[var(--color-surface-container-high)] px-1.5 py-0.2 text-[11px] font-bold text-[var(--color-ink)] rotate-1 shadow-[1px_1px_0px_var(--color-ink)]">
                                    Takeaway
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl font-extrabold text-[var(--color-ink)]">
                            Keranjang &amp; Nota
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-ink-soft)]">
                    <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                        receipt_long
                    </span>
                    <span>{totals.totalQuantity} Item</span>
                </div>
            </header>

            {/* Feedback Alert Banner */}
            {feedbackToast ? (
                <div
                    role="alert"
                    className="mb-4 flex items-center justify-between rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-[var(--color-ink)] marker-shadow-sm -rotate-0.5"
                >
                    <span>{feedbackToast}</span>
                    <button
                        type="button"
                        onClick={() => setFeedbackToast(null)}
                        className="text-sm font-extrabold text-[var(--color-ink)] hover:opacity-75"
                    >
                        ✕
                    </button>
                </div>
            ) : null}

            {/* Empty State vs. Populated Cart */}
            {cartItems.length === 0 && !activeQRISOrder && !activeCashierOrder ? (
                <EmptyCartState />
            ) : (
                <div className="space-y-4 pb-12">
                    {/* Washi Tape Table Indicator (UI-5, Mockup) */}
                    <div className="flex items-center justify-center pt-1 pb-1">
                        <div className="relative flex items-center gap-2 rounded border-2 border-[var(--color-ink)] bg-[var(--color-container)] px-4 py-1.5 -rotate-1 shadow-[2px_2px_0px_var(--color-ink)]">
                            {/* Decorative Tape Ends */}
                            <span className="absolute -left-2.5 top-1/2 h-5 w-3 -translate-y-1/2 -rotate-12 rounded-xs bg-[var(--color-primary)] opacity-80 pointer-events-none" />
                            <span className="absolute -right-2.5 top-1/2 h-5 w-3 -translate-y-1/2 rotate-6 rounded-xs bg-[var(--color-primary)] opacity-80 pointer-events-none" />
                            <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--color-promo)]">
                                location_on
                            </span>
                            <span className="text-xs font-extrabold tracking-tight text-[var(--color-ink)]">
                                {isDineIn
                                    ? `Pesanan untuk Meja ${orderSession.table_number} (Dine-In)`
                                    : 'Pesanan untuk Bawa Pulang (Takeaway)'}
                            </span>
                        </div>
                    </div>

                    {/* Cart Header Section */}
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-extrabold text-[var(--color-ink)]">
                                Daftar Sketsa Pesanan
                            </h2>
                            <span className="rounded-full border border-[var(--color-ink)] bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-ink)] rotate-2 shadow-[1px_1px_0px_var(--color-ink)]">
                                {cartItems.length} Menu
                            </span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-ink-soft)]">
                            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
                                draw
                            </span>
                            Revisi sewaktu-waktu
                        </span>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                        {cartItems.map((item) => (
                            <CartItemCard
                                key={item.itemKey}
                                item={item}
                                onUpdateQuantity={handleUpdateQuantity}
                                onEdit={handleOpenEdit}
                                onRemove={handleRemoveItem}
                            />
                        ))}
                    </div>

                    {/* Add More Items Link Button */}
                    <Link
                        href="/katalog"
                        className="btn-tactile flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-high)]/70 px-4 py-3 text-xs font-extrabold text-[var(--color-ink)] marker-shadow-sm hover:bg-[var(--color-surface-container-high)] active:translate-y-0.5"
                    >
                        <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--color-promo)]">
                            add_circle
                        </span>
                        <span>+ Tambah Menu / Kudapan Lainnya</span>
                    </Link>

                    {/* Coupon Input Box */}
                    <CouponInputBox
                        appliedCoupon={appliedCoupon}
                        discountAmount={totals.discount}
                        onApplyCoupon={handleApplyCoupon}
                        onRemoveCoupon={handleRemoveCoupon}
                    />

                    {/* Physical Paper Receipt Docket */}
                    <ReceiptDocket
                        subtotal={totals.subtotal}
                        discount={totals.discount}
                        pb1Tax={totals.pb1Tax}
                        total={totals.total}
                        totalQuantity={totals.totalQuantity}
                        couponCode={appliedCoupon}
                        orderSession={orderSession}
                    />

                    {/* Payment Method Selector (RFC-006, F16) */}
                    <PaymentMethodSelector
                        selectedMethod={selectedPayment}
                        onChange={setSelectedPayment}
                    />

                    {/* Primary Sticky Checkout CTA (TC-006-1) */}
                    <div className="pt-2">
                        <button
                            type="button"
                            id="checkout-submit-btn"
                            disabled={isSubmitting || cartItems.length === 0}
                            onClick={handleCheckout}
                            className="btn-tactile flex w-full min-h-[50px] items-center justify-between rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-5 py-3.5 text-base font-extrabold text-[var(--color-ink)] marker-shadow-lg hover:bg-[var(--color-primary)] disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5"
                        >
                            <div className="flex items-center gap-2">
                                <span aria-hidden="true" className="material-symbols-outlined text-[22px]">
                                    {selectedPayment === 'kasir' ? 'payments' : 'local_cafe'}
                                </span>
                                <span>
                                    {isSubmitting
                                        ? 'Memproses Pesanan...'
                                        : selectedPayment === 'kasir'
                                        ? 'Pesan & Bayar di Kasir'
                                        : 'Pesan & Bayar Sekarang'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 font-extrabold">
                                <span>{formatRupiah(totals.total)}</span>
                                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                                    arrow_forward
                                </span>
                            </div>
                        </button>

                        {/* Barista Micro-Copy */}
                        <div className="mt-2 flex items-center justify-center gap-1.5 px-4 text-center">
                            <span aria-hidden="true" className="material-symbols-outlined text-[15px] text-[var(--color-promo)]">
                                soup_kitchen
                            </span>
                            <p className="text-[11px] font-semibold text-[var(--color-ink-soft)]">
                                Pesanan akan langsung diteruskan ke barista &amp; koki di dapur.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Customizer Drawer Modal for Editing Variant (F12) */}
            <CustomizerDrawer
                menu={editingMenu}
                isOpen={Boolean(editingItem)}
                initialPayload={editingItem}
                onClose={() => setEditingItem(null)}
                onAddToCart={handleSaveEditedVariant}
            />

            {/* QRIS Payment Screen Modal (RFC-006, F17, F18, TC-006-2) */}
            <QRISModal
                isOpen={Boolean(activeQRISOrder)}
                order={activeQRISOrder}
                onClose={() => setActiveQRISOrder(null)}
                onPaymentSuccess={(order) => {
                    setActiveQRISOrder(null);
                    setFeedbackToast(`✨ Pembayaran pesanan ${order.order_code} berhasil! Terima kasih!`);
                }}
                onSwitchToCashier={() => {
                    const current = activeQRISOrder;
                    setActiveQRISOrder(null);
                    setActiveCashierOrder({
                        ...current,
                        payment_method: 'kasir',
                        status: 'unpaid_cashier',
                    });
                }}
            />

            {/* Cashier Payment Instruction Modal (RFC-006, F19, TC-006-4) */}
            <CashierInstructionModal
                isOpen={Boolean(activeCashierOrder)}
                order={activeCashierOrder}
                onClose={() => setActiveCashierOrder(null)}
                onViewTracker={() => {
                    setActiveCashierOrder(null);
                    setFeedbackToast(`Pesanan ${activeCashierOrder?.order_code} tercatat. Silakan bayar di kasir.`);
                }}
            />
        </AppLayout>
    );
}
