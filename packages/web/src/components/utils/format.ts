const USD_MAX_FRACTION_DIGITS = 2;

export const formatNumberToUSD = (
  amount: number,
  options: { alwaysShowCents: boolean } = { alwaysShowCents: true },
) => {
  const minFractionDigits = options.alwaysShowCents ? USD_MAX_FRACTION_DIGITS : 0;

  return amount
    .toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: minFractionDigits,
      maximumFractionDigits: USD_MAX_FRACTION_DIGITS,
    })
    .replace(/,/g, ' ');
};

export const formatNumber = (amount: number) => {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 20 }).replace(/,/g, ' ');
};
