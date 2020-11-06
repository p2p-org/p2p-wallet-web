import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { styled } from 'linaria/react';

import { WalletList } from 'components/common/WalletList';
import { Widget } from 'components/common/Widget';

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
  return (
    <Widget title="Wallets" action={<Link to="/">+ Add coin</Link>}>
      <WalletList items={ITEMS} />
    </Widget>
  );
};
