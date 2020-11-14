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
import { RootState, TokenAccount } from 'store/types';
import { useDecodeSystemProgramInstructions } from 'utils/hooks/instructions/useDecodeSystemProgramInstructions';
import { useDecodeTokenRegInstructions } from 'utils/hooks/instructions/useDecodeTokenRegInstractions';
import { usePopulateTokenInfo } from 'utils/hooks/usePopulateTokenInfo';

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

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
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
  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 140%;

  cursor: pointer;
`;

type Props = {};

export const ResultWidget: FunctionComponent<Props> = (props) => {
  const { state: locationState } = useLocation();
  const dispatch = useDispatch();
  const transaction = useSelector(
    (state: RootState) => state.entities.transactionsNormalized[locationState?.signature],
  );

  const transactionAuthor = transaction?.transaction.signatures[0].publicKey.toBase58();
  const tokenAccount: TokenAccount = useSelector(
    (state: RootState) => state.entities.tokens.items[transactionAuthor],
  );
  const { mint } = tokenAccount?.parsed || { amount: 0 };
  let { symbol } = usePopulateTokenInfo({ mint: mint?.toBase58() });

  const { type, fromPubkey, lamports, toPubkey } = useDecodeSystemProgramInstructions(
    transaction?.transaction.instructions,
  );

  const { transfer } = useDecodeTokenRegInstructions(transaction?.transaction.instructions);

  useEffect(() => {
    const mount = async () => {
      const trx = await dispatch(getConfirmedTransaction(locationState?.signature));

      if (!trx) {
        setTimeout(mount, 3000);
      }
    };

    void mount();
  }, []);

  const handleDetailsClick = () => {
    dispatch(openModal(SHOW_MODAL_TRANSACTION_DETAILS, { signature: locationState?.signature }));
  };

  // TODO: dirty
  let amount = 0;
  if (type) {
    symbol = 'SOL';
    amount = (lamports || 0) / web3.LAMPORTS_PER_SOL;
  } else if (transfer) {
    amount = (transfer.amount || 0) / web3.LAMPORTS_PER_SOL;
  }

  return (
    <WrapperCard>
      <HeaderImage />
      <CircleWrapper>
        <ArrowIcon name="arrow-angle" />
      </CircleWrapper>
      <InfoWrapper>
        {transaction ? (
          <Value>
            {amount} {symbol}
          </Value>
        ) : undefined}
        <Status>{transaction ? 'Processed' : 'Processing'}</Status>
        {transaction ? (
          <Details onClick={handleDetailsClick}>Transaction details</Details>
        ) : undefined}
      </InfoWrapper>
      <Button primary big full as={Link} to={`/wallet/${fromPubkey}`}>
        Go back to wallet
      </Button>
    </WrapperCard>
  );
};
