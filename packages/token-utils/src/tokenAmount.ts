import type { BigintIsh, Token } from '@saberhq/token-utils';
import { TokenAmount as TokenAmountOriginal } from '@saberhq/token-utils';

export const NUMBER_FORMAT = {
  decimalSeparator: '.',
  groupSeparator: ' ',
  groupSize: 3,
};
export class TokenAmount extends TokenAmountOriginal {
  override new(token: Token, amount: BigintIsh): this {
    return new TokenAmount(token, amount) as this;
  }

  static override parse(token: Token, uiAmount: string): TokenAmount {
    const value = super.parse(token, uiAmount);
    return new TokenAmount(token, value.raw);
  }

  override divideByInteger(other: BigintIsh): TokenAmount {
    const value = super.divideByInteger(other);
    return new TokenAmount(this.token, value.raw);
  }

  override formatUnits(format = NUMBER_FORMAT) {
    return super.formatUnits(format);
  }
}
