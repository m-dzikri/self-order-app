/**
 * One-tap clipboard copy for the Wi-Fi memo card (RFC-003, F4 / FR-29).
 * Kept as a tiny injectable helper so tests can pass a mock navigator.
 */

/**
 * Copy `text` to the clipboard.
 * @returns {Promise<boolean>} true when the copy succeeded.
 */
export async function copyToClipboard(text, nav = globalThis.navigator) {
    if (!nav?.clipboard?.writeText) {
        return false;
    }

    try {
        await nav.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
