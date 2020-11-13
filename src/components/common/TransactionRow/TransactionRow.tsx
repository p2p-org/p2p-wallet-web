import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { Avatar } from 'components/ui';
import { openModal } from 'store/actions/modals';
import { getConfirmedTransaction } from 'store/actions/solana';
import { SHOW_MODAL_TRANSACTION_DETAILS } from 'store/constants/modalTypes';
import { RootState } from 'store/types';
import { useDecodeInstrcutions } from 'utils/hooks/useDecodeInstrcutions';

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
  signature: string;
};

export const TransactionRow: FunctionComponent<Props> = ({ signature }) => {
  const dispatch = useDispatch();
  const transaction = useSelector(
    (state: RootState) => state.entities.transactionsNormalized[signature],
  );

  useEffect(() => {
    dispatch(getConfirmedTransaction(signature));
  }, []);

  const { type, fromPubkey, lamports, toPubkey } = useDecodeInstrcutions(
    transaction?.transaction.instructions,
  );

  const handleClick = () => {
    dispatch(openModal(SHOW_MODAL_TRANSACTION_DETAILS, { signature }));
  };

  return (
    <Wrapper onClick={handleClick}>
      <AvatarStyled />
      <Content>
        <Top>
          <div>{type}</div>
          {/* <div>{type}</div> <div>{usd}</div> */}
        </Top>
        <Bottom>
          <div /> <div>{lamports}</div>
          {/* <div>{date}</div> <div>{value}</div> */}
        </Bottom>
      </Content>
    </Wrapper>
  );
};
