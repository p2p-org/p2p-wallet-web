export function numberToString(
  value: number,
  {
    maximumFractionDigits = 3,
    groupingSeparator = ' ',
  }: {
    maximumFractionDigits?: number;
    groupingSeparator?: string;
  },
): string {
  return value.toLocaleString('en-US', { maximumFractionDigits }).replace(/,/g, groupingSeparator);
}
