import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import * as web3 from '@solana/web3.js';
import { styled } from 'linaria/react';
import { path } from 'ramda';

import { TransactionList } from 'components/common/TransactionList';
import { Widget } from 'components/common/Widget';
import { TokenSelector } from 'components/pages/wallet/ActionsWidget/TokenSelector';
import { getConfirmedSignaturesForAddress } from 'store/actions/solana';
import { ApiSolanaService } from 'store/middlewares/solana-api/services';
import { RootState } from 'store/types';

const WrapperWidget = styled(Widget)``;

// const ITEMS = [
//   {
//     type: 'Receive Tokens',
//     date: '11 oct 2020',
//     usd: '+ 44,51 US$',
//     value: '0,00344 Tkns',
//   },
//   {
//     type: 'Receive Tokens',
//     date: '11 oct 2020',
//     usd: '44,51 US$',
//     value: '0,00344 Tkns',
//   },
//   {
//     type: 'Top-up',
//     date: '11 oct 2020',
//     usd: '+ 144,51 US$',
//     value: '0,00344 Tkns',
//   },
// ];

type Props = {
  publicKey: web3.PublicKey;
};

export const ActivityWidget: FunctionComponent<Props> = ({ publicKey }) => {
  const dispatch = useDispatch();
  const order = useSelector((state: RootState) =>
    path<string[]>(['order'], state.entities.transactions[publicKey.toBase58()]),
  );

  useEffect(() => {
    dispatch(getConfirmedSignaturesForAddress(publicKey));
  }, [ApiSolanaService.getConnection(), publicKey]);

  return (
    <WrapperWidget title="Activity">
      <TransactionList order={order} />
    </WrapperWidget>
  );
};
