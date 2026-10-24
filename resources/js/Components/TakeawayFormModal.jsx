import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Button from './Button';
import { validateTakeaway } from '../Utils/validateTakeaway';

/**
 * Squiggly doodle underline (UI-5) shown under invalid fields — the
 * "coretan" validation feedback called for by F2.
 */
function SquiggleError({ message }) {
    if (!message) return null;

    return (
        <p className="mt-1 text-[13px] leading-[18px] font-bold text-[var(--color-error)]" role="alert">
            {message}
            <svg aria-hidden="true" className="mt-0.5 block w-full text-[var(--color-error)]" height="6" preserveAspectRatio="none" viewBox="0 0 100 6">
                <path
                    d="M0,3 Q12,0 25,3 T50,3 T75,3 T100,3"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                />
            </svg>
        </p>
    );
}

/**
 * Takeaway session form (RFC-003, F2 / SEC-2): name, WhatsApp number and
 * pickup estimate. Client-side rules mirror the server validation so the
 * squiggly errors appear before the round-trip.
 */
export default function TakeawayFormModal({ open, onClose }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        phone: '',
        pickup_at: '',
    });
    const [clientErrors, setClientErrors] = useState({});

    useEffect(() => {
        if (open) {
            reset();
            clearErrors();
            setClientErrors({});
        }
    }, [open]);

    if (!open) return null;

    const showError = (field) => clientErrors[field] ?? errors[field] ?? null;

    const handleSubmit = (event) => {
        event.preventDefault();

        const { isValid, errors: next } = validateTakeaway(data);
        setClientErrors(next);
        if (!isValid) return;

        post('/session/takeaway', {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-ink)]/40 p-4 sm:items-center">
            <div
                aria-labelledby="takeaway-form-title"
                aria-modal="true"
                className="w-full max-w-md rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-tactile-lg)]"
                role="dialog"
            >
                <h2 id="takeaway-form-title" className="mb-1 text-[22px] leading-[30px] font-extrabold">
                    Pesan Bawa Pulang 🧾
                </h2>
                <p className="mb-4 text-[14px] leading-[20px] text-[var(--color-outline)]">
                    Isi datanya dulu ya, biar pesananmu siap pas diambil.
                </p>

                <form noValidate onSubmit={handleSubmit}>
                    <label className="mb-3 block">
                        <span className="mb-1 block text-[14px] font-bold">Nama</span>
                        <input
                            autoComplete="name"
                            className={`w-full rounded-lg border-2 bg-[var(--color-surface-container-lowest)] px-3 py-2 text-[16px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] ${
                                showError('name')
                                    ? 'border-[var(--color-error)]'
                                    : 'border-[var(--color-ink)]'
                            }`}
                            onChange={(event) => setData('name', event.target.value)}
                            placeholder="mis. Sasa"
                            type="text"
                            value={data.name}
                        />
                        <SquiggleError message={showError('name')} />
                    </label>

                    <label className="mb-3 block">
                        <span className="mb-1 block text-[14px] font-bold">No. WhatsApp</span>
                        <input
                            autoComplete="tel"
                            className={`w-full rounded-lg border-2 bg-[var(--color-surface-container-lowest)] px-3 py-2 text-[16px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] ${
                                showError('phone')
                                    ? 'border-[var(--color-error)]'
                                    : 'border-[var(--color-ink)]'
                            }`}
                            inputMode="tel"
                            onChange={(event) => setData('phone', event.target.value)}
                            placeholder="081234567890"
                            type="tel"
                            value={data.phone}
                        />
                        <SquiggleError message={showError('phone')} />
                    </label>

                    <label className="mb-5 block">
                        <span className="mb-1 block text-[14px] font-bold">Estimasi Jam Ambil</span>
                        <input
                            className={`w-full rounded-lg border-2 bg-[var(--color-surface-container-lowest)] px-3 py-2 text-[16px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] ${
                                showError('pickup_at')
                                    ? 'border-[var(--color-error)]'
                                    : 'border-[var(--color-ink)]'
                            }`}
                            onChange={(event) => setData('pickup_at', event.target.value)}
                            type="time"
                            value={data.pickup_at}
                        />
                        <SquiggleError message={showError('pickup_at')} />
                    </label>

                    <div className="flex gap-3">
                        <Button onClick={onClose} type="button" variant="surface">
                            Nanti Dulu
                        </Button>
                        <Button className="flex-1" disabled={processing} type="submit">
                            Simpan &amp; Mulai Pesan
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
