import { formatRupiah } from '../Utils/formatRupiah';

/**
 * MenuCard Component (RFC-004 F8):
 * Polaroid sketchbook frame with promo badges, highlighter price, and tactile add button.
 */
export default function MenuCard({ menu, onSelect }) {
    const isInStock = Boolean(menu.is_in_stock);
    const badgeLabel = menu.badge === 'favorit' ? 'Favorit' : menu.badge === 'spesial' ? 'Spesial' : null;

    return (
        <article
            className={`relative flex flex-col rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-low)] p-3.5 marker-shadow-md transition-all ${
                isInStock ? 'hover:-translate-y-0.5' : 'opacity-70 grayscale-[30%]'
            }`}
        >
            {/* Washi tape badge for promo */}
            {badgeLabel ? (
                <div className="absolute -top-2.5 right-4 z-10 flex items-center gap-1 rounded-sm border border-[var(--color-ink)] bg-[var(--color-promo)] px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-[var(--color-surface)] shadow-[1px_1px_0px_var(--color-ink)] rotate-2">
                    <span>⭐</span>
                    <span>{badgeLabel}</span>
                </div>
            ) : null}

            <div className="flex gap-3">
                {/* Polaroid Frame */}
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-high)] p-1 marker-shadow-sm -rotate-1">
                    {menu.image_path ? (
                        <img
                            src={`/storage/${menu.image_path}`}
                            alt={menu.name}
                            className="h-full w-full rounded-lg object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-[var(--color-surface-container)] text-3xl">
                            {menu.category?.slug === 'makanan-berat' || menu.category?.slug === 'camilan' ? '🥐' : '☕'}
                        </div>
                    )}

                    {!isInStock ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-ink)]/70 text-xs font-extrabold uppercase text-[var(--color-surface)]">
                            Habis
                        </div>
                    ) : null}
                </div>

                {/* Content */}
                <div className="flex flex-1 min-w-0 flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-1">
                            <h3 className="truncate font-extrabold text-[17px] text-[var(--color-ink)]">
                                {menu.name}
                            </h3>
                        </div>
                        {menu.description ? (
                            <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-ink-soft)]">
                                {menu.description}
                            </p>
                        ) : null}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                        {/* Stabilo Highlighter Price */}
                        <span className="inline-block rounded-md border border-[var(--color-ink)] bg-[var(--color-primary)] px-2 py-0.5 text-xs font-extrabold text-[var(--color-ink)] marker-shadow-sm">
                            {formatRupiah(menu.price)}
                        </span>

                        {isInStock ? (
                            <button
                                type="button"
                                onClick={() => onSelect(menu)}
                                aria-label={`Pilih ${menu.name}`}
                                className="btn-tactile inline-flex min-h-[38px] min-w-[38px] items-center justify-center gap-1 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] px-3 py-1 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-container)]"
                            >
                                <span>Tambah</span>
                                <span className="text-base leading-none">+</span>
                            </button>
                        ) : (
                            <span className="text-xs font-bold text-[var(--color-error)]">
                                Stok Habis
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
