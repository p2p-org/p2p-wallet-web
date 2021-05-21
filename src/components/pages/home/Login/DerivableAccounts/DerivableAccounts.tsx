import React, { FC, useEffect, useState } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';

import { TokenAccount } from 'api/token/TokenAccount';
import { WalletType } from 'api/wallet';
import { DERIVATION_PATH, storeMnemonicAndSeed } from 'api/wallet/ManualWallet';
import { ToastManager } from 'components/common/ToastManager';
import { TokenAccountRow } from 'components/common/TokenAccountRow';
import { Button } from 'components/pages/home/common/Button';
import { getRatesMarkets } from 'store/slices/rate/RateSlice';
import {
  connect,
  connectWallet,
  getDerivableTokenAccounts,
  selectType,
} from 'store/slices/wallet/WalletSlice';
import { sleep } from 'utils/common';

import { Selector } from './Selector';
import { SelectorItemType } from './Selector/Selector';

const Wrapper = styled.div``;

const SubTitle = styled.div`
  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const SelectDerivationPath = styled(SubTitle)`
  margin-bottom: 8px;
`;

const Derivable = styled(SubTitle)`
  margin: 24px 0 0;
`;

const AccountsWrapper = styled.div`
  margin: 8px 0 22px;
`;

const TokenAccountRowStyled = styled(TokenAccountRow)`
  padding-right: 0;
  padding-left: 0;
`;

const DERIVATION_PATHS_WITH_LABELS = [
  {
    label: `m/44'/501'/0'`,
    value: DERIVATION_PATH.bip44,
  },
  {
    label: `m/44'/501'/0'/0'`,
    value: DERIVATION_PATH.bip44Change,
  },
  {
    label: `m/501'/0'/0/0 (deprecated)`,
    value: DERIVATION_PATH.deprecated,
  },
];

type Props = {
  mnemonic: string;
  seed: string;
  password: string;
  setIsLoading: (isLoading: boolean) => void;
};

export const DerivableAccounts: FC<Props> = ({ mnemonic, seed, password, setIsLoading }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [derivationPathItem, setDerivationPathItem] = useState(DERIVATION_PATHS_WITH_LABELS[1]);
  const derivableTokenAccounts = useSelector((state) =>
    state.wallet.derivableTokenAccounts.map((account) => TokenAccount.from(account)),
  );

  useEffect(() => {
    void dispatch(connect());
    // TODO: makes after login too, so maybe need to reduce
    void dispatch(getRatesMarkets());
  }, []);

  useEffect(() => {
    void dispatch(getDerivableTokenAccounts({ seed, derivationPath: derivationPathItem.value }));
  }, [seed, derivationPathItem]);

  const handleDerivationPathChange = (item: SelectorItemType) => {
    setDerivationPathItem(item);
  };

  const handleContinueClick = () => {
    batch(async () => {
      try {
        setIsLoading(true);
        dispatch(selectType(WalletType.MANUAL));
        unwrapResult(
          await dispatch(
            connectWallet({ seed, password, derivationPath: derivationPathItem.value }),
          ),
        );
        await storeMnemonicAndSeed(mnemonic, seed, derivationPathItem.value, password);
        await sleep(100);
        history.push('/wallets');
        // eslint-disable-next-line @typescript-eslint/no-shadow
      } catch (error) {
        ToastManager.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <Wrapper>
      <SelectDerivationPath>Select Derivation Path</SelectDerivationPath>
      <Selector
        value={derivationPathItem}
        items={DERIVATION_PATHS_WITH_LABELS}
        onChange={handleDerivationPathChange}
      />
      <Derivable>Derivable Accounts</Derivable>
      <AccountsWrapper>
        {derivableTokenAccounts?.map((tokenAccount) => (
          <TokenAccountRowStyled
            key={tokenAccount.address.toBase58()}
            tokenAccount={tokenAccount}
          />
        ))}
      </AccountsWrapper>

      <Button onClick={handleContinueClick}>Continue</Button>
    </Wrapper>
  );
};
