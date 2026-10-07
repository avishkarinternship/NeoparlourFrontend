/**
 * Validation utilities for NeoParlour
 */

/**
 * Normalizes an Indian mobile number by removing non-digits,
 * and stripping country code (+91, 91) or leading zero if present.
 * @param {string|number} input 
 * @returns {string} Up to 10-digit numeric string
 */
export const cleanIndianMobile = (input) => {
  let digits = String(input || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
};

/**
 * Validates whether the given string/number is a valid 10-digit Indian mobile number.
 * Under India's National Numbering Plan, valid mobile numbers are exactly 10 digits
 * and start with 6, 7, 8, or 9.
 * @param {string|number} input 
 * @returns {boolean}
 */
export const isValidIndianMobile = (input) => {
  const cleaned = cleanIndianMobile(input);
  return /^[6-9]\d{9}$/.test(cleaned);
};
