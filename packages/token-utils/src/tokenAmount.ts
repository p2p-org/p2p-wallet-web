import { TokenAmount as TokenAmountOriginal } from '@saberhq/token-utils';

export const NUMBER_FORMAT = {
  decimalSeparator: '.',
  groupSeparator: ' ',
  groupSize: 3,
};
export class TokenAmount extends TokenAmountOriginal {
  override formatUnits(format = NUMBER_FORMAT) {
    return super.formatUnits(format);
  }
}
