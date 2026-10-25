import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateItemTotal } from '../../resources/js/Utils/calculateItemTotal.js';

test('calculateItemTotal computes base price correctly without modifiers', () => {
    const result = calculateItemTotal(22000, [], [], 1);
    assert.equal(result.unitPrice, 22000);
    assert.equal(result.totalPrice, 22000);
});

test('calculateItemTotal adds milk and topping modifiers to unit price', () => {
    const modifiers = [{ name: 'Oat Milk', extra_price: 6000 }];
    const addons = [{ name: 'Extra Shot', extra_price: 5000 }];

    const result = calculateItemTotal(22000, modifiers, addons, 1);
    assert.equal(result.unitPrice, 33000);
    assert.equal(result.totalPrice, 33000);
});

test('calculateItemTotal multiplies by quantity precisely (TC-004-4)', () => {
    const modifiers = [{ name: 'Oat Milk', extra_price: 6000 }];
    const addons = [{ name: 'Grass Jelly', extra_price: 4000 }];

    // 22000 + 6000 + 4000 = 32000. 32000 * 3 = 96000.
    const result = calculateItemTotal(22000, modifiers, addons, 3);
    assert.equal(result.unitPrice, 32000);
    assert.equal(result.totalPrice, 96000);
});

test('calculateItemTotal handles extraPrice camelCase and extra_price snake_case', () => {
    const modifiers = [{ name: 'Almond Milk', extraPrice: 8000 }];
    const addons = [{ name: 'Extra Shot', extra_price: 5000 }];

    const result = calculateItemTotal(25000, modifiers, addons, 2);
    assert.equal(result.unitPrice, 38000);
    assert.equal(result.totalPrice, 76000);
});

test('calculateItemTotal safely clamps quantity below 1 to 1', () => {
    const result = calculateItemTotal(20000, [], [], 0);
    assert.equal(result.unitPrice, 20000);
    assert.equal(result.totalPrice, 20000);
});
