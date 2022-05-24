import type { BigintIsh, Token } from '@saberhq/token-utils';
import { TokenAmount as TokenAmountOriginal } from '@saberhq/token-utils';
import { parseAmountFromString } from '@ubeswap/token-math';

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
    const prev = parseAmountFromString(
      token,
      uiAmount,
      NUMBER_FORMAT.decimalSeparator,
      NUMBER_FORMAT.groupSeparator,
    );
    return new TokenAmount(token, prev);
  }

  override divideByInteger(other: BigintIsh): TokenAmount {
    const value = super.divideByInteger(other);
    return new TokenAmount(this.token, value.raw);
  }

  override formatUnits(format = NUMBER_FORMAT) {
    return super.formatUnits(format);
  }
}
