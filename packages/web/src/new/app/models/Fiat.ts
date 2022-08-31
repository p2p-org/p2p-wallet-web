export enum FiatType {
  usd = 'usd',
  eur = 'eur',
  cny = 'cny',
  vnd = 'vnd',
  rub = 'rub',
  gbp = 'gbp',
}

export class Fiat {
  type: FiatType = FiatType.usd;

  static get usd(): Fiat {
    return new Fiat(FiatType.usd);
  }
  static get eur(): Fiat {
    return new Fiat(FiatType.eur);
  }
  static get cny(): Fiat {
    return new Fiat(FiatType.cny);
  }
  static get vnd(): Fiat {
    return new Fiat(FiatType.vnd);
  }
  static get rub(): Fiat {
    return new Fiat(FiatType.rub);
  }
  static get gbp(): Fiat {
    return new Fiat(FiatType.gbp);
  }

  constructor(type: FiatType) {
    this.type = type;
  }

  get code(): string {
    return this.type.toUpperCase();
  }

  get symbol(): string {
    switch (this.type) {
      case FiatType.usd:
        return '$';
      case FiatType.eur:
        return '€';
      case FiatType.cny:
        return '¥';
      case FiatType.vnd:
        return '₫';
      case FiatType.rub:
        return '₽';
      case FiatType.gbp:
        return '£';
    }
  }

  get name(): string {
    switch (this.type) {
      case FiatType.usd:
        return 'United States Dollar';
      case FiatType.eur:
        return 'Euro';
      case FiatType.cny:
        return 'Chinese Yuan';
      case FiatType.vnd:
        return 'Vietnamese Dong';
      case FiatType.rub:
        return 'Russian Ruble';
      case FiatType.gbp:
        return 'British Pound sterling';
    }
  }
}
