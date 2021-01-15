import React, { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import { TokenAccount } from 'api/token/TokenAccount';
import { Widget } from 'components/common/Widget';
import { Button } from 'components/ui';
import { openModal } from 'store/_actions/modals';
import { SHOW_MODAL_ADD_COIN } from 'store/constants/modalTypes';
import { RootState } from 'store/rootReducer';

import { TokenList } from './TokenList';

const WrapperWidget = styled(Widget)``;

export const TokensWidget: FunctionComponent = () => {
  const dispatch = useDispatch();
  // const order = useSelector((state: RootState) => state.entities.tokens.order);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  // const publicKey = useSelector((state: RootState) =>
  //   state.data.blockchain.account?.publicKey.toBase58(),
  // );

  // const preparedOrder = useMemo(() => (publicKey ? [publicKey, ...order] : order), [
  //   publicKey,
  //   order,
  // ]);

  const handleAddCoinClick = () => {
    dispatch(openModal(SHOW_MODAL_ADD_COIN));
  };

  return (
    <WrapperWidget
      title="Currencies"
      action={
        <Button link onClick={handleAddCoinClick}>
          + Add Token
        </Button>
      }>
      <TokenList items={tokenAccounts} />
    </WrapperWidget>
  );
};
