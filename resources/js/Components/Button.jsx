/**
 * Tactile sketchbook button (F25, UI-4): hard marker shadow
 * displaces on press for instant tactile feedback.
 */
export default function Button({ children, variant = 'primary', className = '', ...props }) {
    const base =
        'btn-tactile inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 border-[var(--color-ink)] px-5 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]';

    const variants = {
        primary: 'bg-[var(--color-primary)] text-[var(--color-ink)]',
        surface: 'bg-[var(--color-surface-container-lowest)] text-[var(--color-ink)]',
        promo: 'bg-[var(--color-promo)] text-[var(--color-surface)]',
    };

    return (
        <button className={`${base} ${variants[variant] ?? variants.primary} ${className}`} {...props}>
            {children}
        </button>
    );
}
