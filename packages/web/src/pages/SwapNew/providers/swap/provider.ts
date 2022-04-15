import { useEffect } from 'react';

import { createContainer } from 'unstated-next';

import { OrcaInfoInteractor } from 'app/__sdk/swap/iteractor/orca/OrcaInfoInteractor';

export interface UseSwap {}

export const useSwapInternal = (): UseSwap => {
  // const { publicKey } = useWallet();
  // const userTokenAccounts = useUserTokenAccounts();
  //
  // // initialTokenAccount
  //
  // const solTokenAccount = useMemo(() => {
  //   return userTokenAccounts.find((tokenAccount) => tokenAccount.balance?.token.isRawSOL);
  // }, [userTokenAccounts]);
  //
  // useEffect(() => {
  //   try {
  //     if (!solTokenAccount) {
  //       throw new Error('No SOL account found');
  //     }
  //
  //     const swapInteractor = new OrcaSwapInteractor(publicKey);
  //
  //     swapInteractor.initialize(solTokenAccount);
  //   } catch (err) {
  //     console.error('Error loading all data for swap:', err);
  //     // show message
  //   }
  // }, [publicKey, solTokenAccount]);

  useEffect(() => {
    const _orcaInfoInteractor = new OrcaInfoInteractor('mainnet-beta');
    _orcaInfoInteractor.load();

    const info = _orcaInfoInteractor.getInfo();
    const key = info?.tokens
      ? Object.entries(info.tokens).filter(
          ([, token]) => token.mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        )?.[0]?.[0] ?? null
      : null;

    console.log(222, key);
  }, []);

  return {};
};

export const { Provider: SwapProvider, useContainer: useSwap } = createContainer(useSwapInternal);
