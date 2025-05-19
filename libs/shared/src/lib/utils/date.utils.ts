export function formatDate(date: Date, locale = 'vi-VN'): string {
  return date.toLocaleString(locale);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
