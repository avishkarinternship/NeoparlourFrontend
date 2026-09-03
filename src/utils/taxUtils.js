// src/utils/taxUtils.js
/**
 * Calculates GST inclusive breakdown (18% Total: 9% CGST + 9% SGST/UTGST)
 * @param {number|string} price - The entered service price
 * @param {boolean} isUt - Whether the salon state is a Union Territory without legislature
 */
export const calculateInclusiveGst = (price, isUt = false) => {
  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice) || numericPrice <= 0) {
    return null;
  }
  // Base = Total / 1.18
  const baseValue = numericPrice / 1.18;
  const totalGst = numericPrice - baseValue;
  const cgst = totalGst / 2;
  const sgstOrUtgst = totalGst - cgst;
  return {
    totalPrice: numericPrice.toFixed(2),
    baseValue: baseValue.toFixed(2),
    totalGst: totalGst.toFixed(2),
    cgst: cgst.toFixed(2),
    sgstOrUtgst: sgstOrUtgst.toFixed(2),
    secondTaxLabel: isUt ? 'UTGST (9%)' : 'SGST (9%)'
  };
};
