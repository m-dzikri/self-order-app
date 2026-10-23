import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatRupiah } from '../../resources/js/Utils/formatRupiah.js';

// TC-001-2: Format Mata Uang formatRupiah
describe('formatRupiah', () => {
    it('formats 28000 as "Rp 28.000"', () => {
        assert.equal(formatRupiah(28000), 'Rp 28.000');
    });

    it('formats 0 as "Rp 0"', () => {
        assert.equal(formatRupiah(0), 'Rp 0');
    });

    it('coerces numeric strings (CODE-2)', () => {
        assert.equal(formatRupiah('5000'), 'Rp 5.000');
    });

    it('formats large amounts with thousand separators', () => {
        assert.equal(formatRupiah(1250000), 'Rp 1.250.000');
    });

    it('falls back to "Rp 0" for invalid input', () => {
        assert.equal(formatRupiah(undefined), 'Rp 0');
        assert.equal(formatRupiah('abc'), 'Rp 0');
    });
});
