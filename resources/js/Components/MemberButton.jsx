import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import MemberAuthModal from './MemberAuthModal';
import OrderHistoryModal from './OrderHistoryModal';

/**
 * MemberButton: Header action button with tactile sketchbook badge.
 * Tapping opens OrderHistoryModal if member is authenticated, or MemberAuthModal if guest.
 * (RFC-008, F24, UI-4).
 */
export default function MemberButton({ onToast }) {
    const { auth } = usePage().props;
    const [currentUser, setCurrentUser] = useState(auth?.user || null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const handleClick = () => {
        if (currentUser) {
            setIsHistoryModalOpen(true);
        } else {
            setIsAuthModalOpen(true);
        }
    };

    const handleAuthSuccess = (user, message) => {
        setCurrentUser(user);
        if (onToast) onToast(message || 'Login member berhasil!');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        if (onToast) onToast('Berhasil keluar dari akun member.');
    };

    const displayName = currentUser ? currentUser.name.split(' ')[0] : 'Member';

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                aria-label={currentUser ? `Akun member ${currentUser.name}` : 'Masuk akun member'}
                className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-surface)] px-2.5 text-xs font-extrabold text-[var(--color-ink)] marker-shadow-md hover:bg-[var(--color-surface-container)] active:translate-x-0.5 active:translate-y-0.5 transition-all select-none"
            >
                <span className="material-symbols-outlined text-[20px] text-[var(--color-promo)]">
                    {currentUser ? 'verified_user' : 'account_circle'}
                </span>
                <span className="max-w-[80px] truncate text-[11px] font-black">
                    {displayName}
                </span>
            </button>

            {/* Member Authentication Modal (Register / Login) */}
            <MemberAuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
            />

            {/* Member Order History & Receipts Modal */}
            <OrderHistoryModal
                isOpen={isHistoryModalOpen}
                memberUser={currentUser}
                onClose={() => setIsHistoryModalOpen(false)}
                onLogout={handleLogout}
            />
        </>
    );
}
