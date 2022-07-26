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
  return value
    .toLocaleString(undefined, { maximumFractionDigits })
    .replace(/,/g, groupingSeparator);
}
