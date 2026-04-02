/**
 * Utility functions for consistent data formatting across the app.
 */

/**
 * Formats a number as Indian Rupee (₹) currency.
 * @param {number} amount 
 * @returns {string}
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

/**
 * Formats a date string into a user-friendly format.
 * @param {string} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
