import React, { FunctionComponent, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useDispatch, useSelector } from 'react-redux';

import * as web3 from '@solana/web3.js';
import { styled } from 'linaria/react';

import { getConfirmedTransaction } from 'store/actions/solana';
import { RootState } from 'store/types';

const Wrapper = styled.div`
  display: table-row;
`;

const Column = styled.div`
  display: table-cell;

  &:not(:last-child) {
    padding-right: 24px;
  }
`;

type Props = {
  signature: string;
};

export const TransactionRow: FunctionComponent<Props> = ({ signature }) => {
  const dispatch = useDispatch();
  const transaction = useSelector(
    (state: RootState) => state.data.blockchain.transactionsNormalized[signature],
  );

  useEffect(() => {
    dispatch(getConfirmedTransaction(signature));
  }, []);

  let type;
  let fromPubkey;
  let lamports;
  let toPubkey;

  if (transaction) {
    const [instruction] = transaction.transaction.instructions;
    if (instruction.programId.toString() === web3.SystemProgram.programId.toString()) {
      type = web3.SystemInstruction.decodeInstructionType(instruction);

      switch (type) {
        case 'Transfer':
          ({ fromPubkey, lamports, toPubkey } = web3.SystemInstruction.decodeTransfer(instruction));
          break;
        default:
          break;
      }
    }
  }

  return (
    <Wrapper>
      <Column>
        <a
          href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          title={`Click here to see transaction ${signature} in explorer`}>
          {signature.slice(0, 25)}...
        </a>
      </Column>
      <Column>{transaction?.slot || <Skeleton height={24} width="100%" />}</Column>
      <Column>{fromPubkey?.toString() || <Skeleton height={24} width="100%" />}</Column>
      <Column>{toPubkey?.toString() || <Skeleton height={24} width="100%" />}</Column>
      <Column>{lamports || <Skeleton height={24} width="100%" />}</Column>
    </Wrapper>
  );
};
