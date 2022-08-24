export enum StatsInfoOperationType {
  topUp = 'TopUp',
  transfer = 'Transfer',
  swap = 'Swap',
  other = 'Other',
}

export enum StatsInfoDeviceType {
  web = 'Web',
  android = 'Android',
  iOS = 'Ios',
}

export class StatsInfo {
  operationType: StatsInfoOperationType;
  deviceType: StatsInfoDeviceType;
  currency: string | null;
  build: string | null;

  constructor({
    operationType,
    deviceType,
    currency,
    build,
  }: {
    operationType: StatsInfoOperationType;
    deviceType: StatsInfoDeviceType;
    currency: string | null;
    build: string | null;
  }) {
    this.operationType = operationType;
    this.deviceType = deviceType;
    this.currency = currency;
    this.build = build;
  }

  toJSON() {
    return {
      operation_type: this.operationType,
      device_type: this.deviceType,
      currency: this.currency,
      build: this.build,
    };
  }
}
