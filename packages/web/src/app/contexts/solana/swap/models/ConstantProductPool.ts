import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';

import { ceilingDivision } from '../utils/math';
import OrcaPool from './OrcaPool';
import type OrcaPoolInterface from './OrcaPoolInterface';
import { OutputTooHighError } from './TradeablePoolInterface';

export default class ConstantProductPool extends OrcaPool implements OrcaPoolInterface {
  _getOutputAmount(inputAmount: u64, inputTokenName: string): u64 {
    const [poolInputAmount, poolOutputAmount] = this.getTokenAmountsFromInput(inputTokenName);

    const invariant = poolInputAmount.mul(poolOutputAmount);

    const [newPoolOutputAmount] = ceilingDivision(invariant, poolInputAmount.add(inputAmount));

    const outputAmount = poolOutputAmount.sub(newPoolOutputAmount);

    return new u64(outputAmount.toString());
  }

  override getOutputAmount(inputAmount: u64, inputTokenName: string): u64 {
    const fees = this._getFeeFromInput(inputAmount);
    const inputAmountLessFees = inputAmount.sub(fees);

    return this._getOutputAmount(inputAmountLessFees, inputTokenName);
  }

  getInputAmount(outputAmount: u64, outputTokenName: string): u64 {
    const [poolInputAmount, poolOutputAmount] = this.getTokenAmountsFromOutput(outputTokenName);

    if (outputAmount.gt(poolOutputAmount)) {
      throw new OutputTooHighError();
    }

    const invariant = poolInputAmount.mul(poolOutputAmount);

    const [newPoolInputAmount] = ceilingDivision(invariant, poolOutputAmount.sub(outputAmount));

    const inputAmountLessFees = newPoolInputAmount.sub(poolInputAmount);

    let feeRatioNumerator, feeRatioDenominator;
    if (this.poolConfig.ownerTradeFeeDenominator.eq(ZERO)) {
      feeRatioNumerator = this.poolConfig.feeDenominator;
      feeRatioDenominator = this.poolConfig.feeDenominator.sub(this.poolConfig.feeNumerator);
    } else {
      feeRatioNumerator = this.poolConfig.feeDenominator.mul(
        this.poolConfig.ownerTradeFeeDenominator,
      );
      feeRatioDenominator = this.poolConfig.feeDenominator
        .mul(this.poolConfig.ownerTradeFeeDenominator)
        .sub(this.poolConfig.feeNumerator.mul(this.poolConfig.ownerTradeFeeDenominator))
        .sub(this.poolConfig.ownerTradeFeeNumerator.mul(this.poolConfig.feeDenominator));
    }

    const inputAmount = inputAmountLessFees.mul(feeRatioNumerator).div(feeRatioDenominator);

    return new u64(inputAmount.toString());
  }

  // baseOutputAmount is the amount the user would receive
  // if fees are included and slippage is excluded.
  getBaseOutputAmount(inputAmount: u64, inputTokenName: string) {
    const [poolInputAmount, poolOutputAmount] = this.getTokenAmountsFromInput(inputTokenName);

    const fees = this._getFeeFromInput(inputAmount);
    const inputAmountLessFees = inputAmount.sub(fees);

    return new u64(inputAmountLessFees.mul(poolOutputAmount).div(poolInputAmount).toString());
  }

  _getFeeFromInput(inputAmount: u64) {
    const tradingFee = this.poolConfig.feeDenominator.eq(ZERO)
      ? ZERO
      : inputAmount.mul(this.poolConfig.feeNumerator).div(this.poolConfig.feeDenominator);

    const ownerFee = this.poolConfig.ownerTradeFeeDenominator.eq(ZERO)
      ? ZERO
      : inputAmount
          .mul(this.poolConfig.ownerTradeFeeNumerator)
          .div(this.poolConfig.ownerTradeFeeDenominator);

    return new u64(tradingFee.add(ownerFee).toString());
  }

  calculateFees(inputAmount: u64, inputTokenName: string): u64 {
    const fees = this._getFeeFromInput(inputAmount);

    return this._getOutputAmount(fees, inputTokenName);
  }
}
