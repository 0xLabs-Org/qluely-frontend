export function formatCurrency(cents: number, currency: 'INR' | 'USD') {
  const amount = cents / 100;
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

// Convert cents from one currency to another using a simple rate.
// Default rate uses 1 USD = 82 INR. Adjust as needed for accuracy.
export function convertCents(cents: number, from: 'INR' | 'USD', to: 'INR' | 'USD', rate = 82) {
  if (from === to) return cents;
  if (from === 'INR' && to === 'USD') {
    const usd = (cents / 100) / rate;
    return Math.round(usd * 100);
  }
  // USD -> INR
  const inr = (cents / 100) * rate;
  return Math.round(inr * 100);
}
