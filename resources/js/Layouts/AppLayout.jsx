/**
 * App shell (UI-6): mobile-first layout capped at 480px on wide screens.
 */
export default function AppLayout({ children }) {
    return (
        <div className="sketchbook-container min-h-screen px-4 py-6">{children}</div>
    );
}
