import type { Blockchain } from 'app/contexts';

export type SelectItemBlockchainType = {
  key: Blockchain;
  symbol: 'SOL' | 'renBTC';
  title: string;
  feeTitle: string;
  feeValue: string;
};

export type SelectItemAutoType = {
  key: 'auto';
  icon: string;
  title: string;
  forValue: {
    title: string;
    description: string;
  };
};

export type SelectItemNotificationType = {
  key: 'notification';
};

export type SelectItemType =
  | SelectItemAutoType
  | SelectItemBlockchainType
  | SelectItemNotificationType;

export type SelectItemValueType = Exclude<SelectItemType, SelectItemNotificationType>;
