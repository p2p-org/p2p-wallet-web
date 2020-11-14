import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

import * as web3 from '@solana/web3.js';
import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { Card } from 'components/common/Card';
import { Button, Icon } from 'components/ui';
import { openModal } from 'store/actions/modals';
import { getConfirmedTransaction } from 'store/actions/solana';
import { SHOW_MODAL_TRANSACTION_DETAILS } from 'store/constants/modalTypes';
import { RootState } from 'store/types';
import { useDecodeSystemProgramInstructions } from 'utils/hooks/instructions/useDecodeSystemProgramInstructions';

const WrapperCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
`;

const HeaderImage = styled.div`
  background-image: url('images/sun.png');
  background-size: 183px 175px;
  background-repeat: no-repeat;
  height: 183px;
  width: 175px;
  margin-bottom: 32px;
`;

const CircleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 32px -4px 24px 0;

  background: #e1e1e1;
  border-radius: 50%;
`;

const ArrowIcon = styled(Icon)`
  width: 17px;
  height: 17px;

  transform: rotate(180deg);
`;

const Value = styled.div`
  color: #000000;
  font-weight: 500;
  font-size: 28px;
  line-height: 33px;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
  padding: 0 16px;
  margin: 12px 0;

  color: ${rgba('#000', 0.5)};
  font-weight: bold;
  font-size: 12px;
  line-height: 14px;

  background: #f4f4f4;
  border-radius: 8px;
`;

const Details = styled.div`
  margin-bottom: 32px;

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 140%;

  cursor: pointer;
`;

type Props = {};

export const ResultWidget: FunctionComponent<Props> = (props) => {
  const {
    state: { signature },
  } = useLocation();
  const dispatch = useDispatch();
  const transaction = useSelector(
    (state: RootState) => state.entities.transactionsNormalized[signature],
  );

  const { type, fromPubkey, lamports, toPubkey } = useDecodeSystemProgramInstructions(
    transaction?.transaction.instructions,
  );

  useEffect(() => {
    dispatch(getConfirmedTransaction(signature));
  }, []);

  const handleDetailsClick = () => {
    dispatch(openModal(SHOW_MODAL_TRANSACTION_DETAILS, { signature }));
  };

  return (
    <WrapperCard>
      <HeaderImage />
      <CircleWrapper>
        <ArrowIcon name="arrow-angle" />
      </CircleWrapper>
      <Value>{lamports / web3.LAMPORTS_PER_SOL}</Value>
      <Status>Processed</Status>
      <Details onClick={handleDetailsClick}>Transaction details</Details>
      <Button primary big full as={Link} to={`/wallet/${fromPubkey}`}>
        Go back to wallet
      </Button>
    </WrapperCard>
  );
};
