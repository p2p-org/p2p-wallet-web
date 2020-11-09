import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { styled } from 'linaria/react';

import { Modal } from 'components/common/Modal';
import { getOwnedTokenAccounts } from 'store/actions/solana';

import { TokenList } from './common/TokenList';

const WrapperModal = styled(Modal)`
  flex-basis: 588px;
`;

const ITEMS = [
  {
    symbol: 'SRM',
    name: 'Serum',
    price: '$0.887832',
    delta: '+16.9% for 24hrs',
  },
  {
    symbol: 'MSRM',
    name: 'MegaSerum',
    price: '$0.887832',
    delta: '+16.9% for 24hrs',
  },
  {
    symbol: 'BTC',
    name: 'Wrapped Bitcoin',
    price: '$0.887832',
    delta: '+16.9% for 24hrs',
  },
  {
    symbol: 'ETH',
    name: 'Wrapped Ethereum',
    price: '$0.887832',
    delta: '+16.9% for 24hrs',
  },
  {
    symbol: 'FTT',
    name: 'Wrapped FTT',
    price: '$0.887832',
    delta: '+16.9% for 24hrs',
  },
  {
    symbol: 'YFI',
    name: 'Wrapped YFI',
    price: '$0.887832',
    delta: '+16.9% for 24hrs',
  },
  {
    symbol: 'YFI',
    name: 'Wrapped YFI',
    price: '$0.887832',
    delta: '+16.9% for 24hrs',
  },
];

type Props = {};

export const AddCoin: FunctionComponent<Props> = ({ close }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOwnedTokenAccounts());
  }, []);

  return (
    <WrapperModal
      title="Add coins"
      description="Add a token to your wallet. This will cost 0.002039 SOL."
      close={close}>
      <TokenList items={ITEMS} />
    </WrapperModal>
  );
};
