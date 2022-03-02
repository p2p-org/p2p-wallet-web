import type { FunctionComponent } from 'react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import {
  SYSTEM_PROGRAM_ID,
  useConnectionContext,
  useSolana,
  useTokenAccount,
} from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import classNames from 'classnames';
import throttle from 'lodash.throttle';

import { useMarketData, useRates } from 'app/contexts';
import { useConfig } from 'app/contexts/solana/swap';
import { AmountUSD } from 'components/common/AmountUSD';
import { COLUMN_RIGHT_WIDTH } from 'components/common/Layout/constants';
import { ToastManager } from 'components/common/ToastManager';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Widget } from 'components/common/Widget';
import { Button, Icon } from 'components/ui';
import { shortAddress } from 'utils/tokens';

import { Chart } from './Chart';

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const TokenInfo = styled.div`
  max-width: 230px;
  margin-left: 16px;
  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
`;

const TokenSymbol = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
`;

const TokenName = styled.div`
  margin-top: 4px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

const Buttons = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 16px;
`;

const ButtonStyled = styled(Button)`
  width: 36px;
  padding: 0;

  box-shadow: 0 4px 12px rgba(88, 135, 255, 0.25);
`;

const PlusIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #fff;
`;

const PriceWrapped = styled.div`
  padding: 16px 20px;

  &.isSticky {
    padding: 0 16px;
  }
`;

const ValueCurrency = styled.div`
  color: #000;
  font-weight: bold;
  font-size: 22px;
  line-height: 120%;

  &.isSticky {
    font-weight: bold;
    font-size: 16px;
    line-height: 120%;
  }
`;

const BottomWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  &:not(:first-child) {
    margin-top: 4px;
  }

  &.isSticky {
    margin-top: 0;

    font-weight: 600;
    font-size: 14px;
    line-height: 120%;
  }
`;

const ValueOriginal = styled.div``;

const ValueDelta = styled.div`
  display: flex;
`;

// const ValueGreen = styled.div`
//   margin-left: 20px;
//
//   color: #2db533;
// `;

const WrapperFixed = styled.div`
  position: fixed;
  top: 64px;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: ${COLUMN_RIGHT_WIDTH}px;
  height: 72px;
  padding: 0 20px;

  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
`;

const FixedInfoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const TokenSettings = styled.div`
  margin-left: 10px;
`;

const TokenSettingsButton = styled(Button)`
  width: 36px;
  padding: 0;
`;

const TokenSettingsIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #a3a5ba;
`;

type Props = {
  publicKey: string;
};

const TopWidgetOrigin: FunctionComponent<Props> = ({ publicKey }) => {
  const location = useLocation();
  const { tokenConfigs } = useConfig();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowFixed, setIsShowFixed] = useState(false);
  const { providerMut } = useSolana();

  const { network } = useConnectionContext();
  const tokenAccount = useTokenAccount(usePubkey(publicKey));
  const { candlesType, candles, getRatesCandle } = useRates();
  const rate = useMarketData(tokenAccount?.balance?.token.symbol);
  const rates = tokenAccount?.balance?.token.symbol
    ? candles[tokenAccount.balance.token.symbol]
    : null;
  const isMainnet = network === 'mainnet-beta';

  useEffect(() => {
    const loadCandles = async () => {
      if (isLoading || !tokenAccount?.balance?.token.symbol || rates) {
        return;
      }

      try {
        setIsLoading(true);

        await getRatesCandle(tokenAccount.balance.token.symbol, 'month');
      } catch (err) {
        ToastManager.error((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCandles();
  }, [getRatesCandle, isLoading, rates, tokenAccount?.balance?.token.symbol]);

  const handleScroll = throttle(() => {
    if (!widgetRef.current) {
      return;
    }

    const { bottom } = widgetRef.current.getBoundingClientRect();

    if (bottom <= 150) {
      setIsShowFixed(true);
    } else {
      setIsShowFixed(false);
    }
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const delta = useMemo(() => {
    if (!rates || rates.length === 0) {
      return null;
    }

    const diff = rates[rates.length - 1]!.price - rates[rates.length - 2]!.price;
    const sum = rates[rates.length - 1]!.price + rates[rates.length - 2]!.price;
    const percentage = 100 * (diff / (sum / 2));

    return { diff, percentage };
  }, [rates]);

  const handleAirdropClick = () => {
    void providerMut?.requestAirdrop(LAMPORTS_PER_SOL);
  };

  const renderButtons = () => {
    return (
      <Buttons>
        {/* <Link to={`/send/${publicKey.toBase58()}`} className="button"> */}
        {/*  <ButtonStyled primary small> */}
        {/*    <PlusIcon name="plus" /> */}
        {/*  </ButtonStyled> */}
        {/* </Link> */}
        <Link
          to={{ pathname: `/send/${publicKey}`, state: { fromPage: location.pathname } }}
          title="Send"
          className="button"
        >
          <ButtonStyled primary small>
            <PlusIcon name="top" />
          </ButtonStyled>
        </Link>
        {tokenAccount?.balance?.token.symbol && tokenConfigs[tokenAccount?.balance.token.symbol] ? (
          <Link
            to={{
              pathname: `/swap/${tokenAccount.balance.token.symbol}`,
              state: { fromPage: location.pathname },
            }}
            title="Swap"
            className="button"
          >
            <ButtonStyled primary small>
              <PlusIcon name="swap" />
            </ButtonStyled>
          </Link>
        ) : undefined}
        {!isMainnet && tokenAccount?.balance?.token.symbol === 'SOL' ? (
          <ButtonStyled primary small title="Airdrop" onClick={handleAirdropClick}>
            <PlusIcon name="plug" />
          </ButtonStyled>
        ) : undefined}
      </Buttons>
    );
  };

  const renderDelta = (isSticky?: boolean) => {
    if (isSticky || !delta) {
      return null;
    }

    let period = '';

    // eslint-disable-next-line default-case
    switch (candlesType) {
      case 'last1h':
      case 'last4h':
        period = '1 minute';
        break;
      case 'day':
        period = '1 hour';
        break;
      case 'week':
      case 'month':
        period = '24 hrs';
        break;
    }

    return (
      <ValueDelta>
        {delta.diff.toFixed(2)} USD ({delta.percentage.toFixed(2)}%) {period}
      </ValueDelta>
    );
  };

  const renderContent = (isSticky?: boolean) => {
    if (!tokenAccount) {
      return;
    }

    return (
      <PriceWrapped className={classNames({ isSticky })}>
        {rate && tokenAccount.balance ? (
          <ValueCurrency className={classNames({ isSticky })}>
            <AmountUSD value={tokenAccount.balance} />
          </ValueCurrency>
        ) : undefined}
        <BottomWrapper className={classNames({ isSticky })}>
          <ValueOriginal>{tokenAccount.balance?.formatUnits()}</ValueOriginal>
          {renderDelta(isSticky)}
        </BottomWrapper>
      </PriceWrapped>
    );
  };

  return (
    <>
      <Widget
        ref={widgetRef}
        title={
          tokenAccount?.key && tokenAccount?.balance ? (
            <Header>
              <TokenAvatar
                symbol={tokenAccount.balance?.token.symbol}
                address={tokenAccount.balance?.token?.address}
                size="44"
              />
              <TokenInfo>
                <TokenSymbol>{tokenAccount.balance?.token.symbol}</TokenSymbol>
                <TokenName title={tokenAccount.key.toBase58()}>
                  {tokenAccount.balance?.token.name || shortAddress(tokenAccount.key.toBase58())}
                </TokenName>
              </TokenInfo>
              {tokenAccount.balance?.token?.mintAccount.equals(SYSTEM_PROGRAM_ID) ? undefined : (
                <TokenSettings>
                  <Link
                    to={{
                      pathname: `/wallet/${publicKey}/settings`,
                      state: { fromPage: location.pathname },
                    }}
                    title="Settings"
                    className="button"
                  >
                    <TokenSettingsButton small>
                      <TokenSettingsIcon name="gear" />
                    </TokenSettingsButton>
                  </Link>
                </TokenSettings>
              )}
            </Header>
          ) : undefined
        }
        action={renderButtons()}
      >
        {renderContent()}
        {tokenAccount?.key ? <Chart publicKey={tokenAccount.key} /> : undefined}
      </Widget>
      {isShowFixed ? (
        <WrapperFixed>
          <FixedInfoWrapper>
            <TokenAvatar
              symbol={tokenAccount?.balance?.token.symbol}
              address={tokenAccount?.balance?.token.address}
              size={36}
            />
            {renderContent(true)}
          </FixedInfoWrapper>
          {renderButtons()}
        </WrapperFixed>
      ) : undefined}
    </>
  );
};

export const TopWidget = memo(TopWidgetOrigin);
