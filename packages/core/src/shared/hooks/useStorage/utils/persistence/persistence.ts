import type { ExpiryDataType } from './storage_expiring';
import { createExpiringValue, getExpiringValue } from './storage_expiring';

export const setStorageValue = <T>(key: string, data: T, { msTTL }: { msTTL?: number } = {}) => {
  const expiringData = createExpiringValue(data, msTTL);
  return localStorage.setItem(key, JSON.stringify(expiringData));
};

export const getStorageValue = <T>(key: string) => {
  const strData = localStorage.getItem(key);
  if (!strData) {
    return null;
  }

  const value = getExpiringValue(JSON.parse(strData) as ExpiryDataType<T>);

  if (!value) {
    localStorage.removeItem(key);
    return null;
  }

  return value;
};
