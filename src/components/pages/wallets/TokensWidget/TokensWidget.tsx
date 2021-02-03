import React, { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import { TokenAccount } from 'api/token/TokenAccount';
import { Widget } from 'components/common/Widget';
import { Button, Icon } from 'components/ui';
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

export const TokensWidget: FunctionComponent = () => {
  const dispatch = useDispatch();
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );

  const handleAddCoinClick = () => {
    dispatch(openModal(SHOW_MODAL_ADD_COIN));
  };

  return (
    <WrapperWidget
      title="Wallets"
      action={
        <AddButton lightGray small onClick={handleAddCoinClick}>
          <IconPlus name="plus" /> Add Token
        </AddButton>
      }>
      <TokenList items={tokenAccounts} />
    </WrapperWidget>
  );
};
