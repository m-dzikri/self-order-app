import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { copyToClipboard } from '../../resources/js/Utils/copyToClipboard.js';

// TC-003-4: satu-ketukan salin sandi Wi-Fi.
describe('copyToClipboard', () => {
    it('copies the text and resolves true on success', async () => {
        const written = [];
        const nav = { clipboard: { writeText: async (t) => written.push(t) } };

        assert.equal(await copyToClipboard('ngopiyuk123', nav), true);
        assert.deepEqual(written, ['ngopiyuk123']);
    });

    it('resolves false when the clipboard API rejects (e.g. permission)', async () => {
        const nav = {
            clipboard: {
                writeText: async () => {
                    throw new Error('denied');
                },
            },
        };

        assert.equal(await copyToClipboard('ngopiyuk123', nav), false);
    });

    it('resolves false when the clipboard API is unavailable', async () => {
        assert.equal(await copyToClipboard('ngopiyuk123', {}), false);
        assert.equal(await copyToClipboard('ngopiyuk123', undefined), false);
    });
});
