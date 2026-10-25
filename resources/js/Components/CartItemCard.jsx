import { useState } from 'react';
import { formatRupiah } from '../Utils/formatRupiah';

/**
 * Cart Item Card (RFC-005, F12).
 * Displays polaroid photo frame, complete modifiers, quantity stepper,
 * edit trigger for CustomizerDrawer, and delete trigger with animated transition.
 */
export default function CartItemCard({
    item,
    onUpdateQuantity,
    onEdit,
    onRemove,
}) {
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemoveClick = () => {
        setIsRemoving(true);
        setTimeout(() => {
            onRemove(item.itemKey);
        }, 220);
    };

    const handleDecrement = () => {
        if (item.quantity > 1) {
            onUpdateQuantity(item.itemKey, item.quantity - 1);
        } else {
            handleRemoveClick();
        }
    };

    const handleIncrement = () => {
        if (item.quantity < 20) {
            onUpdateQuantity(item.itemKey, item.quantity + 1);
        }
    };

    const itemUnitPrice = Number(item.unitPrice ?? item.basePrice ?? 0);
    const itemSubtotal = itemUnitPrice * Number(item.quantity ?? 1);

    return (
        <div
            className={`relative rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] p-3.5 marker-shadow-md transition-all duration-200 ${
                isRemoving
                    ? 'scale-95 opacity-0 translate-x-4 pointer-events-none'
                    : 'scale-100 opacity-100'
            }`}
        >
            {/* Faux Corner Washi Strip (UI-5) */}
            <div
                aria-hidden="true"
                className="absolute -top-1.5 left-6 h-3.5 w-12 -rotate-3 rounded-xs bg-[var(--color-primary)] opacity-85 shadow-xs pointer-events-none"
            />

            <div className="flex items-start gap-3">
                {/* Polaroid Frame for Menu Image */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] p-1 shadow-[2px_2px_0px_var(--color-ink)] -rotate-1">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full rounded object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded bg-[var(--color-container)] text-2xl">
                            ☕
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Title and Action Buttons */}
                    <div className="flex items-start justify-between gap-1">
                        <h3 className="text-base font-extrabold leading-tight text-[var(--color-ink)]">
                            {item.name}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                            {/* Edit / Change Variant Button */}
                            <button
                                type="button"
                                onClick={() => onEdit(item)}
                                aria-label={`Ubah varian ${item.name}`}
                                className="flex h-7 w-7 items-center justify-center rounded border border-[var(--color-ink)] bg-[var(--color-surface-container)] text-[var(--color-ink)] shadow-[1.5px_1.5px_0px_var(--color-ink)] hover:bg-[var(--color-surface-container-high)] active:scale-90"
                            >
                                <span aria-hidden="true" className="material-symbols-outlined text-[15px]">
                                    stylus_note
                                </span>
                            </button>

                            {/* Remove Item Button */}
                            <button
                                type="button"
                                onClick={handleRemoveClick}
                                aria-label={`Hapus ${item.name} dari keranjang`}
                                className="flex h-7 w-7 items-center justify-center rounded border border-[var(--color-ink)] bg-[var(--color-error-container)] text-[var(--color-error)] shadow-[1.5px_1.5px_0px_var(--color-ink)] hover:opacity-85 active:scale-90"
                            >
                                <span aria-hidden="true" className="material-symbols-outlined text-[15px]">
                                    delete_sweep
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Modifiers Badges */}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                        {item.temperature ? (
                            <span className="rounded-sm border border-[var(--color-ink)] bg-[var(--color-surface-container-highest)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--color-ink)]">
                                {item.temperature}
                            </span>
                        ) : null}

                        {item.sugarLevel ? (
                            <span className="rounded-sm border border-[var(--color-ink)] bg-[var(--color-surface-container-highest)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--color-ink)]">
                                {item.sugarLevel}
                            </span>
                        ) : null}

                        {item.milk?.name && item.milk.name !== 'Fresh Milk (Reguler)' ? (
                            <span className="rounded-sm border border-[var(--color-ink)] bg-[var(--color-primary)] px-1.5 py-0.2 text-[10px] font-extrabold text-[var(--color-ink)]">
                                + {item.milk.name}
                            </span>
                        ) : null}

                        {item.spiceLevel ? (
                            <span className="rounded-sm border border-[var(--color-ink)] bg-[var(--color-promo)]/20 px-1.5 py-0.2 text-[10px] font-bold text-[var(--color-promo)]">
                                {item.spiceLevel}
                            </span>
                        ) : null}

                        {item.eggOption ? (
                            <span className="rounded-sm border border-[var(--color-ink)] bg-[var(--color-surface-container-highest)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--color-ink)]">
                                {item.eggOption}
                            </span>
                        ) : null}

                        {Array.isArray(item.toppings) &&
                            item.toppings.map((top) => (
                                <span
                                    key={top.name}
                                    className="rounded-sm border border-[var(--color-ink)] bg-[var(--color-primary)] px-1.5 py-0.2 text-[10px] font-extrabold text-[var(--color-ink)]"
                                >
                                    + {top.name}
                                </span>
                            ))}
                    </div>

                    {/* Barista Special Notes */}
                    {item.notes ? (
                        <div className="mt-1.5 flex items-center gap-1 rounded bg-[var(--color-surface)]/80 px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-ink-soft)] italic">
                            <span aria-hidden="true" className="material-symbols-outlined text-[13px]">
                                edit_note
                            </span>
                            <span className="truncate">"{item.notes}"</span>
                        </div>
                    ) : null}

                    {/* Price and Quantity Stepper */}
                    <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-[var(--color-outline)] pt-2">
                        <span className="text-sm font-extrabold text-[var(--color-promo)]">
                            {formatRupiah(itemSubtotal)}
                        </span>

                        {/* Stepper (+ / -) */}
                        <div className="flex items-center gap-1.5 rounded-lg border border-[var(--color-ink)] bg-[var(--color-surface-container)] px-2 py-0.5 shadow-[1.5px_1.5px_0px_var(--color-ink)]">
                            <button
                                type="button"
                                onClick={handleDecrement}
                                aria-label={`Kurangi kuantitas ${item.name}`}
                                className="flex h-5 w-5 items-center justify-center font-extrabold text-[var(--color-ink)] hover:text-[var(--color-promo)] active:scale-90"
                            >
                                <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
                                    remove
                                </span>
                            </button>
                            <span className="px-1 text-xs font-extrabold text-[var(--color-ink)]">
                                {item.quantity}
                            </span>
                            <button
                                type="button"
                                onClick={handleIncrement}
                                aria-label={`Tambah kuantitas ${item.name}`}
                                className="flex h-5 w-5 items-center justify-center font-extrabold text-[var(--color-ink)] hover:text-[var(--color-promo)] active:scale-90"
                            >
                                <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
                                    add
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
