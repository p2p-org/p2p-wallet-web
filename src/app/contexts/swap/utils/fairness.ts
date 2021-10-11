import Decimal from 'decimal.js';

export function getOraclePrice(inputPrice: number, outputPrice: number) {
  return new Decimal(inputPrice).dividedBy(new Decimal(outputPrice));
}

export function getRateDifferenceFromOracle(oraclePrice: Decimal, exchangeRate: Decimal) {
  return oraclePrice.minus(exchangeRate).dividedBy(oraclePrice).mul(new Decimal(100));
}

export function isFairPrice(rateDifference: Decimal) {
  return rateDifference.lessThan(1);
}
