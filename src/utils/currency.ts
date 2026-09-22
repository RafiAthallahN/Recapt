/**
 * Currency Formatting Utility for Recapt
 * All amounts are stored as positive integers in Indonesian Rupiah (IDR).
 */

export function formatIDR(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
  
  return `Rp ${formatted}`;
}

export function formatIDRWithSign(amount: number, type?: 'income' | 'outcome' | 'saving'): string {
  const formatted = formatIDR(amount);
  if (type === 'income') return `+ ${formatted}`;
  if (type === 'outcome') return `- ${formatted}`;
  if (amount < 0) return `- ${formatted}`;
  return formatted;
}
