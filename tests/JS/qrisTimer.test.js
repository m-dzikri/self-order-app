import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCountdown } from '../../resources/js/Utils/formatCountdown.js';

test('formatCountdown formats 15 minutes to "15:00" precisely (TC-006-2)', () => {
    assert.equal(formatCountdown(900), '15:00');
});

test('formatCountdown formats 14 minutes 48 seconds to "14:48"', () => {
    assert.equal(formatCountdown(888), '14:48');
});

test('formatCountdown formats 1 minute to "01:00"', () => {
    assert.equal(formatCountdown(60), '01:00');
});

test('formatCountdown pads single digit seconds with leading zero', () => {
    assert.equal(formatCountdown(9), '00:09');
});

test('formatCountdown formats 0 to "00:00" for expired timer (TC-006-3)', () => {
    assert.equal(formatCountdown(0), '00:00');
});

test('formatCountdown safely handles negative or malformed inputs without throwing', () => {
    assert.equal(formatCountdown(-10), '00:00');
    assert.equal(formatCountdown(null), '00:00');
    assert.equal(formatCountdown(undefined), '00:00');
    assert.equal(formatCountdown('invalid'), '00:00');
});
