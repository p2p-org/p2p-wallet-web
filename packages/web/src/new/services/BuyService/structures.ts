import { BASE_CURRENCY_CODE } from 'new/services/BuyService/constants';

type FiatCurrencyName = 'usd';
type CryptoCurrencyCode = 'sol' | 'usdc';

export type BuyCurrencyType = FiatCurrency | CryptoCurrency;

export class FiatCurrency {
  private _name: FiatCurrencyName = BASE_CURRENCY_CODE;

  static get usd() {
    return new FiatCurrency();
  }

  get name() {
    return this._name.toUpperCase();
  }

  get moonpayCode() {
    return 'usd';
  }
}

export class CryptoCurrency {
  private _code: CryptoCurrencyCode;

  static get sol() {
    return new CryptoCurrency('sol');
  }

  static get usdc() {
    return new CryptoCurrency('usdc');
  }

  constructor(code: CryptoCurrencyCode) {
    this._code = code;
  }

  get name() {
    return this._code.toUpperCase();
  }

  get fullName() {
    switch (this._code) {
      case 'sol':
        return 'Solana';
      case 'usdc':
        return 'USD Coin';
    }
  }

  get solanaCode() {
    return this._code;
  }

  get moonpayCode() {
    switch (this._code) {
      case 'sol':
        return 'sol';
      case 'usdc':
        return 'usdc_sol';
    }
  }

  /*get mintAddress() {
    const mintAddress = CryptoCurrency.Addresses[Defaults.apiEndpoint.network][this._code];
    if (!mintAddress) {
      assert(true, `Unhandeled mint address for ${Defaults.apiEndpoint.network} : ${this._code}`);
    }
    return mintAddress;
  }

  static Addresses = {
    'mainnet-beta': {
      sol: NATIVE_MINT.toBase58(),
      usdc: USDC_MINT.toBase58(),
    },
    testnet: {
      sol: NATIVE_MINT.toBase58(),
      usdc: 'CpMah17kQEL2wqyMKt3mZBdTnZbkbfx4nqmQMFDP5vwp',
    },
    devnet: {
      sol: NATIVE_MINT.toBase58(),
      usdc: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    },
    localnet: {
      sol: '',
      usdc: '',
    },
  };*/
}

export class ExchangeInput {
  amount: number;
  currency: BuyCurrencyType;

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

  processingFee: number;
  networkFee: number;
  purchaseCost: number;

  total: number;

  constructor(
    amount: number,
    currency: BuyCurrencyType,
    processingFee: number,
    networkFee: number,
    purchaseCost: number,
    total: number,
  ) {
    this.amount = amount;
    this.currency = currency;
    this.processingFee = processingFee;
    this.networkFee = networkFee;
    this.purchaseCost = purchaseCost;
    this.total = total;
  }
}

export class ExchangeRate {
  amount: number;
  cryptoCurrency: CryptoCurrency;
  fiatCurrency: FiatCurrency;

  constructor(amount: number, cryptoCurrency: CryptoCurrency, fiatCurrency: FiatCurrency) {
    this.amount = amount;
    this.cryptoCurrency = cryptoCurrency;
    this.fiatCurrency = fiatCurrency;
  }
}
