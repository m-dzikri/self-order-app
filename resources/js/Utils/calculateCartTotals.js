/**
 * Pure calculation utility for Cart & Receipt Docket (RFC-005, F13, F14, TEST-3).
 *
 * Rules:
 * - Subtotal = sum of (unitPrice * quantity) across all items
 * - Coupon SKETCHKOPI grants 10% discount off subtotal (rounded to nearest integer)
 * - Taxable amount = max(0, subtotal - discount)
 * - PB1 Resto & Cafe Tax = 10% of taxable amount (rounded to nearest integer)
 * - Total = taxable amount + PB1 tax (zero decimal inaccuracies)
 *
 * @param {Array} items
 * @param {Object|string|null} coupon
 * @returns {{
 *   subtotal: number,
 *   discount: number,
 *   taxableAmount: number,
 *   pb1Tax: number,
 *   total: number,
 *   itemCount: number,
 *   totalQuantity: number,
 *   isCouponValid: boolean
 * }}
 */
export function calculateCartTotals(items = [], coupon = null) {
    const safeItems = Array.isArray(items) ? items : [];

    const subtotal = safeItems.reduce((acc, item) => {
        const qty = Math.max(0, Number(item?.quantity ?? 1));
        const unit =
            item?.unitPrice !== undefined
                ? Number(item.unitPrice)
                : item?.totalPrice
                ? Math.round(Number(item.totalPrice) / Math.max(1, qty))
                : 0;

        return acc + Math.round((Number.isFinite(unit) ? unit : 0) * qty);
    }, 0);

    const couponCode =
        typeof coupon === 'string'
            ? coupon.trim().toUpperCase()
            : typeof coupon?.code === 'string'
            ? coupon.code.trim().toUpperCase()
            : '';

    const isCouponExplicitlyInvalid =
        typeof coupon === 'object' && coupon !== null && coupon.isValid === false;

    const isCouponValid = couponCode === 'SKETCHKOPI' && !isCouponExplicitlyInvalid;

    const discount = isCouponValid ? Math.round(subtotal * 0.1) : 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const pb1Tax = Math.round(taxableAmount * 0.1);
    const total = taxableAmount + pb1Tax;

    const totalQuantity = safeItems.reduce(
        (acc, item) => acc + Math.max(0, Number(item?.quantity ?? 0)),
        0,
    );

    return {
        subtotal,
        discount,
        taxableAmount,
        pb1Tax,
        total,
        itemCount: safeItems.length,
        totalQuantity,
        isCouponValid,
    };
}
