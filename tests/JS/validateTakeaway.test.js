import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    validateName,
    validatePhone,
    validatePickupAt,
    validateTakeaway,
    MIN_PICKUP_MINUTES,
} from '../../resources/js/Utils/validateTakeaway.js';

// TC-003-3: validasi input formulir takeaway (klien).
describe('validateTakeaway', () => {
    const now = new Date('2026-10-24T10:00:00');

    describe('validateName', () => {
        it('accepts names with 3 or more characters', () => {
            assert.equal(validateName('Sasa'), null);
            assert.equal(validateName('  Sasa Putri  '), null);
        });

        it('rejects empty and too-short names', () => {
            assert.equal(validateName(''), 'Namanya diisi dulu ya.');
            assert.equal(validateName('   '), 'Namanya diisi dulu ya.');
            assert.equal(validateName('Sa'), 'Nama minimal 3 karakter.');
            assert.equal(validateName(null), 'Namanya diisi dulu ya.');
        });
    });

    describe('validatePhone', () => {
        it('accepts Indonesian 08 numbers of 10-13 digits', () => {
            assert.equal(validatePhone('0812345678'), null);
            assert.equal(validatePhone('081234567890'), null);
            assert.equal(validatePhone('0812345678901'), null);
        });

        it('rejects numbers that do not match the SEC-2 pattern', () => {
            assert.ok(validatePhone('1234567890'));
            assert.ok(validatePhone('08123'));
            assert.ok(validatePhone('+6281234567890'));
            assert.ok(validatePhone('081234567890123'));
            assert.ok(validatePhone(''));
        });
    });

    describe('validatePickupAt', () => {
        it(`accepts times at least ${MIN_PICKUP_MINUTES} minutes ahead`, () => {
            assert.equal(validatePickupAt('10:10', now), null);
            assert.equal(validatePickupAt('23:59', now), null);
        });

        it('rejects times within the closure window', () => {
            assert.ok(validatePickupAt('10:00', now));
            assert.ok(validatePickupAt('10:09', now));
        });

        it('rolls past-midnight times over to the next day', () => {
            const lateEvening = new Date('2026-10-24T23:55:00');
            assert.equal(validatePickupAt('00:10', lateEvening), null);
            assert.ok(validatePickupAt('23:56', lateEvening));
        });

        it('rejects malformed time strings', () => {
            assert.ok(validatePickupAt('besok', now));
            assert.ok(validatePickupAt('10:00:00', now));
            assert.ok(validatePickupAt('', now));
        });
    });

    describe('aggregate', () => {
        it('accepts a fully valid payload', () => {
            assert.deepEqual(
                validateTakeaway({ name: 'Sasa', phone: '081234567890', pickup_at: '10:30' }, now),
                { isValid: true, errors: {} },
            );
        });

        it('collects every field error at once', () => {
            const { isValid, errors } = validateTakeaway(
                { name: 'Sa', phone: '123', pickup_at: '10:01' },
                now,
            );

            assert.equal(isValid, false);
            assert.deepEqual(Object.keys(errors).sort(), ['name', 'phone', 'pickup_at']);
        });
    });
});
