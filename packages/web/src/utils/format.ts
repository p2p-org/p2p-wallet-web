const USD_MAX_FRACTION_DIGITS = 2;
const GROUP_SIZE = 3;

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

export const formatNumber = (str: string | number, decimals?: number) => {
  str = String(str);
  let res = '';
  const match = str.match(/^(\d+)(\.\d*)?$/);
  if (!match) {
    return '';
  }
  const integersAmount = match[1]?.length || 0;
  for (
    let i = 1, j = 0, blocksAmount = Math.ceil(integersAmount / GROUP_SIZE);
    i <= blocksAmount;
    i++, j++
  ) {
    let start = integersAmount - i * GROUP_SIZE;
    const end = integersAmount - j * GROUP_SIZE;
    start < 0 && (start = 0);
    const substr = str.substring(start, end);
    res = substr.concat(res ? ' ' : '', res);
  }

  let decimalsStr = match[2];
  if (decimals && decimalsStr) {
    decimalsStr = decimalsStr.substring(0, decimals + 1);
  }

  return res + (decimalsStr || '');
};

export const trimFormattedNumber = (valueStr: string) => {
  return valueStr.replace(/\s/g, '');
};

export const getNumberFromFormattedNumber = (valueStr: string) => {
  return Number(trimFormattedNumber(valueStr));
};
