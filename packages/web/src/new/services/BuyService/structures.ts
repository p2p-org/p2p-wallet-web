import { BASE_CURRENCY_SYMBOL } from 'new/services/BuyService/constants';

type FiatCurrencySymbol = 'USD';
type CryptoCurrencySymbol = 'SOL' | 'USDC';

export type BuyCurrencyType = FiatCurrency | CryptoCurrency;

export class FiatCurrency {
  private _symbol: FiatCurrencySymbol = BASE_CURRENCY_SYMBOL;

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
