import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import SearchBar from '../Components/SearchBar';
import CategoryTabs from '../Components/CategoryTabs';
import MenuCard from '../Components/MenuCard';
import EmptyMenuState from '../Components/EmptyMenuState';
import CustomizerDrawer from '../Components/CustomizerDrawer';
import { formatRupiah } from '../Utils/formatRupiah';

export default function Catalog({ appName = 'Kopi Corat-Coret', categories = [], menus = [], orderSession = {} }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
    const [activeCustomizerMenu, setActiveCustomizerMenu] = useState(null);
    const [cartCount, setCartCount] = useState(() => {
        try {
            const raw = localStorage.getItem('sketchbook_cart');
            return raw ? JSON.parse(raw).length : 0;
        } catch {
            return 0;
        }
    });

    // Feedback notification banner when item is added to cart
    const [cartNotice, setCartNotice] = useState(null);

    // Filtered menu list based on category tab & search query
    const filteredMenus = useMemo(() => {
        return menus.filter((menu) => {
            const matchesCategory =
                selectedCategorySlug === 'all' || menu.category?.slug === selectedCategorySlug;

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                menu.name.toLowerCase().includes(q) ||
                (menu.description && menu.description.toLowerCase().includes(q));

            return matchesCategory && matchesSearch;
        });
    }, [menus, selectedCategorySlug, searchQuery]);

    // Handle adding item to cart (local storage per DATA-1 / DATA-3)
    const handleAddToCart = (itemPayload) => {
        try {
            const existingRaw = localStorage.getItem('sketchbook_cart');
            const cartItems = existingRaw ? JSON.parse(existingRaw) : [];

            // Deterministic hash/key based on menuId, temp, sugar, milk, and toppings (DATA-3)
            const itemKey = [
                itemPayload.menuId,
                itemPayload.temperature || 'none',
                itemPayload.sugarLevel || 'none',
                itemPayload.spiceLevel || 'none',
                itemPayload.eggOption || 'none',
                itemPayload.milk?.name || 'none',
                (itemPayload.toppings || []).map((t) => t.name).sort().join(','),
                itemPayload.notes || '',
            ].join('|');

            const existingIndex = cartItems.findIndex((i) => i.itemKey === itemKey);

            if (existingIndex >= 0) {
                cartItems[existingIndex].quantity += itemPayload.quantity;
                cartItems[existingIndex].totalPrice += itemPayload.totalPrice;
            } else {
                cartItems.push({
                    ...itemPayload,
                    itemKey,
                });
            }

            localStorage.setItem('sketchbook_cart', JSON.stringify(cartItems));
            setCartCount(cartItems.length);

            // Show feedback notice
            setCartNotice(`✨ ${itemPayload.name} (${itemPayload.quantity}x) ditambahkan ke keranjang!`);
            setTimeout(() => setCartNotice(null), 3000);
        } catch (e) {
            console.error('Failed to update cart', e);
        }

        setActiveCustomizerMenu(null);
    };

    return (
        <AppLayout>
            <Head title={`Katalog Menu - ${appName}`} />

            {/* Top Navigation Bar with Logo, Table Session, and Cart Counter */}
            <header className="mb-4 flex items-center justify-between border-b-2 border-dashed border-[var(--color-outline)] pb-3">
                <div className="flex items-center gap-2.5">
                    <Link
                        href="/"
                        aria-label="Kembali ke halaman utama"
                        className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] text-base font-extrabold text-[var(--color-ink)] marker-shadow-sm hover:bg-[var(--color-surface-container)] active:translate-y-0.5"
                    >
                        ←
                    </Link>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm text-[var(--color-ink)]">
                                {appName}
                            </span>
                            {orderSession.type === 'dine_in' && orderSession.table_number ? (
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
                            Papan Menu Kafe
                        </h1>
                    </div>
                </div>

                {/* Cart Icon CTA (links to RFC-005 Cart) */}
                <Link
                    href="/keranjang"
                    aria-label={`Keranjang belanja, ${cartCount} item`}
                    className="relative flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] text-xl marker-shadow-md hover:bg-[var(--color-surface-container)] active:translate-x-0.5 active:translate-y-0.5"
                >
                    ☕
                    {cartCount > 0 ? (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-ink)] bg-[var(--color-promo)] text-[11px] font-extrabold text-[var(--color-surface)] shadow-[1px_1px_0px_var(--color-ink)]">
                            {cartCount}
                        </span>
                    ) : null}
                </Link>
            </header>

            {/* Cart Feedback Flash Notice */}
            {cartNotice ? (
                <div
                    role="alert"
                    className="mb-4 flex items-center justify-between rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-[var(--color-ink)] marker-shadow-sm -rotate-0.5"
                >
                    <span>{cartNotice}</span>
                    <button
                        type="button"
                        onClick={() => setCartNotice(null)}
                        className="text-sm font-extrabold text-[var(--color-ink)] hover:opacity-75"
                    >
                        ✕
                    </button>
                </div>
            ) : null}

            {/* Sticky Search Bar */}
            <div className="sticky top-2 z-20 mb-3 bg-[var(--color-surface)]/95 pt-1 pb-2 backdrop-blur-sm">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onClear={() => setSearchQuery('')}
                />
            </div>

            {/* Category Tabs */}
            <div className="mb-4">
                <CategoryTabs
                    categories={categories}
                    selectedSlug={selectedCategorySlug}
                    onSelect={setSelectedCategorySlug}
                />
            </div>

            {/* Menu Grid or Empty State */}
            {filteredMenus.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 pb-8">
                    {filteredMenus.map((menu) => (
                        <MenuCard
                            key={menu.id}
                            menu={menu}
                            onSelect={(selected) => setActiveCustomizerMenu(selected)}
                        />
                    ))}
                </div>
            ) : (
                <EmptyMenuState
                    searchQuery={searchQuery}
                    onReset={() => {
                        setSearchQuery('');
                        setSelectedCategorySlug('all');
                    }}
                />
            )}

            {/* Customizer Drawer Modal */}
            <CustomizerDrawer
                menu={activeCustomizerMenu}
                isOpen={Boolean(activeCustomizerMenu)}
                onClose={() => setActiveCustomizerMenu(null)}
                onAddToCart={handleAddToCart}
            />

            {/* Floating Cart Dock (RFC-005, UI-6) */}
            {cartCount > 0 ? (
                <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-[448px]">
                    <Link
                        href="/keranjang"
                        className="btn-tactile flex min-h-[50px] items-center justify-between rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-4 py-3 font-extrabold text-sm text-[var(--color-ink)] marker-shadow-lg active:translate-y-0.5"
                    >
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-ink)] bg-[var(--color-promo)] text-xs text-[var(--color-surface)] shadow-[1px_1px_0px_var(--color-ink)]">
                                {cartCount}
                            </span>
                            <span>Lihat Sketsa Pesanan</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>Ke Nota</span>
                            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                                arrow_forward
                            </span>
                        </div>
                    </Link>
                </div>
            ) : null}
        </AppLayout>
    );
}
