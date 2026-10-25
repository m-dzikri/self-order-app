/**
 * Calculate item total price with modifiers, addons, and quantity.
 * Central calculation rule (RFC-004 Pseudocode / TEST-3).
 *
 * @param {number} basePrice Base price of the menu in Rupiah
 * @param {Array<{extraPrice?: number, extra_price?: number}>} selectedModifiers List of selected modifiers
 * @param {Array<{extraPrice?: number, extra_price?: number}>} selectedAddons List of selected toppings/addons
 * @param {number} quantity Number of portions
 * @returns {{unitPrice: number, totalPrice: number}}
 */
export function calculateItemTotal(basePrice = 0, selectedModifiers = [], selectedAddons = [], quantity = 1) {
    const safeBase = Math.max(0, Number(basePrice) || 0);
    const safeQty = Math.max(1, Math.floor(Number(quantity) || 1));

    let unitPrice = safeBase;

    for (const mod of selectedModifiers) {
        if (!mod) continue;
        const extra = Number(mod.extraPrice ?? mod.extra_price) || 0;
        unitPrice += Math.max(0, extra);
    }

    for (const addon of selectedAddons) {
        if (!addon) continue;
        const extra = Number(addon.extraPrice ?? addon.extra_price) || 0;
        unitPrice += Math.max(0, extra);
    }

    const totalPrice = unitPrice * safeQty;

    return {
        unitPrice,
        totalPrice,
    };
}
