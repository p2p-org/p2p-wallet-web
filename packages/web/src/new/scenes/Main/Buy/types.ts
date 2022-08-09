import type { CryptoCurrency } from 'new/services/BuyService/structures';

export type CryptoCurrenciesForSelectSymbols = 'SOL' | 'USDC';

export type CryptoCurrenciesForSelectType = { [key: string]: CryptoCurrency };
