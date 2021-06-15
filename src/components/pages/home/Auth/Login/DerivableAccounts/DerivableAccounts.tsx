import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import { TokenAccount } from 'api/token/TokenAccount';
import { DERIVATION_PATH } from 'api/wallet/ManualWallet';
import { TokenAccountRow } from 'components/common/TokenAccountRow';
import { Button } from 'components/pages/home/Auth/common/Button';
import { Icon } from 'components/ui';
import { Popover } from 'components/ui/Popover';
import { getRatesMarkets } from 'store/slices/rate/RateSlice';
import { connect, getDerivableTokenAccounts } from 'store/slices/wallet/WalletSlice';
import { trackEvent } from 'utils/analytics';

import { Selector } from '../../common/Selector';
import { SelectorItemType } from '../../common/Selector/Selector';

const Wrapper = styled.div`
  position: relative;
`;

const SubTitle = styled.div`
  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const SelectDerivationPath = styled(SubTitle)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const CloseWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;

  background: #f6f6f8;
  border-radius: 4px;
`;

const CloseIcon = styled(Icon)`
  width: 12px;
  height: 12px;

  color: #161616;
`;

const QuestionIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #a3a5ba;
`;

const PopoverContent = styled.div`
  width: 328px;
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

const DERIVATION_PATHS_WITH_LABELS: SelectorItemType[] = [
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
  seed: string;
  next: (derivationPath: string) => void;
};

export const DerivableAccounts: FC<Props> = ({ seed, next }) => {
  const dispatch = useDispatch();
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
    trackEvent('login_select_derivation_path_click', { derivationPath: item.value });
    setDerivationPathItem(item);
  };

  const handleContinueClick = () => {
    trackEvent('login_continue_derivation_path_click', {
      derivationPath: derivationPathItem.value,
    });
    next(derivationPathItem.value);
  };

  return (
    <Wrapper>
      <SelectDerivationPath>
        Select Derivation Path{' '}
        <Popover
          button={(isShow) =>
            isShow ? (
              <CloseWrapper>
                <CloseIcon name="close" />
              </CloseWrapper>
            ) : (
              <QuestionIcon name="question-circle" />
            )
          }>
          <PopoverContent>
            By default, P2P wallet will use m/44&apos;/501&apos;/0&apos;/0&apos; as the derivation
            path for the main wallet. To use an alternative path, try restoring an existing wallet.
          </PopoverContent>
        </Popover>
      </SelectDerivationPath>
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
