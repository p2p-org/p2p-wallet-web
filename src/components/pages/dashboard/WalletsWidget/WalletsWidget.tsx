import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from 'linaria/react';

import { Widget } from 'components/common/Widget';
import { Button } from 'components/ui';
import { openModal } from 'store/actions/modals';
import { getOwnedTokenAccounts } from 'store/actions/solana';
import { SHOW_MODAL_ADD_COIN } from 'store/constants/modalTypes';
import { RootState } from 'store/types';

import { TokenList } from './TokenList';

const WrapperWidget = styled(Widget)``;

// const ITEMS = [
//   {
//     name: 'Ethereum',
//     balance1: '44,33 USD',
//     balance2: '12 800,99 US$',
//     value: '0,0034 Tkns',
//     delta: '+0.35% 24 hrs',
//   },
//   {
//     name: 'Coin name here',
//     balance1: '44,33 USD',
//     balance2: '12 800,99 US$',
//     value: '0,0034 Tkns',
//     delta: '+0.35% 24 hrs',
//   },
// ];

type Props = {};

export const WalletsWidget: FunctionComponent<Props> = (props) => {
  const dispatch = useDispatch();
  const entrypoint = useSelector((state: RootState) => state.data.blockchain.entrypoint);
  const order = useSelector((state: RootState) => state.entities.tokens.order);

  useEffect(() => {
    dispatch(getOwnedTokenAccounts());
  }, [entrypoint]);

  const handleAddCoinClick = () => {
    dispatch(openModal(SHOW_MODAL_ADD_COIN));
  };

  return (
    <WrapperWidget
      title="Wallets"
      action={
        <Button link onClick={handleAddCoinClick}>
          + Add coin
        </Button>
      }>
      <TokenList order={order} />
    </WrapperWidget>
  );
};
