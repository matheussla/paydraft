export function formatUSDC(amount: string): string {
  const num = BigInt(amount);
  const dollars = num / BigInt(1_000_000);
  const cents = num % BigInt(1_000_000);
  
  const centsStr = cents.toString().padStart(6, '0');
  const formatted = `${dollars}.${centsStr}`;
  
  const trimmed = formatted.replace(/\.?0+$/, '');
  return trimmed === '' ? '0' : trimmed;
}

export function parseUSDC(display: string): string {
  const cleaned = display.replace(/[^\d.]/g, '');
  const [dollars = '0', cents = '0'] = cleaned.split('.');
  
  const paddedCents = cents.padEnd(6, '0').slice(0, 6);
  const totalMicroUnits = BigInt(dollars) * BigInt(1_000_000) + BigInt(paddedCents);
  
  return totalMicroUnits.toString();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (status === 'paid' || status === 'draft') {
    return false;
  }
  return new Date(dueDate) < new Date();
}
