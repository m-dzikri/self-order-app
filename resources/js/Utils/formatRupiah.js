/**
 * Format a numeric amount as Indonesian Rupiah (CODE-2).
 * Intl id-ID separates "Rp" from the amount with a non-breaking space
 * (U+00A0); it is normalized to a regular space so the output is the
 * literal 'Rp 28.000' expected by the acceptance criteria.
 * Example: formatRupiah(28000) -> 'Rp 28.000'
 */
export function formatRupiah(amount) {
    if (typeof amount !== 'number') amount = Number(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    })
        .format(amount)
        .replace(/\u00a0/g, ' ');
}
