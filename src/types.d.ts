declare module '*.png';

export type ParsedAccountData = {
  program: string;
  parsed: {
    type: string;
    info: {
      isNative: boolean;
      mint: string;
      owner: string;
      state: string;
    };
  };
  space: number;
};
