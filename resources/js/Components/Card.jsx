/**
 * Sketchbook paper card (F25, UI-4): solid marker shadow, no blur.
 */
export default function Card({ children, className = '' }) {
    return (
        <div
            className={`rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-tactile-md)] ${className}`}
        >
            {children}
        </div>
    );
}
