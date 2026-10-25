import React, { useState } from 'react';
import axios from 'axios';
import { triggerConfetti } from '../Utils/triggerConfetti';

/**
 * Member Authentication Modal: Register & Login (RFC-008, F24, SEC-1, SEC-2).
 * Styled with tactile sketchbook aesthetic, paper textures, and solid shadows.
 */
export default function MemberAuthModal({ isOpen, onClose, onSuccess }) {
    const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    if (!isOpen) return null;

    const resetForm = () => {
        setName('');
        setPhone('');
        setPin('');
        setErrorMsg(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsLoading(true);

        try {
            if (activeTab === 'register') {
                const res = await axios.post('/member/register', {
                    name,
                    phone,
                    pin,
                });

                if (res.data?.success) {
                    triggerConfetti();
                    resetForm();
                    if (onSuccess) {
                        onSuccess(res.data.user, res.data.message);
                    }
                    onClose();
                }
            } else {
                const res = await axios.post('/member/login', {
                    phone,
                    pin,
                });

                if (res.data?.success) {
                    resetForm();
                    if (onSuccess) {
                        onSuccess(res.data.user, res.data.message);
                    }
                    onClose();
                }
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                (err.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(' ')
                    : 'Terjadi kendala saat memproses autentikasi. Silakan periksa kembali data Anda.');
            setErrorMsg(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-[420px] rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] p-5 marker-shadow-lg">
                {/* Washi Tape Header Decoration */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 -rotate-1 rounded-sm border border-[var(--color-ink)] bg-[var(--color-primary-container)] px-4 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-ink)] shadow-[1px_1px_0px_var(--color-ink)]">
                    Kartu Member Kafe ✨
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-ink)] bg-[var(--color-surface-container)] text-[var(--color-ink)] hover:bg-[var(--color-surface-container-high)]"
                >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                </button>

                {/* Header Title */}
                <div className="mt-2 text-center">
                    <h2 className="font-headline text-lg font-extrabold text-[var(--color-ink)]">
                        {activeTab === 'login' ? 'Masuk ke Akun Member' : 'Daftar Member Baru'}
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
                        Kumpulkan pesanan, nikmati promo spesial corat-coret! ☕🎨
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="mt-4 flex rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface-container)] p-1">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('login');
                            setErrorMsg(null);
                        }}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-extrabold transition-all ${
                            activeTab === 'login'
                                ? 'border border-[var(--color-ink)] bg-[var(--color-primary-container)] text-[var(--color-ink)] shadow-[1.5px_1.5px_0px_var(--color-ink)]'
                                : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
                        }`}
                    >
                        Masuk
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('register');
                            setErrorMsg(null);
                        }}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-extrabold transition-all ${
                            activeTab === 'register'
                                ? 'border border-[var(--color-ink)] bg-[var(--color-primary-container)] text-[var(--color-ink)] shadow-[1.5px_1.5px_0px_var(--color-ink)]'
                                : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
                        }`}
                    >
                        Daftar Baru
                    </button>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-[var(--color-ink)] bg-rose-100 p-2.5 text-xs text-rose-900 shadow-xs">
                        <span className="material-symbols-outlined text-[16px] text-rose-700">warning</span>
                        <span className="flex-1 leading-snug">{errorMsg}</span>
                    </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    {activeTab === 'register' && (
                        <div>
                            <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-[var(--color-ink)]">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                required
                                minLength={3}
                                maxLength={100}
                                placeholder="Contoh: Budi Santoso"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] px-3 py-2 text-xs font-bold text-[var(--color-ink)] placeholder:text-[var(--color-outline)] focus:border-[var(--color-promo)] focus:outline-none"
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-[var(--color-ink)]">
                            Nomor WhatsApp
                        </label>
                        <input
                            type="tel"
                            required
                            placeholder="Contoh: 08123456789"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] px-3 py-2 text-xs font-bold text-[var(--color-ink)] placeholder:text-[var(--color-outline)] focus:border-[var(--color-promo)] focus:outline-none"
                        />
                        <span className="mt-0.5 block text-[10px] text-[var(--color-ink-soft)]">
                            Diawali 08, 10–13 digit angka
                        </span>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-[var(--color-ink)]">
                            PIN Keamanan (6 Angka)
                        </label>
                        <input
                            type="password"
                            required
                            maxLength={6}
                            pattern="[0-9]{6}"
                            placeholder="••••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            className="w-full rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] px-3 py-2 text-center text-base tracking-[0.3em] font-black text-[var(--color-ink)] placeholder:text-[var(--color-outline)] focus:border-[var(--color-promo)] focus:outline-none"
                        />
                        <span className="mt-0.5 block text-[10px] text-[var(--color-ink-soft)] text-center">
                            Masukkan 6 digit angka rahasia
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-primary-container)] py-2.5 font-headline text-sm font-extrabold text-[var(--color-ink)] marker-shadow hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
                    >
                        <span>
                            {isLoading
                                ? 'Sedang Memproses...'
                                : activeTab === 'login'
                                ? 'Masuk Sekarang'
                                : 'Daftar Akun Member'}
                        </span>
                        {!isLoading && (
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
