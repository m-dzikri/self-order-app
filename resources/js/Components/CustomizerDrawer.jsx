import { useState, useMemo, useEffect } from 'react';
import { formatRupiah } from '../Utils/formatRupiah';
import { calculateItemTotal } from '../Utils/calculateItemTotal';

/**
 * CustomizerDrawer Component (RFC-004 F8, F9, F10, F11, RFC-005 F12):
 * Bottom sheet modal for drink & food modifiers, toppings, barista notes, quantity stepper, and live subtotal.
 */
export default function CustomizerDrawer({ menu, isOpen, onClose, onAddToCart, initialPayload = null }) {
    if (!isOpen || !menu) return null;

    const isDrink = menu.category?.slug === 'kopi-susu' || menu.category?.slug === 'manual-brew' || menu.category?.slug === 'non-kopi';
    const isFood = menu.category?.slug === 'makanan-berat';

    // Temperature (Suhu)
    const [temperature, setTemperature] = useState('ice');

    // Sugar level (Kemanisan)
    const [sugarLevel, setSugarLevel] = useState('100');

    // Food spice & egg options (for makanan berat)
    const [spiceLevel, setSpiceLevel] = useState('level-1');
    const [eggOption, setEggOption] = useState('setengah-matang');

    // Milk modifiers from database (type === 'susu')
    const milkOptions = useMemo(() => {
        return (menu.modifiers || []).filter((m) => m.type === 'susu');
    }, [menu.modifiers]);

    const defaultMilk = milkOptions.length > 0 ? milkOptions[0] : null;
    const [selectedMilk, setSelectedMilk] = useState(defaultMilk);

    // Toppings / Addons from database (type === 'topping')
    const toppingOptions = useMemo(() => {
        return (menu.modifiers || []).filter((m) => m.type === 'topping');
    }, [menu.modifiers]);

    const [selectedToppings, setSelectedToppings] = useState([]);

    // Quantity stepper (min 1, max 20 per RFC)
    const [quantity, setQuantity] = useState(1);

    // Barista notes
    const [notes, setNotes] = useState('');

    // Pre-populate when initialPayload is passed (e.g. Editing variant in Cart F12)
    useEffect(() => {
        if (!isOpen) return;
        if (initialPayload) {
            if (initialPayload.temperature) setTemperature(initialPayload.temperature);
            if (initialPayload.sugarLevel) setSugarLevel(initialPayload.sugarLevel);
            if (initialPayload.spiceLevel) setSpiceLevel(initialPayload.spiceLevel);
            if (initialPayload.eggOption) setEggOption(initialPayload.eggOption);
            if (initialPayload.milk) {
                const foundMilk = milkOptions.find((m) => m.name === initialPayload.milk.name);
                setSelectedMilk(foundMilk || initialPayload.milk);
            }
            if (Array.isArray(initialPayload.toppings)) {
                const foundToppings = toppingOptions.filter((t) =>
                    initialPayload.toppings.some((pt) => pt.name === t.name)
                );
                setSelectedToppings(foundToppings.length > 0 ? foundToppings : initialPayload.toppings);
            }
            if (initialPayload.quantity) setQuantity(Number(initialPayload.quantity));
            if (initialPayload.notes !== undefined) setNotes(initialPayload.notes);
        } else {
            setTemperature('ice');
            setSugarLevel('100');
            setSpiceLevel('level-1');
            setEggOption('setengah-matang');
            setSelectedMilk(defaultMilk);
            setSelectedToppings([]);
            setQuantity(1);
            setNotes('');
        }
    }, [isOpen, initialPayload, menu]);

    // Toggle topping
    const toggleTopping = (topping) => {
        setSelectedToppings((prev) => {
            const exists = prev.some((t) => t.id === topping.id);
            if (exists) {
                return prev.filter((t) => t.id !== topping.id);
            }
            return [...prev, topping];
        });
    };

    // Live price calculation (base + milk + toppings) * quantity
    const pricing = useMemo(() => {
        const modifiersList = [];
        if (selectedMilk) modifiersList.push(selectedMilk);
        return calculateItemTotal(menu.price, modifiersList, selectedToppings, quantity);
    }, [menu.price, selectedMilk, selectedToppings, quantity]);

    // Handle submit
    const handleAddToCart = () => {
        const payload = {
            menuId: menu.id,
            name: menu.name,
            basePrice: menu.price,
            quantity,
            temperature: isDrink ? temperature : null,
            sugarLevel: isDrink ? sugarLevel : null,
            spiceLevel: isFood ? spiceLevel : null,
            eggOption: isFood ? eggOption : null,
            milk: selectedMilk ? { name: selectedMilk.name, extraPrice: selectedMilk.extra_price } : null,
            toppings: selectedToppings.map((t) => ({ name: t.name, extraPrice: t.extra_price })),
            notes: notes.trim(),
            unitPrice: pricing.unitPrice,
            totalPrice: pricing.totalPrice,
        };

        if (onAddToCart) {
            onAddToCart(payload);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-ink)]/50 backdrop-blur-sm" role="dialog" aria-modal="true">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} aria-label="Tutup kustomisasi" />

            <div className="relative z-10 flex max-h-[90vh] w-full max-w-[480px] flex-col overflow-y-auto rounded-t-3xl border-t-2 border-x-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] p-4 shadow-[0_-8px_24px_rgba(74,44,23,0.18)]">
                {/* Drag Handle Doodle */}
                <div className="flex w-full justify-center pb-2">
                    <div className="h-1.5 w-16 rounded-full bg-[var(--color-ink)]/30 -rotate-1" />
                </div>

                {/* Header Polaroid Card */}
                <div className="relative mb-4 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container)] p-3 marker-shadow-sm">
                    <div className="flex gap-3 items-center">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-high)] text-3xl">
                            {isFood ? '🍜' : '☕'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="truncate font-extrabold text-lg text-[var(--color-ink)]">
                                {menu.name}
                            </h2>
                            <p className="line-clamp-1 text-xs text-[var(--color-ink-soft)]">
                                {menu.description}
                            </p>
                            <span className="mt-1 inline-block rounded border border-[var(--color-ink)] bg-[var(--color-primary)] px-2 py-0.5 text-xs font-bold text-[var(--color-ink)]">
                                {formatRupiah(menu.price)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Tutup modal kustomisasi"
                            className="flex h-8 w-8 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-high)] text-[var(--color-ink)] marker-shadow-sm hover:bg-[var(--color-surface-dim)]"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Modifier Groups */}
                <div className="space-y-4 pb-20">
                    {/* Suhu (Minuman) */}
                    {isDrink ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                                <span>🌡️ Pilihan Suhu</span>
                                <span className="rounded bg-[var(--color-primary)] px-1.5 py-0.5 text-[10px]">Wajib</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTemperature('ice')}
                                    className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border-2 border-[var(--color-ink)] px-3 py-2 text-sm font-bold transition-all ${
                                        temperature === 'ice'
                                            ? '-rotate-1 bg-[var(--color-primary)] text-[var(--color-ink)] marker-shadow-md'
                                            : 'bg-[var(--color-surface-container)] text-[var(--color-ink-soft)] marker-shadow-sm'
                                    }`}
                                >
                                    <span>❄️</span>
                                    <span>Dingin (Ice)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTemperature('hot')}
                                    className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border-2 border-[var(--color-ink)] px-3 py-2 text-sm font-bold transition-all ${
                                        temperature === 'hot'
                                            ? 'rotate-1 bg-[var(--color-primary)] text-[var(--color-ink)] marker-shadow-md'
                                            : 'bg-[var(--color-surface-container)] text-[var(--color-ink-soft)] marker-shadow-sm'
                                    }`}
                                >
                                    <span>🔥</span>
                                    <span>Panas (Hot)</span>
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {/* Kemanisan (Minuman) */}
                    {isDrink ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                                <span>🍬 Tingkat Kemanisan</span>
                                <span className="text-[10px] text-[var(--color-ink-soft)]">Pilih 1</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {[
                                    { value: '0', label: 'Tanpa Gula (0%)' },
                                    { value: '50', label: 'Less Sugar (50%)' },
                                    { value: '100', label: 'Normal (100%)' },
                                    { value: '120', label: 'Extra Sweet (120%)' },
                                ].map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => setSugarLevel(item.value)}
                                        className={`flex min-h-[40px] items-center justify-center rounded-xl border-2 border-[var(--color-ink)] px-2 py-1.5 font-bold transition-all ${
                                            sugarLevel === item.value
                                                ? 'bg-[var(--color-primary)] text-[var(--color-ink)] marker-shadow-md -rotate-0.5'
                                                : 'bg-[var(--color-surface-container)] text-[var(--color-ink-soft)] marker-shadow-sm'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Opsi Makanan (Level Pedas & Telur) */}
                    {isFood ? (
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                                    🌶️ Level Pedas
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {[
                                        { value: 'level-0', label: 'Level 0 (Tidak Pedas)' },
                                        { value: 'level-1', label: 'Level 1 (Sedang)' },
                                        { value: 'level-2', label: 'Level 2 (Pedas)' },
                                        { value: 'level-3', label: 'Level 3 (Ekstra Pedas)' },
                                    ].map((spice) => (
                                        <button
                                            key={spice.value}
                                            type="button"
                                            onClick={() => setSpiceLevel(spice.value)}
                                            className={`flex min-h-[40px] items-center justify-center rounded-xl border-2 border-[var(--color-ink)] px-2 py-1.5 font-bold ${
                                                spiceLevel === spice.value
                                                    ? 'bg-[var(--color-primary)] text-[var(--color-ink)] marker-shadow-md'
                                                    : 'bg-[var(--color-surface-container)] text-[var(--color-ink-soft)] marker-shadow-sm'
                                            }`}
                                        >
                                            {spice.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                                    🍳 Pematangan Telur
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {[
                                        { value: 'setengah-matang', label: '½ Matang' },
                                        { value: 'matang', label: 'Matang Sempurna' },
                                    ].map((egg) => (
                                        <button
                                            key={egg.value}
                                            type="button"
                                            onClick={() => setEggOption(egg.value)}
                                            className={`flex min-h-[40px] items-center justify-center rounded-xl border-2 border-[var(--color-ink)] px-2 py-1.5 font-bold ${
                                                eggOption === egg.value
                                                    ? 'bg-[var(--color-primary)] text-[var(--color-ink)] marker-shadow-md'
                                                    : 'bg-[var(--color-surface-container)] text-[var(--color-ink-soft)] marker-shadow-sm'
                                            }`}
                                        >
                                            {egg.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Pilihan Susu (Jika ada modifier type 'susu') */}
                    {milkOptions.length > 0 ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                                <span>🥛 Pilihan Jenis Susu</span>
                                <span className="text-[10px] text-[var(--color-ink-soft)]">Pilih 1</span>
                            </div>
                            <div className="space-y-1.5">
                                {milkOptions.map((milk) => {
                                    const isSelected = selectedMilk?.id === milk.id;
                                    return (
                                        <button
                                            key={milk.id}
                                            type="button"
                                            onClick={() => setSelectedMilk(milk)}
                                            className={`flex w-full min-h-[44px] items-center justify-between rounded-xl border-2 border-[var(--color-ink)] p-2.5 text-xs font-bold transition-all ${
                                                isSelected
                                                    ? 'bg-[var(--color-primary)] text-[var(--color-ink)] marker-shadow-md'
                                                    : 'bg-[var(--color-surface-container)] text-[var(--color-ink-soft)] marker-shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{isSelected ? '🔘' : '⚪'}</span>
                                                <span>{milk.name}</span>
                                            </div>
                                            <span className="rounded bg-[var(--color-surface-container-lowest)] px-2 py-0.5 text-xs">
                                                {milk.extra_price > 0 ? `+${formatRupiah(milk.extra_price)}` : 'Gratis'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    {/* Topping Ekstra (Multi-select) */}
                    {toppingOptions.length > 0 ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                                <span>✨ Tambahan Ekstra / Topping</span>
                                <span className="text-[10px] text-[var(--color-ink-soft)]">Bisa pilih lebih dari 1</span>
                            </div>
                            <div className="space-y-1.5">
                                {toppingOptions.map((top) => {
                                    const isChecked = selectedToppings.some((t) => t.id === top.id);
                                    return (
                                        <button
                                            key={top.id}
                                            type="button"
                                            onClick={() => toggleTopping(top)}
                                            className={`flex w-full min-h-[44px] items-center justify-between rounded-xl border-2 border-[var(--color-ink)] p-2.5 text-xs font-bold transition-all ${
                                                isChecked
                                                    ? 'bg-[var(--color-container)] text-[var(--color-ink)] marker-shadow-md'
                                                    : 'bg-[var(--color-surface-container)] text-[var(--color-ink-soft)] marker-shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{isChecked ? '☑️' : '⬜'}</span>
                                                <span>{top.name}</span>
                                            </div>
                                            <span className="rounded border border-[var(--color-ink)] bg-[var(--color-primary)] px-2 py-0.5 text-xs text-[var(--color-ink)]">
                                                +{formatRupiah(top.extra_price)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    {/* Catatan Barista (Sticky Note style) */}
                    <div className="relative rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary-dim)] p-3 marker-shadow-sm -rotate-0.5">
                        <label htmlFor="barista-notes" className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
                            📝 Catatan untuk Barista
                        </label>
                        <textarea
                            id="barista-notes"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Contoh: es batunya sedikit aja, jangan terlalu manis ya kak..."
                            className="w-full rounded-lg border border-[var(--color-ink)] bg-[var(--color-surface)] p-2 text-xs font-semibold text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)]/60 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="sticky bottom-0 -mx-4 -mb-4 flex items-center gap-3 border-t-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] p-4 backdrop-blur-md">
                    {/* Stepper Quantity */}
                    <div className="flex items-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container)] p-1 marker-shadow-sm">
                        <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                            aria-label="Kurangi porsi"
                            className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] text-base font-extrabold text-[var(--color-ink)] disabled:opacity-40"
                        >
                            −
                        </button>
                        <span className="w-9 text-center font-extrabold text-base text-[var(--color-ink)]" aria-label="Jumlah porsi">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                            disabled={quantity >= 20}
                            aria-label="Tambah porsi"
                            className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] text-base font-extrabold text-[var(--color-ink)] disabled:opacity-40"
                        >
                            +
                        </button>
                    </div>

                    {/* Add to Cart CTA with Live Total */}
                    <button
                        type="button"
                        id="add-to-cart-btn"
                        onClick={handleAddToCart}
                        className="btn-tactile flex-1 flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary)] px-4 py-2 font-extrabold text-sm text-[var(--color-ink)]"
                    >
                        <span>
                            {initialPayload ? 'Simpan • ' : 'Tambah • '}
                            {formatRupiah(pricing.totalPrice)}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
