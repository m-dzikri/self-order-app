import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartTotals } from '../../resources/js/Utils/calculateCartTotals.js';

test('calculateCartTotals returns zero values for empty cart items (TC-005-4)', () => {
    const result = calculateCartTotals([], null);
    assert.equal(result.subtotal, 0);
    assert.equal(result.discount, 0);
    assert.equal(result.taxableAmount, 0);
    assert.equal(result.pb1Tax, 0);
    assert.equal(result.total, 0);
    assert.equal(result.itemCount, 0);
    assert.equal(result.totalQuantity, 0);
    assert.equal(result.isCouponValid, false);
});

test('calculateCartTotals computes subtotal across items without coupon', () => {
    const items = [
        { unitPrice: 26000, quantity: 1 },
        { unitPrice: 28000, quantity: 2 },
    ];

    // 26000 + (28000 * 2) = 82000
    // Taxable: 82000. PB1 (10%): 8200. Total: 90200.
    const result = calculateCartTotals(items, null);
    assert.equal(result.subtotal, 82000);
    assert.equal(result.discount, 0);
    assert.equal(result.taxableAmount, 82000);
    assert.equal(result.pb1Tax, 8200);
    assert.equal(result.total, 90200);
    assert.equal(result.itemCount, 2);
    assert.equal(result.totalQuantity, 3);
});

test('calculateCartTotals applies 10% discount for valid coupon SKETCHKOPI (TC-005-2)', () => {
    const items = [{ unitPrice: 50000, quantity: 1 }];

    const result = calculateCartTotals(items, 'SKETCHKOPI');
    assert.equal(result.subtotal, 50000);
    assert.equal(result.discount, 5000);
    assert.equal(result.isCouponValid, true);
});

test('calculateCartTotals is case-insensitive and trims whitespace for coupon code', () => {
    const items = [{ unitPrice: 40000, quantity: 1 }];

    const result = calculateCartTotals(items, '  sketchkopi  ');
    assert.equal(result.discount, 4000);
    assert.equal(result.isCouponValid, true);

    const objResult = calculateCartTotals(items, { code: 'SketchKopi', isValid: true });
    assert.equal(objResult.discount, 4000);
    assert.equal(objResult.isCouponValid, true);
});

test('calculateCartTotals rejects unknown coupon code and gives zero discount', () => {
    const items = [{ unitPrice: 50000, quantity: 1 }];

    const result = calculateCartTotals(items, 'DISKON50');
    assert.equal(result.discount, 0);
    assert.equal(result.isCouponValid, false);
});

test('calculateCartTotals computes PB1 10% after discount and final total accurately (TC-005-3)', () => {
    // TC-005-3 requirement:
    // Subtotal Rp 50.000 - Diskon Rp 5.000 = Rp 45.000.
    // PB1 10% adalah Rp 4.500, dan Total Akhir adalah Rp 49.500.
    const items = [{ unitPrice: 50000, quantity: 1 }];
    const result = calculateCartTotals(items, 'SKETCHKOPI');

    assert.equal(result.subtotal, 50000);
    assert.equal(result.discount, 5000);
    assert.equal(result.taxableAmount, 45000);
    assert.equal(result.pb1Tax, 4500);
    assert.equal(result.total, 49500);
});

test('calculateCartTotals reproduces mockup calculation exactly from 04_keranjang_struk', () => {
    // Item 1: Es Kopi Susu Aren Rp 26.000 (1x)
    // Item 2: Mie Goreng Corat-Coret Rp 28.000 (1x)
    // Subtotal: 54.000
    // Diskon Promo (10%): -5.400
    // PB1 (10% dari 48.600): 4.860
    // Total Bayar: 53.460
    const items = [
        { unitPrice: 26000, quantity: 1 },
        { unitPrice: 28000, quantity: 1 },
    ];
    const result = calculateCartTotals(items, 'SKETCHKOPI');

    assert.equal(result.subtotal, 54000);
    assert.equal(result.discount, 5400);
    assert.equal(result.taxableAmount, 48600);
    assert.equal(result.pb1Tax, 4860);
    assert.equal(result.total, 53460);
});
