import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { TokenAccount } from '@p2p-wallet-web/core';
import { tryParseTokenAmount, useTokenAccount, useWallet } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import type { RenNetwork } from '@renproject/interfaces';
import type { TokenAmount } from '@saberhq/token-utils';
import { createContainer } from 'unstated-next';

import { useRenNetwork } from 'utils/hooks/renBridge/useNetwork';

import { isValidAddress } from './utils';

export type Blockchain = 'solana' | 'bitcoin';

export const BLOCKCHAINS: Blockchain[] = ['solana', 'bitcoin'];

export interface UseSendState {
  fromTokenAccount?: TokenAccount | null;
  setFromTokenAccount: (v: TokenAccount) => void;

  fromAmount: string;
  setFromAmount: (v: string) => void;
  parsedAmount: TokenAmount | undefined;

  toPublicKey: string;
  setToPublicKey: (v: string) => void;
  destinationAddress: string;

  resolvedAddress: string | null;
  setResolvedAddress: (v: string | null) => void;

  blockchain: Blockchain;
  setBlockchain: (v: Blockchain) => void;

  renNetwork: RenNetwork;

  isExecuting: boolean;
  setIsExecuting: (v: boolean) => void;

  isAddressInvalid: boolean;

  isRenBTC: boolean;

  isConfirmCorrectAddress: boolean;
  setIsConfirmCorrectAddress: (v: boolean) => void;

  isShowConfirmAddressSwitch: boolean;
  setIsShowConfirmAddressSwitch: (v: boolean) => void;

  isInitBurnAndRelease: boolean;
  setIsInitBurnAndRelease: (v: boolean) => void;
}

const useSendStateInternal = (): UseSendState => {
  const { publicKey } = useParams<{ publicKey: string }>();
  const { publicKey: publicKeySol } = useWallet();

  const tokenAccount = useTokenAccount(usePubkey(publicKey ?? publicKeySol));
  const [fromTokenAccount, setFromTokenAccount] = useState<TokenAccount | null | undefined>(null);

  const [fromAmount, setFromAmount] = useState('');
  const parsedAmount = tryParseTokenAmount(
    fromTokenAccount?.balance?.token ?? undefined,
    fromAmount,
  );

  const [toPublicKey, setToPublicKey] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  const [blockchain, setBlockchain] = useState<Blockchain>(BLOCKCHAINS[0]!);

  const renNetwork = useRenNetwork();

  const [isExecuting, setIsExecuting] = useState(false);

  const [isConfirmCorrectAddress, setIsConfirmCorrectAddress] = useState(false);

  const [isShowConfirmAddressSwitch, setIsShowConfirmAddressSwitch] = useState(false);
  const [isInitBurnAndRelease, setIsInitBurnAndRelease] = useState(false);

  useEffect(() => {
    if (tokenAccount?.balance) {
      setFromTokenAccount(tokenAccount);
    }
  }, [tokenAccount]);

  const destinationAddress = resolvedAddress || toPublicKey;

  const isAddressInvalid = useMemo(() => {
    if (destinationAddress.length) {
      return !isValidAddress(blockchain, destinationAddress, renNetwork);
    }

    return false;
  }, [blockchain, destinationAddress, renNetwork]);

  const isRenBTC = fromTokenAccount?.balance?.token.symbol === 'renBTC';

  return {
    fromTokenAccount,
    setFromTokenAccount,
    fromAmount,
    setFromAmount,
    parsedAmount,
    toPublicKey,
    setToPublicKey,
    destinationAddress,
    resolvedAddress,
    setResolvedAddress,
    blockchain,
    setBlockchain,
    renNetwork,
    isExecuting,
    setIsExecuting,
    isAddressInvalid,
    isRenBTC,
    isConfirmCorrectAddress,
    setIsConfirmCorrectAddress,
    isShowConfirmAddressSwitch,
    setIsShowConfirmAddressSwitch,
    isInitBurnAndRelease,
    setIsInitBurnAndRelease,
  };
};

export const { Provider: SendStateProvider, useContainer: useSendState } =
  createContainer(useSendStateInternal);
