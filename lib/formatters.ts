/**
 * Format string amounts like "£240.00" or raw numbers into the system currency.
 * Automatically strips invalid characters and ensures proper local formatting.
 */
export function formatCurrency(amountStr: string | number, currencyCode: string = "GBP") {
  const num = typeof amountStr === "string" 
    ? parseFloat(amountStr.replace(/[^0-9.-]/g, ''))
    : amountStr;
  
  if (isNaN(num)) return amountStr.toString();

  // We use undefined locale so the browser formats correctly, but force the currency symbol correctly.
  return new Intl.NumberFormat(undefined, { 
    style: 'currency', 
    currency: currencyCode || "GBP" 
  }).format(num);
}

/**
 * Format string dates like "Mar 15, 2025" or real Date objects into a localized date string.
 */
export function formatLocalizedDate(dateStr: string | Date, timezone: string = "UTC") {
  const dateObj = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  
  if (isNaN(dateObj.getTime())) return typeof dateStr === "string" ? dateStr : dateObj.toString();

  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateObj);
  } catch {
    // Fallback if timezone string is malformed or not supported by browser
    return new Intl.DateTimeFormat('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateObj);
  }
}
