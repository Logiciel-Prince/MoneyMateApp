/**
 * Currency utility functions
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale?: string;
}

export const CURRENCIES: { [key: string]: CurrencyConfig } = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
};

/**
 * Format a number as currency based on the currency code
 * @param amount - The amount to format
 * @param currencyCode - The currency code (USD, INR, etc.)
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string = 'USD',
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const {
    showSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options || {};

  // Ensure minimumFractionDigits is not greater than maximumFractionDigits
  const minDigits = Math.min(minimumFractionDigits, maximumFractionDigits);
  const maxDigits = Math.max(minimumFractionDigits, maximumFractionDigits);

  const formattedNumber = amount.toLocaleString(currency.locale || 'en-US', {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });

  return showSymbol ? `${currency.symbol}${formattedNumber}` : formattedNumber;
};

/**
 * Get currency symbol for a given currency code
 * @param currencyCode - The currency code
 * @returns Currency symbol
 */
export const getCurrencySymbol = (currencyCode: string = 'USD'): string => {
  return CURRENCIES[currencyCode]?.symbol || '$';
};

/**
 * Format currency for compact display (e.g., 1.5K, 2.3M)
 * @param amount - The amount to format
 * @param currencyCode - The currency code
 * @returns Compact formatted currency string
 */
export const formatCurrencyCompact = (
  amount: number,
  currencyCode: string = 'USD'
): string => {
  const symbol = getCurrencySymbol(currencyCode);
  
  if (amount >= 10000000) {
    return `${symbol}${(amount / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
  }
  if (amount >= 100000) {
    return `${symbol}${(amount / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `${symbol}${amount.toFixed(0)}`;
};
