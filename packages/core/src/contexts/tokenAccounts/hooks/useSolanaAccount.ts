import type { TokenAccount } from '../models';
import { useUserTokenAccounts } from './useUserTokenAccounts';

type UseSOLAccount = () => TokenAccount;

export const useSolAccount: UseSOLAccount = () => {
  const userAccounts = useUserTokenAccounts();

  return userAccounts.find((account) => account.balance?.token?.isRawSOL) as TokenAccount;
};
