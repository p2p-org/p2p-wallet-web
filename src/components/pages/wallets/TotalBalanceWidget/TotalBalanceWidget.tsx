import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import TransakSDK from '@transak/transak-sdk';

import { TokenAccount } from 'api/token/TokenAccount';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { Widget } from 'components/common/Widget';
import { Button } from 'components/ui';
import { rateSelector } from 'store/selectors/rates';

import { DonutChart, DonutChartData } from '../DonutChart';

const CHART_SIZE = 110;

const WrapperWidget = styled(Widget)``;

const TotalWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 20px 20px 30px;
`;

const PriceWrapper = styled.div`
  font-weight: 600;
`;

const TotalText = styled.div`
  color: #000;
  font-size: 16px;
  line-height: 24px;
`;

const Price = styled.div`
  align-self: flex-end;
  margin: 24px 0 4px;

  color: #000;
  font-size: 32px;
  line-height: 120%;
`;

const AllTokensText = styled.div`
  color: #a3a5ba;
  font-size: 14px;
  line-height: 140%;
`;

const ChartWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${CHART_SIZE}px;
  height: ${CHART_SIZE}px;
`;

type Props = {
  onSymbolChange: (symbol: string) => void;
};

export const TotalBalanceWidget: FunctionComponent<Props> = ({ onSymbolChange }) => {
  const publicKey = useSelector((state) => state.wallet.publicKey);
  const tokenAccounts = useSelector((state) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const state = useSelector((currentState) => currentState);

  const totalBalance = useMemo(
    () =>
      // eslint-disable-next-line unicorn/no-reduce
      tokenAccounts.reduce((prev, tokenAccount) => {
        const rate = rateSelector(tokenAccount.mint.symbol)(state);
        if (rate) {
          return tokenAccount.mint
            .toMajorDenomination(tokenAccount.balance)
            .times(rate)
            .plus(prev)
            .toNumber();
        }

        // Same as USD
        if (tokenAccount.mint.symbol) {
          return tokenAccount.mint.toMajorDenomination(tokenAccount.balance).plus(prev).toNumber();
        }

        return prev;
      }, 0),
    [tokenAccounts, state.rate.markets],
  );

  const greeting = useMemo(() => {
    let dayTime = '';
    const data = [
      [22, 'night'],
      [18, 'evening'],
      [12, 'afternoon'],
      [5, 'morning'],
      [0, 'night'],
    ] as [number, string][];

    const hours = new Date().getHours();
    for (const [hour, message] of data) {
      if (hours >= hour) {
        dayTime = message;
        break;
      }
    }

    return `Good ${dayTime}!`;
  }, [new Date().getHours()]);

  const donutData = useMemo(() => {
    const data: DonutChartData = [];

    tokenAccounts.forEach((tokenAccount) => {
      if (!tokenAccount.mint.symbol || tokenAccount.balance.lte(0)) {
        return;
      }

      const rate = rateSelector(tokenAccount.mint.symbol)(state);
      if (!rate) {
        return;
      }

      const balance = tokenAccount.mint
        .toMajorDenomination(tokenAccount.balance)
        .times(rate)
        .toNumber();
      const balanceUSD = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(balance);

      data.push({
        symbol: tokenAccount.mint.symbol,
        amount: balance,
        amountUSD: balanceUSD,
        color: tokenAccount.mint.color,
      });
    });

    return data;
  }, [tokenAccounts]);

  const handleTopUpClick = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
    const transak = new TransakSDK({
      apiKey: process.env.REACT_APP_TRANSAK_API_KEY, // Your API Key
      environment: 'STAGING', // STAGING/PRODUCTION
      defaultCryptoCurrency: 'SOL',
      walletAddress: publicKey, // Your customer's wallet address
      themeColor: '5887FF', // App theme color
      fiatCurrency: '', // INR/GBP
      email: '', // Your customer's email address
      redirectURL: '',
      hostURL: window.location.origin,
      widgetHeight: '680px',
      widgetWidth: '500px',
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    transak.init();

    // To get all the events
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
    transak.on(transak.ALL_EVENTS, (data: any) => {
      console.log(data);
    });

    // This will trigger when the user marks payment is made.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData: any) => {
      console.log(orderData);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      transak.close();
    });
  };

  return (
    <WrapperWidget
      title={`${greeting} 👋`}
      action={
        process.env.REACT_APP_TRANSAK_API_KEY ? (
          <Button lightBlue onClick={handleTopUpClick}>
            Top up
          </Button>
        ) : undefined
      }>
      <TotalWrapper>
        <PriceWrapper>
          <TotalText>Total balance</TotalText>
          <Price>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              totalBalance,
            )}
          </Price>
          <AllTokensText>All tokens</AllTokensText>
        </PriceWrapper>
        <ChartWrapper>
          {tokenAccounts.length === 0 ? (
            <LoaderBlock />
          ) : (
            <DonutChart size={CHART_SIZE} data={donutData} onSymbolChange={onSymbolChange} />
          )}
        </ChartWrapper>
      </TotalWrapper>
    </WrapperWidget>
  );
};
