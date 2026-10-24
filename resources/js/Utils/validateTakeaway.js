/**
 * Pure takeaway-session validators (RFC-003, F2 / SEC-2). Kept free of DOM
 * and framework imports so the rules can be unit-tested with node:test.
 */

export const WIFI_PASSWORD = 'ngopiyuk123';

/** Minimum pickup lead time in minutes (SEC-2). */
export const MIN_PICKUP_MINUTES = 10;

/**
 * Parse an "HH:MM" string into a Date on the same day as `now`.
 * Returns null when the format is malformed.
 */
function parsePickupTime(value, now) {
    if (typeof value !== 'string' || !/^\d{1,2}:\d{2}$/.test(value)) {
        return null;
    }

    const [hours, minutes] = value.split(':').map(Number);
    const pickup = new Date(now.getTime());
    pickup.setHours(hours, minutes, 0, 0);
    return pickup;
}

/**
 * Validate the customer's name: required, minimum 3 characters.
 * @returns {string|null} error message, or null when valid.
 */
export function validateName(name) {
    if (typeof name !== 'string' || name.trim().length === 0) {
        return 'Namanya diisi dulu ya.';
    }
    if (name.trim().length < 3) {
        return 'Nama minimal 3 karakter.';
    }
    return null;
}

/**
 * Validate the WhatsApp number: must start with 08 and be 10-13 digits.
 * @returns {string|null} error message, or null when valid.
 */
export function validatePhone(phone) {
    if (typeof phone !== 'string' || phone.trim().length === 0) {
        return 'Nomor WhatsApp belum diisi.';
    }
    if (!/^08[0-9]{8,11}$/.test(phone.trim())) {
        return 'Nomor WhatsApp harus diawali 08 (contoh: 081234567890).';
    }
    return null;
}

/**
 * Validate the pickup estimate: a valid HH:MM at least 10 minutes
 * from `now` (times past midnight roll over to the next day).
 * @returns {string|null} error message, or null when valid.
 */
export function validatePickupAt(value, now = new Date()) {
    const pickup = parsePickupTime(value, now);
    if (pickup === null) {
        return 'Estimasi jam ambil belum dipilih.';
    }

    // A time earlier than "now" means the pickup rolls past midnight.
    const startOfMinute = new Date(now.getTime());
    startOfMinute.setSeconds(0, 0);
    if (pickup.getTime() < startOfMinute.getTime()) {
        pickup.setDate(pickup.getDate() + 1);
    }

    const earliest = new Date(startOfMinute.getTime());
    earliest.setMinutes(earliest.getMinutes() + MIN_PICKUP_MINUTES);

    if (pickup.getTime() < earliest.getTime()) {
        return 'Estimasi jam ambil minimal 10 menit dari sekarang.';
    }
    return null;
}

/**
 * Validate the whole takeaway form at once.
 * @returns {{isValid: boolean, errors: Record<string, string>}}
 */
export function validateTakeaway(values, now = new Date()) {
    const errors = {};

    const nameError = validateName(values.name);
    if (nameError) errors.name = nameError;

    const phoneError = validatePhone(values.phone);
    if (phoneError) errors.phone = phoneError;

    const pickupError = validatePickupAt(values.pickup_at, now);
    if (pickupError) errors.pickup_at = pickupError;

    return { isValid: Object.keys(errors).length === 0, errors };
}
