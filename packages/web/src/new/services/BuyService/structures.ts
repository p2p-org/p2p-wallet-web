import { BASE_CURRENCY_SYMBOL } from 'new/services/BuyService/constants';

type FiatCurrencySymbol = 'USD';
type CryptoCurrencySymbol = 'SOL' | 'USDC';

export type BuyCurrencyType = FiatCurrency | CryptoCurrency;

export class FiatCurrency {
  private _symbol: FiatCurrencySymbol = BASE_CURRENCY_SYMBOL;

  static isFiat(currency: BuyCurrencyType) {
    return currency instanceof FiatCurrency;
  }

  static get usd() {
    return new FiatCurrency();
  }

  get symbol() {
    switch (this._symbol) {
      case 'USD':
        return 'USD';
    }
  }

  get moonpayCode() {
    switch (this._symbol) {
      case 'USD':
        return 'usd';
    }
  }
}

export class CryptoCurrency {
  private _symbol: CryptoCurrencySymbol;

  static isCrypto(currency: BuyCurrencyType) {
    return currency instanceof CryptoCurrency;
  }

  static get sol() {
    return new CryptoCurrency('SOL');
  }

  static get usdc() {
    return new CryptoCurrency('USDC');
  }

  constructor(symbol: CryptoCurrencySymbol) {
    this._symbol = symbol;
  }

  get symbol() {
    switch (this._symbol) {
      case 'SOL':
        return 'SOL';
      case 'USDC':
        return 'USDC';
    }
  }

  get fullName() {
    switch (this._symbol) {
      case 'SOL':
        return 'Solana';
      case 'USDC':
        return 'USD Coin';
    }
  }

  get solanaCode() {
    switch (this._symbol) {
      case 'SOL':
        return 'SOL';
      case 'USDC':
        return 'USDC';
    }
  }

  get moonpayCode() {
    switch (this._symbol) {
      case 'SOL':
        return 'sol';
      case 'USDC':
        return 'usdc_sol';
    }
  }
}

export class ExchangeInput {
  amount: number;
  currency: BuyCurrencyType;

  static zeroInstance(currency: BuyCurrencyType) {
    return new ExchangeInput(0, currency);
  }

  constructor(amount: number, currency: BuyCurrencyType) {
    this.amount = amount;
    this.currency = currency;
  }

  swap(output: ExchangeOutput) {
    return {
      input: new ExchangeInput(output.amount, output.currency),
      output: new ExchangeOutput(
        this.amount,
        this.currency,
        output.price,
        output.processingFee,
        output.networkFee,
        output.purchaseCost,
        output.total,
      ),
    };
  }
}

export class ExchangeOutput {
  amount: number;
  currency: BuyCurrencyType;

  price: number;
  processingFee: number;
  networkFee: number;
  purchaseCost: number;

  total: number;

  static zeroInstance(currency: BuyCurrencyType) {
    return new ExchangeOutput(0, currency, 0, 0, 0, 0, 0);
  }

  constructor(
    amount: number,
    currency: BuyCurrencyType,
    price: number,
    processingFee: number,
    networkFee: number,
    purchaseCost: number,
    total: number,
  ) {
    this.amount = amount;
    this.currency = currency;
    this.price = price;
    this.processingFee = processingFee;
    this.networkFee = networkFee;
    this.purchaseCost = purchaseCost;
    this.total = total;
  }
}
