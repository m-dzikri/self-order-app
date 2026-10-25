import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    SKETCHBOOK_CONFETTI_COLORS,
    triggerConfetti,
} from '../../resources/js/Utils/triggerConfetti.js';

describe('triggerConfetti utility (RFC-008, TC-008-3)', () => {
    it('defines the required sketchbook cafe palette colors', () => {
        assert.ok(Array.isArray(SKETCHBOOK_CONFETTI_COLORS));
        assert.ok(SKETCHBOOK_CONFETTI_COLORS.includes('#FFC93C')); // Sun Yellow
        assert.ok(SKETCHBOOK_CONFETTI_COLORS.includes('#FF7A59')); // Terracotta Promo
        assert.ok(SKETCHBOOK_CONFETTI_COLORS.includes('#7ED6A5')); // Mint Leaf
        assert.ok(SKETCHBOOK_CONFETTI_COLORS.includes('#6EC6FF')); // Sky Doodle
        assert.ok(SKETCHBOOK_CONFETTI_COLORS.includes('#4A2C17')); // Espresso Ink
    });

    it('executes safely in headless or non-browser environments without throwing', () => {
        assert.doesNotThrow(() => {
            triggerConfetti();
        });
    });

    it('accepts custom particleCount and colors override options safely', () => {
        assert.doesNotThrow(() => {
            triggerConfetti({
                particleCount: 100,
                colors: ['#FFC93C', '#FF7A59'],
            });
        });
    });
});
