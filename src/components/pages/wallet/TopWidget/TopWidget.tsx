import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import classNames from 'classnames';
import { Decimal } from 'decimal.js';
import throttle from 'lodash.throttle';

import { TokenAccount } from 'api/token/TokenAccount';
import { AmountUSD } from 'components/common/AmountUSD';
import { COLUMN_RIGHT_WIDTH } from 'components/common/Layout/constants';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Widget } from 'components/common/Widget';
import { Button, Icon } from 'components/ui';
import { RootState } from 'store/rootReducer';
import { rateSelector } from 'store/selectors/rates';
import { getRatesCandle } from 'store/slices/rate/RateSlice';
import { airdrop } from 'store/slices/wallet/WalletSlice';
import { shortAddress } from 'utils/tokens';

const WrapperWidget = styled(Widget)``;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
`;

const TokenName = styled.div`
  max-width: 230px;
  margin-left: 16px;
  overflow: hidden;

  color: #000;
  font-weight: 600;
  font-size: 20px;
  line-height: 120%;
  white-space: nowrap;

  text-overflow: ellipsis;
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
  const cluster = useSelector((state: RootState) => state.wallet.cluster);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const tokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.equals(publicKey)),
    [tokenAccounts, publicKey],
  );
  const rate = useSelector(rateSelector(tokenAccount?.mint.symbol));
  const rates = useSelector(
    (state: RootState) => state.rate.candles[`${tokenAccount?.mint.symbol}/USD`],
  );
  const isMainnet = cluster === 'mainnet-beta';

  useEffect(() => {
    const loadCandles = async () => {
      if (isLoading || !tokenAccount?.mint.symbol || rates) {
        return;
      }

      setIsLoading(true);
      await dispatch(getRatesCandle(tokenAccount.mint.symbol));
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

  const renderContent = (isSticky?: boolean) => {
    if (!tokenAccount) {
      return;
    }

    return (
      <PriceWrapped className={classNames({ isSticky })}>
        {rate ? (
          <ValueCurrency className={classNames({ isSticky })}>
            <AmountUSD
              value={new Decimal(tokenAccount.mint.toMajorDenomination(tokenAccount.balance))}
              symbol={tokenAccount.mint.symbol}
            />
          </ValueCurrency>
        ) : undefined}
        <BottomWrapper className={classNames({ isSticky })}>
          <ValueOriginal>
            {tokenAccount.mint.toMajorDenomination(tokenAccount.balance)} {tokenAccount.mint.symbol}
          </ValueOriginal>
          {delta ? (
            <ValueDelta>
              {delta.diff.toFixed(2)} USD ({delta.percentage.toFixed(2)}%) 24 hrs{' '}
              {/* <ValueGreen>+1.4%, 24 hours</ValueGreen> */}
            </ValueDelta>
          ) : undefined}
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
            <TokenInfo>
              <TokenAvatar symbol={tokenAccount?.mint.symbol} size="36" />
              <TokenName title={tokenAccount.address.toBase58()}>
                {tokenAccount?.mint.name || shortAddress(tokenAccount.address.toBase58())} wallet
              </TokenName>
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
            </TokenInfo>
          ) : undefined
        }
        action={renderButtons()}>
        {renderContent()}
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
