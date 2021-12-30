import { ZERO } from '@orca-so/sdk';
import {
  computeBaseOutputAmount,
  computeInputAmount,
  computeOutputAmount,
} from '@orca-so/stablecurve';
import { u64 } from '@solana/spl-token';

import OrcaPool from './OrcaPool';
import type OrcaPoolInterface from './OrcaPoolInterface';
import { OutputTooHighError } from './TradeablePoolInterface';

export default class StablePool extends OrcaPool implements OrcaPoolInterface {
  override getOutputAmount(inputAmount: u64, inputTokenName: string): u64 {
    const [poolInputAmount, poolOutputAmount] = this.getTokenAmountsFromInput(inputTokenName);

    const inputAmountLessFees = inputAmount.sub(this._computeFees(inputAmount));

    if (!this.poolConfig.amp) {
      throw new Error('amp does not exist in poolConfig');
    }

    return computeOutputAmount(
      inputAmountLessFees,
      poolInputAmount,
      poolOutputAmount,
      this.poolConfig.amp,
    );
  }

  // baseOutputAmount is the amount the user would receive
  // if fees are included and price impact is excluded.
  getBaseOutputAmount(inputAmount: u64, inputTokenName: string) {
    const [poolInputAmount, poolOutputAmount] = this.getTokenAmountsFromInput(inputTokenName);

    const inputAmountLessFees = inputAmount.sub(this._computeFees(inputAmount));

    if (!this.poolConfig.amp) {
      throw new Error('amp does not exist in poolConfig');
    }

    return computeBaseOutputAmount(
      inputAmountLessFees,
      poolInputAmount,
      poolOutputAmount,
      this.poolConfig.amp,
    );
  }

  getInputAmount(outputAmount: u64, outputTokenName: string): u64 {
    const [poolInputAmount, poolOutputAmount] = this.getTokenAmountsFromOutput(outputTokenName);

    if (outputAmount.gt(poolOutputAmount)) {
      throw new OutputTooHighError();
    }

    if (!this.poolConfig.amp) {
      throw new Error('amp does not exist in poolConfig');
    }

    const inputAmountLessFees = computeInputAmount(
      outputAmount,
      poolInputAmount,
      poolOutputAmount,
      this.poolConfig.amp,
    );

    const inputAmount = inputAmountLessFees
      .mul(this.poolConfig.feeDenominator)
      .div(this.poolConfig.feeDenominator.sub(this.poolConfig.feeNumerator));

    return new u64(inputAmount.toString());
  }

  calculateFees(inputAmount: u64, inputTokenName: string): u64 {
    const [poolInputAmount, poolOutputAmount] = this.getTokenAmountsFromInput(inputTokenName);

    const inputFees = this._computeFees(inputAmount);

    if (!this.poolConfig.amp) {
      throw new Error('amp does not exist in poolConfig');
    }

    return computeOutputAmount(inputFees, poolInputAmount, poolOutputAmount, this.poolConfig.amp);
  }

  private _computeFees(inputAmount: u64): u64 {
    const tradingFees = this._computeFee(
      inputAmount,
      this.poolConfig.feeNumerator,
      this.poolConfig.feeDenominator,
    );
    const ownerFees = this._computeFee(
      inputAmount,
      this.poolConfig.ownerTradeFeeNumerator,
      this.poolConfig.ownerTradeFeeDenominator,
    );

    return tradingFees.add(ownerFees);
  }

  private _computeFee(baseAmount: u64, feeNumerator: u64, feeDenominator: u64): u64 {
    if (feeNumerator.eq(ZERO)) {
      return ZERO;
    }

    return baseAmount.mul(feeNumerator).div(feeDenominator);
  }
}
