import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import classNames from 'classnames';
import throttle from 'lodash.throttle';

import { TokenAccount } from 'api/token/TokenAccount';
import { AmountUSD } from 'components/common/AmountUSD';
import { COLUMN_RIGHT_WIDTH } from 'components/common/Layout/constants';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Widget } from 'components/common/Widget';
import { Button, Icon } from 'components/ui';
import { rateSelector } from 'store/selectors/rates';
import { getRatesCandle } from 'store/slices/rate/RateSlice';
import { airdrop } from 'store/slices/wallet/WalletSlice';
import { shortAddress } from 'utils/tokens';

import { Chart } from './Chart';

const WrapperWidget = styled(Widget)``;

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
  publicKey: PublicKey;
};

export const TopWidget: FunctionComponent<Props> = ({ publicKey }) => {
  const dispatch = useDispatch();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowFixed, setIsShowFixed] = useState(false);
  const type = useSelector((state) => state.rate.candlesType);
  const cluster = useSelector((state) => state.wallet.cluster);
  const tokenAccounts = useSelector((state) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const tokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.equals(publicKey)),
    [tokenAccounts, publicKey],
  );
  const rate = useSelector(rateSelector(tokenAccount?.mint.symbol));
  const rates = useSelector((state) =>
    tokenAccount?.mint.symbol ? state.rate.candles[tokenAccount?.mint.symbol] : undefined,
  );
  const isMainnet = cluster === 'mainnet-beta';

  useEffect(() => {
    const loadCandles = async () => {
      if (isLoading || !tokenAccount?.mint.symbol || rates) {
        return;
      }

      setIsLoading(true);
      await dispatch(getRatesCandle({ symbol: tokenAccount.mint.symbol, type: 'month' }));
      setIsLoading(false);
    };

    void loadCandles();
  }, [tokenAccount?.mint.symbol]);

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
  }, []);

  const delta = useMemo(() => {
    if (!rates || rates.length === 0) {
      return null;
    }

    const diff = rates[rates.length - 1].price - rates[rates.length - 2].price;
    const sum = rates[rates.length - 1].price + rates[rates.length - 2].price;
    const percentage = 100 * (diff / (sum / 2));

    return { diff, percentage };
  }, [rates]);

  const handleAirdropClick = () => {
    void dispatch(airdrop());
  };

  const renderButtons = () => {
    return (
      <Buttons>
        {/* <Link to={`/send/${publicKey.toBase58()}`} className="button"> */}
        {/*  <ButtonStyled primary small> */}
        {/*    <PlusIcon name="plus" /> */}
        {/*  </ButtonStyled> */}
        {/* </Link> */}
        <Link to={`/send/${publicKey.toBase58()}`} title="Send" className="button">
          <ButtonStyled primary small>
            <PlusIcon name="top" />
          </ButtonStyled>
        </Link>
        <Link to={`/swap/${publicKey.toBase58()}`} title="Swap" className="button">
          <ButtonStyled primary small>
            <PlusIcon name="swap" />
          </ButtonStyled>
        </Link>
        {!isMainnet && tokenAccount?.mint.symbol === 'SOL' ? (
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
    switch (type) {
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
        {rate ? (
          <ValueCurrency className={classNames({ isSticky })}>
            <AmountUSD
              value={tokenAccount.mint.toMajorDenomination(tokenAccount.balance)}
              symbol={tokenAccount.mint.symbol}
            />
          </ValueCurrency>
        ) : undefined}
        <BottomWrapper className={classNames({ isSticky })}>
          <ValueOriginal>
            {tokenAccount.mint.toMajorDenomination(tokenAccount.balance).toString()}{' '}
            {tokenAccount.mint.symbol}
          </ValueOriginal>
          {renderDelta(isSticky)}
        </BottomWrapper>
      </PriceWrapped>
    );
  };

  return (
    <>
      <WrapperWidget
        ref={widgetRef}
        title={
          tokenAccount ? (
            <Header>
              <TokenAvatar symbol={tokenAccount?.mint.symbol} size="44" />
              <TokenInfo>
                <TokenSymbol>{tokenAccount?.mint.symbol}</TokenSymbol>
                <TokenName title={tokenAccount.address.toBase58()}>
                  {tokenAccount?.mint.name || shortAddress(tokenAccount.address.toBase58())}
                </TokenName>
              </TokenInfo>
              {tokenAccount?.mint.address.equals(SystemProgram.programId) ? undefined : (
                <TokenSettings>
                  <Link
                    to={`/wallet/${publicKey.toBase58()}/settings`}
                    title="Settings"
                    className="button">
                    <TokenSettingsButton small>
                      <TokenSettingsIcon name="gear" />
                    </TokenSettingsButton>
                  </Link>
                </TokenSettings>
              )}
            </Header>
          ) : undefined
        }
        action={renderButtons()}>
        {renderContent()}
        {tokenAccount ? <Chart publicKey={tokenAccount.address} /> : undefined}
      </WrapperWidget>
      {isShowFixed ? (
        <WrapperFixed>
          <FixedInfoWrapper>
            <TokenAvatar symbol={tokenAccount?.mint.symbol} size={36} />
            {renderContent(true)}
          </FixedInfoWrapper>
          {renderButtons()}
        </WrapperFixed>
      ) : undefined}
    </>
  );
};
