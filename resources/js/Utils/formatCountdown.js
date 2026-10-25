/**
 * Format countdown seconds into MM:SS display (RFC-006, F17).
 *
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatCountdown(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const mins = Math.floor(safeSeconds / 60)
        .toString()
        .padStart(2, '0');
    const secs = (safeSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}
