import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { TransactionSignature } from '@solana/web3.js';
import { rgba } from 'polished';

import { Transaction } from 'api/transaction/Transaction';
import { Avatar } from 'components/ui';
import { openModal } from 'store/_actions/modals';
import { SHOW_MODAL_TRANSACTION_DETAILS } from 'store/constants/modalTypes';
import { RootState } from 'store/rootReducer';
import { useTransactionInfo } from 'utils/hooks/useTransactionInfo';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: 69px;
  padding: 15px;

  background: #fff;

  border-radius: 12px 12px;
  cursor: pointer;
`;

const AvatarStyled = styled(Avatar)`
  width: 32px;
  height: 32px;
  margin-right: 15px;

  background: #c4c4c4;
`;

const Content = styled.div`
  flex: 1;

  font-size: 14px;
  line-height: 17px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: #000;
  font-weight: 500;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;

  color: ${rgba('#000', 0.3)};
`;

type Props = {
  signature: TransactionSignature;
};

export const TransactionRow: FunctionComponent<Props> = ({ signature }) => {
  const dispatch = useDispatch();
  const transaction = useSelector((state: RootState) => state.transaction.items[signature]);

  // const { slot, type, symbol, amount } = useTransactionInfo(transaction);

  const handleClick = () => {
    dispatch(openModal(SHOW_MODAL_TRANSACTION_DETAILS, { signature: transaction.signature }));
  };

  console.log(transaction);

  return (
    <Wrapper onClick={handleClick}>
      <AvatarStyled />
      <Content>
        {/*  <Top> */}
        {/*    <div>{type}</div> <AmountUSDT value={amount} symbol={symbol} /> */}
        {/*  </Top> */}
        {/*  <Bottom> */}
        {/*    <div>{slot} SLOT</div> */}
        {/*    <div> */}
        {/*      {amount} {symbol} */}
        {/*    </div> */}
        {/*  </Bottom> */}
      </Content>
    </Wrapper>
  );
};
