import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { styled } from 'linaria/react';

import { WalletList } from 'components/common/WalletList';
import { Widget } from 'components/common/Widget';
import { Button } from 'components/ui';
import { openModal } from 'store/actions/modals';
import { SHOW_MODAL_ADD_COIN } from 'store/constants/modalTypes';

const Wrapper = styled.div``;

const ITEMS = [
  {
    name: 'Ethereum',
    balance1: '44,33 USD',
    balance2: '12 800,99 US$',
    value: '0,0034 Tkns',
    delta: '+0.35% 24 hrs',
  },
  {
    name: 'Coin name here',
    balance1: '44,33 USD',
    balance2: '12 800,99 US$',
    value: '0,0034 Tkns',
    delta: '+0.35% 24 hrs',
  },
];

type Props = {};

export const WalletsWidget: FunctionComponent<Props> = (props) => {
  const dispatch = useDispatch();

  const handleAddCoinClick = () => {
    dispatch(openModal(SHOW_MODAL_ADD_COIN));
  };

  return (
    <Widget
      title="Wallets"
      action={
        <Button link onClick={handleAddCoinClick}>
          + Add coin
        </Button>
      }>
      <WalletList items={ITEMS} />
    </Widget>
  );
};
