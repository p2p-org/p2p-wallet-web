import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';
import { Decimal } from 'decimal.js';

import { TokenAccount } from 'api/token/TokenAccount';
import { AmountUSDT } from 'components/common/AmountUSDT';
import { Widget } from 'components/common/Widget';
import { Button, Icon } from 'components/ui';
import { RootState } from 'store/rootReducer';
import { getRatesCandle } from 'store/slices/rate/RateSlice';
import { airdrop } from 'store/slices/wallet/WalletSlice';

import { TokenSelector } from './TokenSelector';

const WrapperWidget = styled(Widget)``;

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
`;

const ValueCurrency = styled.div`
  color: #000;
  font-weight: bold;
  font-size: 22px;
  line-height: 120%;
`;

const ValueDelta = styled.div`
  display: flex;
  margin-top: 4px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
`;

// const ValueGreen = styled.div`
//   margin-left: 20px;
//
//   color: #2db533;
// `;

type Props = {
  publicKey: PublicKey;
};

export const TopWidget: FunctionComponent<Props> = ({ publicKey }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const cluster = useSelector((state: RootState) => state.wallet.cluster);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const tokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.equals(publicKey)),
    [tokenAccounts, publicKey],
  );
  const rate = useSelector(
    (state: RootState) => state.rate.markets[`${tokenAccount?.mint.symbol}/USDT`],
  );
  const rates = useSelector(
    (state: RootState) => state.rate.candles[`${tokenAccount?.mint.symbol}/USDT`],
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

  const delta = useMemo(() => {
    if (!rates || rates.length === 0) {
      return null;
    }

    const diff = rates[rates.length - 1].price - rates[rates.length - 2].price;
    const sum = rates[rates.length - 1].price + rates[rates.length - 2].price;
    const percentage = 100 * (diff / (sum / 2));

    return { diff, percentage };
  }, [rates]);

  const handleTokenChange = (token: string) => {
    history.push(`/wallet/${token}`);
  };

  const handleAirdropClick = () => {
    void dispatch(airdrop());
  };

  return (
    <WrapperWidget
      title={<TokenSelector value={publicKey.toBase58()} onChange={handleTokenChange} />}
      action={
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
      }>
      {tokenAccount && (rate || delta) ? (
        <PriceWrapped>
          {rate ? (
            <ValueCurrency>
              <AmountUSDT
                value={new Decimal(tokenAccount.mint.toMajorDenomination(tokenAccount.balance))}
                symbol={tokenAccount.mint.symbol}
              />
            </ValueCurrency>
          ) : undefined}
          {delta ? (
            <ValueDelta>
              {delta.diff.toFixed(2)} USD ({delta.percentage.toFixed(2)}%) 24 hrs{' '}
              {/* <ValueGreen>+1.4%, 24 hours</ValueGreen> */}
            </ValueDelta>
          ) : undefined}
        </PriceWrapped>
      ) : undefined}
    </WrapperWidget>
  );
};
