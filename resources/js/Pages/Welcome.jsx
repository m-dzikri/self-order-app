import AppLayout from '../Layouts/AppLayout';
import Button from '../Components/Button';
import Card from '../Components/Card';
import { formatRupiah } from '../Utils/formatRupiah';

/**
 * Welcome shell (RFC-001). Table detection and the takeaway form are
 * implemented in RFC-003; this page only proves the design tokens render.
 */
export default function Welcome({ appName }) {
    return (
        <AppLayout>
            <header className="mb-6">
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-outline)]">
                    Self-Order
                </p>
                <h1 className="text-[26px] leading-[34px] font-extrabold">{appName}</h1>
            </header>

            <Card className="mb-4 p-5">
                <h2 className="mb-2 text-[24px] leading-[32px] font-bold">Halo, corat-coret dulu ☕</h2>
                <p className="mb-4 text-[16px] leading-[24px]">
                    Papan menu sedang disiapkan. Sementara itu, ini contoh format harga:
                </p>
                <p className="text-[18px] font-extrabold">{formatRupiah(28000)}</p>
            </Card>

            <Button type="button">Mulai Pesan</Button>
        </AppLayout>
    );
}
