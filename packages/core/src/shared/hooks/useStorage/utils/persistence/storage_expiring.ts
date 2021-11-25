export type ExpiryDataType<T> = {
  value: T;
  expiry: number;
};

export const createExpiringValue = <T>(value: T, ms?: number) => {
  if (ms) {
    return {
      value,
      expiry: Date.now() + ms,
    };
  }

  return {
    value,
    expiry: Number.MAX_SAFE_INTEGER,
  };
};

export const getExpiringValue = <T>(data: ExpiryDataType<T>) => {
  if (!data) {
    return null;
  }

  if (data.expiry < Date.now()) {
    return null;
  }

  return data.value;
};
