/**
 * CategoryTabs Component (RFC-004 F5):
 * Horizontal category selector with sketchbook torn-tab aesthetic and tactile active states.
 */
export default function CategoryTabs({ categories = [], selectedSlug = 'all', onSelect }) {
    const allTab = { id: 0, name: 'Semua', slug: 'all' };
    const tabList = [allTab, ...categories];

    return (
        <div className="flex w-full flex-col space-y-1.5">
            <div className="flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider text-[var(--color-ink-soft)]">
                <span className="flex items-center gap-1">
                    <span>📑</span> Kategori Sketsa
                </span>
                <span>{tabList.length} Pilihan</span>
            </div>
            <div className="flex gap-2 overflow-x-auto py-1.5 px-0.5" role="tablist" aria-label="Kategori Menu">
                {tabList.map((cat) => {
                    const isActive = selectedSlug === cat.slug;
                    return (
                        <button
                            key={cat.slug}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => onSelect(cat.slug)}
                            className={`category-chip shrink-0 rounded-xl border-2 border-[var(--color-ink)] px-4 py-2 font-bold text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] ${
                                isActive
                                    ? '-rotate-1 bg-[var(--color-primary)] text-[var(--color-ink)] marker-shadow-md'
                                    : 'bg-[var(--color-surface-container-low)] text-[var(--color-ink-soft)] marker-shadow-sm hover:bg-[var(--color-surface-container)] hover:-translate-y-0.5 active:translate-y-0.5'
                            }`}
                        >
                            {cat.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
