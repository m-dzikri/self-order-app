import confetti from 'canvas-confetti';

/**
 * Sketchbook Cafe Confetti Celebration Utility (RFC-008, TC-008-3).
 * Triggers tactile colorful confetti using the sketchbook palette:
 * Sun Yellow (#FFC93C), Terracotta (#FF7A59), Mint (#7ED6A5), Sky Blue (#6EC6FF).
 */
export const SKETCHBOOK_CONFETTI_COLORS = [
    '#FFC93C', // Sun Yellow
    '#FF7A59', // Terracotta Promo
    '#7ED6A5', // Mint Leaf
    '#6EC6FF', // Sky Doodle
    '#4A2C17', // Espresso Ink
];

export function triggerConfetti(options = {}) {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const count = options.particleCount || 60;
        const colors = options.colors || SKETCHBOOK_CONFETTI_COLORS;

        // Left cannon burst
        confetti({
            particleCount: Math.floor(count * 0.6),
            angle: 60,
            spread: 55,
            origin: { x: 0.1, y: 0.8 },
            colors,
            shapes: ['circle', 'square'],
            disableForReducedMotion: true,
            zIndex: 9999,
        });

        // Right cannon burst
        confetti({
            particleCount: Math.floor(count * 0.6),
            angle: 120,
            spread: 55,
            origin: { x: 0.9, y: 0.8 },
            colors,
            shapes: ['circle', 'square'],
            disableForReducedMotion: true,
            zIndex: 9999,
        });

        // Center starburst pop
        setTimeout(() => {
            confetti({
                particleCount: Math.floor(count * 0.8),
                spread: 100,
                origin: { y: 0.6 },
                colors,
                disableForReducedMotion: true,
                zIndex: 9999,
            });
        }, 200);
    } catch (e) {
        // Silently catch environments where canvas context is unavailable
        console.warn('Confetti trigger failed or unsupported', e);
    }
}
