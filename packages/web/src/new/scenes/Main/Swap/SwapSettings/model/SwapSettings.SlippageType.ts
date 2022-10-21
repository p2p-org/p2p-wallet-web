export enum SlippageTypeType {
  oneTenth = 'oneTenth',
  fiveTenth = 'fiveTenth',
  one = 'one',
  five = 'five',
  custom = 'custom',
}

export class SlippageType {
  type: SlippageTypeType;
  private _value: number | null = null;

  static allCases: SlippageType[] = [
    SlippageType.oneTenth(),
    SlippageType.fiveTenth(),
    SlippageType.one(),
    SlippageType.five(),
  ];

  static oneTenth(): SlippageType {
    return new SlippageType(SlippageTypeType.oneTenth);
  }
  static fiveTenth(): SlippageType {
    return new SlippageType(SlippageTypeType.fiveTenth);
  }
  static one(): SlippageType {
    return new SlippageType(SlippageTypeType.one);
  }
  static five(): SlippageType {
    return new SlippageType(SlippageTypeType.five);
  }
  static custom(value: number | null): SlippageType {
    return new SlippageType(SlippageTypeType.custom, value);
  }

  static new(value: number): SlippageType {
    switch (value) {
      case 0.001:
        return SlippageType.oneTenth();
      case 0.005:
        return SlippageType.fiveTenth();
      case 0.01:
        return SlippageType.one();
      case 0.05:
        return SlippageType.five();
      default:
        return SlippageType.custom(value * 100);
    }
  }

  constructor(type: SlippageTypeType, value: number | null = null) {
    this.type = type;
    this._value = value;
  }

  get description(): string {
    switch (this.type) {
      case SlippageTypeType.oneTenth:
        return '0.1%';
      case SlippageTypeType.fiveTenth:
        return '0.5%';
      case SlippageTypeType.one:
        return '1%';
      case SlippageTypeType.five:
        return '5%';
      case SlippageTypeType.custom:
        return 'Custom';
    }
  }

  get value(): number | null {
    let slippage: number | null;

    switch (this.type) {
      case SlippageTypeType.oneTenth:
        slippage = 0.1;
        break;
      case SlippageTypeType.fiveTenth:
        slippage = 0.5;
        break;
      case SlippageTypeType.one:
        slippage = 1;
        break;
      case SlippageTypeType.five:
        slippage = 5;
        break;
      case SlippageTypeType.custom:
        slippage = this._value;
        break;
    }

    return slippage ? slippage / 100 : null;
  }
}
