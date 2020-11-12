import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from 'linaria/react';

import { Card } from 'components/common/Card';
import { NetworkSelect } from 'components/common/NetworkSelect';
import { SlideContainer } from 'components/common/SlideContainer';
import { Send } from 'components/pages/dashboard_old/Send';
import { TransactionsList } from 'components/pages/dashboard_old/TransactionsList';
import { establishConnection } from 'store/actions/complex';
import { getMyBalance, requestAirdrop } from 'store/actions/solana';
import { RootState } from 'store/types';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 48px 0;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
`;

const Top = styled.div`
  display: flex;

  & > *:not(:last-child) {
    margin-right: 24px;
  }
`;

const Title = styled.h2`
  white-space: nowrap;
`;

const Middle = styled.div`
  margin-top: 32px;
`;

const Bottom = styled.div`
  margin-top: 32px;
`;

export const DashboardOld: FunctionComponent = () => {
  const dispatch = useDispatch();
  const publicKey = useSelector((state: RootState) => state.data.blockchain.account?.publicKey);
  const balance = useSelector((state: RootState) => state.data.blockchain.balance);
  const balanceStatus = useSelector((state: RootState) => state.data.blockchain.balanceStatus);
  const airdropStatus = useSelector((state: RootState) => state.data.blockchain.airdropStatus);

  useEffect(() => {
    const init = async () => {
      await dispatch(establishConnection());
      dispatch(getMyBalance());
    };

    void init();
  }, []);

  const handleBalanceClick = () => {
    dispatch(getMyBalance());
  };

  const handleAirdropClick = () => {
    dispatch(requestAirdrop());
  };

  return (
    <Wrapper>
      <Header>
        <NetworkSelect />
      </Header>
      <Main>
        <Top>
          <Card>
            <Title>Your Address</Title>
            <div>{String(publicKey)}</div>
          </Card>
          <Card>
            <Title>Your Balance</Title>
            <div>{balanceStatus === 'pending' ? 'updating...' : Number(balance)}</div>
          </Card>
          <Card>
            <button
              type="button"
              disabled={balanceStatus === 'pending'}
              onClick={handleBalanceClick}>
              Update balance
            </button>
            <button
              type="button"
              disabled={airdropStatus === 'pending'}
              onClick={handleAirdropClick}>
              Airdrop
            </button>
          </Card>
        </Top>
        <Middle>
          <Card>
            <Send />
          </Card>
        </Middle>
        <Bottom>
          <Card>
            <SlideContainer>
              <TransactionsList />
            </SlideContainer>
          </Card>
        </Bottom>
      </Main>
    </Wrapper>
  );
};
