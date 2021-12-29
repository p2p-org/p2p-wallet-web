import type { FunctionComponent } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { ModalType, useModals } from 'app/contexts/general/modals';
import bgImg from 'assets/images/sun.png';
import { Card } from 'components/common/Card';
import { Icon } from 'components/ui';

const WrapperCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
`;

const HeaderImage = styled.div`
  width: 175px;
  height: 183px;
  margin-bottom: 32px;

  background-image: url(${bgImg});
  background-repeat: no-repeat;
  background-size: 183px 175px;
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

const BottomIcon = styled(Icon)`
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
  color: #000;
  font-weight: 500;
  font-size: 28px;
  line-height: 33px;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
  margin: 12px 0;
  padding: 0 16px;

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

export const ResultWidget: FunctionComponent = () => {
  const { state: locationState } = useLocation<{ signature: string }>();
  const { openModal } = useModals();
  // const transaction = useSelector(
  //   (state: RootState) =>
  //     state.transaction.items[locationState.signature] &&
  //     Transaction.from(state.transaction.items[locationState.signature]),
  // );

  useEffect(() => {
    const mount = async () => {
      // const trx = unwrapResult(await dispatch(getTransaction(locationState.signature)));
      // if (!trx) {
      //   setTimeout(mount, 3000);
      // }
    };

    if (locationState.signature) {
      void mount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDetailsClick = () => {
    openModal(ModalType.SHOW_MODAL_TRANSACTION_DETAILS, { signature: locationState?.signature });
  };

  return (
    <WrapperCard>
      <HeaderImage />
      <CircleWrapper>
        <BottomIcon name="bottom" />
      </CircleWrapper>
      {/*<InfoWrapper>*/}
      {/*  {transaction ? (*/}
      {/*    <Value>*/}
      {/*      {transaction.short.destinationAmount.toNumber()}{' '}*/}
      {/*      {transaction.short.sourceTokenAccount?.mint.symbol}*/}
      {/*    </Value>*/}
      {/*  ) : undefined}*/}
      {/*  <Status>{transaction ? 'Processed' : 'Processing'}</Status>*/}
      {/*  {transaction ? (*/}
      {/*    <Details onClick={handleDetailsClick}>Transaction details</Details>*/}
      {/*  ) : undefined}*/}
      {/*</InfoWrapper>*/}
      {/*{transaction?.short.source ? (*/}
      {/*  <Link to={`/wallet/${transaction.short.source.toBase58()}`} className="button">*/}
      {/*    <Button primary big full>*/}
      {/*      Go back to wallet*/}
      {/*    </Button>*/}
      {/*  </Link>*/}
      {/*) : undefined}*/}
    </WrapperCard>
  );
};
