import { Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import Card from '../Components/Card';

/**
 * Catalog placeholder (RFC-003 AC-6): the welcome CTA needs a real
 * destination. The full menu catalog experience belongs to RFC-004.
 */
export default function Catalog({ appName }) {
    return (
        <AppLayout>
            <header className="mb-6">
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-ink-soft)]">
                    {appName}
                </p>
                <h1 className="text-[26px] leading-[34px] font-extrabold">Katalog Menu</h1>
            </header>

            <Card className="mb-4 p-5">
                <h2 className="mb-2 text-[20px] leading-[28px] font-bold">Lagi digambar ulang 🎨</h2>
                <p className="text-[16px] leading-[24px]">
                    Papan menu lengkap sedang disiapkan. Nanti di sini kamu bisa pilih kopi favorit,
                    atur tambahannya, dan langsung masuk keranjang.
                </p>
            </Card>

            <Link
                className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container-lowest)] px-5 py-2 font-semibold marker-shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
                href="/"
            >
                ← Kembali
            </Link>
        </AppLayout>
    );
}
