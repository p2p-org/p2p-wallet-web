import React, { FunctionComponent, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { Feature } from 'flagged';
import { rgba } from 'polished';

import { TokenAccount } from 'api/token/TokenAccount';
import { Widget } from 'components/common/Widget';
import { Button, Icon } from 'components/ui';
import { FEATURE_ADD_TOKEN_BUTTON } from 'config/featureFlags';
import { openModal } from 'store/actions/modals';
import { SHOW_MODAL_ADD_COIN } from 'store/constants/modalTypes';
import { RootState } from 'store/rootReducer';

import { TokenList } from './TokenList';

const WrapperWidget = styled(Widget)``;

const AddButton = styled(Button)`
  color: #5887ff !important;

  &:hover {
    background: #eff3ff !important;
  }
`;

const IconPlus = styled(Icon)`
  width: 20px;
  height: 20px;
  margin-right: 8px;
`;

const HiddenTokens = styled.div`
  position: relative;

  display: flex;
  align-items: center;

  padding: 20px;

  cursor: pointer;

  &::before {
    position: absolute;
    top: 0;
    right: 10px;
    left: 10px;

    border-bottom: 1px solid ${rgba(0, 0, 0, 0.05)};

    content: '';
  }

  &.isOpen {
    &::after {
      position: absolute;
      right: 10px;
      bottom: 0;
      left: 10px;

      border-bottom: 1px solid ${rgba(0, 0, 0, 0.05)};

      content: '';
    }
  }
`;

const HideIconWrapper = styled.div`
  height: 24px;
  padding: 0 15px;
`;

const IconHide = styled(Icon)`
  width: 24px;
  height: 24px;

  &.isOpen {
    height: 18px;
  }

  color: #a3a5ba;
`;

const Text = styled.div`
  flex-grow: 1;

  color: #a3a5ba;

  font-weight: 600;
  font-size: 16px;
`;

const ChevronIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  color: #a3a5ba;
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  transform: rotate(270deg);
  cursor: pointer;

  &.isOpen {
    transform: rotate(0deg);
  }
`;

type Props = {
  selectedSymbol: string;
};

export const TokensWidget: FunctionComponent<Props> = ({ selectedSymbol }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );

  const hiddenTokens = useSelector((state: RootState) => state.wallet.hiddenTokens) || [];
  const zeroBalanceTokens = useSelector((state: RootState) => state.wallet.zeroBalanceTokens) || [];
  const { isZeroBalancesHidden } = useSelector((state: RootState) => state.wallet.settings);

  const [tokens, hiddenTokensList] = useMemo(() => {
    const newTokens = [];
    const newHiddenTokensList = [];

    for (const token of tokenAccounts) {
      if (
        hiddenTokens.includes(token.address.toBase58()) ||
        (isZeroBalancesHidden &&
          token.balance.lte(0) &&
          !zeroBalanceTokens.includes(token.address.toBase58()) &&
          (token.mint.symbol !== 'SOL' || token.isDerivable))
      ) {
        newHiddenTokensList.push(token);
      } else {
        newTokens.push(token);
      }
    }

    return [newTokens, newHiddenTokensList];
  }, [tokenAccounts, isZeroBalancesHidden, zeroBalanceTokens, hiddenTokens]);

  const handleAddCoinClick = () => {
    void dispatch(openModal({ modalType: SHOW_MODAL_ADD_COIN }));
  };

  const handleChevronClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <WrapperWidget
      title="Wallets"
      action={
        <Feature name={FEATURE_ADD_TOKEN_BUTTON}>
          <AddButton lightGray small onClick={handleAddCoinClick}>
            <IconPlus name="plus" /> Add Token
          </AddButton>
        </Feature>
      }>
      <TokenList
        items={tokens}
        selectedSymbol={selectedSymbol}
        isZeroBalancesHidden={isZeroBalancesHidden}
      />
      {hiddenTokensList.length > 0 ? (
        <HiddenTokens onClick={handleChevronClick} className={classNames({ isOpen })}>
          <HideIconWrapper>
            <IconHide name={isOpen ? 'eye-hide' : 'eye'} className={classNames({ isOpen })} />
          </HideIconWrapper>
          <Text>{`${hiddenTokensList.length} hidden wallet${
            hiddenTokensList.length !== 1 ? 's' : ''
          }`}</Text>
          <ChevronWrapper className={classNames({ isOpen })}>
            <ChevronIcon name="chevron" />
          </ChevronWrapper>
        </HiddenTokens>
      ) : undefined}
      {isOpen ? (
        <TokenList
          items={hiddenTokensList}
          selectedSymbol={selectedSymbol}
          isZeroBalancesHidden={isZeroBalancesHidden}
          isHidden
        />
      ) : undefined}
    </WrapperWidget>
  );
};
