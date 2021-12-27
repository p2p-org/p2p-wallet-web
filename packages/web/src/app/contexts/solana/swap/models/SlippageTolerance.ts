import { u64 } from '@solana/spl-token';

import { parseString } from '../utils/format';

export default class SlippageTolerance {
  numerator: u64;
  denominator: u64;

  constructor(numerator: u64, denominator: u64) {
    this.numerator = numerator;
    this.denominator = denominator;
  }

  static fromString(tolerance: string) {
    const numerator = parseString(tolerance, 1);
    const denominator = new u64(1000);

    return new SlippageTolerance(numerator, denominator);
  }

  toString() {
    return ((this.numerator.toNumber() / this.denominator.toNumber()) * 100).toFixed(1);
  }

  eq(t2: SlippageTolerance) {
    return this.numerator.eq(t2.numerator) && this.denominator.eq(t2.denominator);
  }

  stringEq(tolerance: string) {
    const t2 = SlippageTolerance.fromString(tolerance);
    return this.numerator.eq(t2.numerator) && this.denominator.eq(t2.denominator);
  }
}
