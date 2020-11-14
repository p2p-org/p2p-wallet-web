import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as web3 from '@solana/web3.js';
import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { TokenAvatar } from 'components/common/TokenAvatar';
import { Icon } from 'components/ui';
import { getOwnedTokenAccounts } from 'store/actions/solana';
import { RootState, TokenAccount } from 'store/types';
import { usePopulateTokenInfo } from 'utils/hooks/usePopulateTokenInfo';
import { shortAddress } from 'utils/tokens';

import { TokenRow } from './TokenRow';

const Wrapper = styled.div`
  position: relative;

  padding: 20px 32px 38px;
`;

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 17px;
`;

const FromTitle = styled.div``;

const AllBalance = styled.div`
  text-decoration: underline;

  cursor: pointer;
`;

const MainWrapper = styled.div`
  display: flex;

  margin-top: 20px;
`;

const TokenAvatarWrapper = styled.div``;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  margin-left: 20px;
`;

const SpecifyTokenWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
`;

const TokenWrapper = styled.div`
  display: flex;

  cursor: pointer;
`;

const TokenName = styled.div`
  max-width: 200px;

  color: #000;
  font-weight: 500;
  font-size: 22px;
  line-height: 26px;
  white-space: nowrap;
  text-overflow: ellipsis;

  overflow: hidden;
`;

const ChevronWrapper = styled.div``;

const ChevronIcon = styled(Icon)`
  width: 11px;
  height: 8px;
  margin-left: 16px;

  color: #000;
`;

const AmountInput = styled.input`
  color: #000;
  font-weight: 500;
  font-size: 28px;
  line-height: 33px;
  text-align: right;

  background: transparent;
  border: 0;

  outline: none;

  appearance: none;

  &::placeholder {
    color: #c2c2c2;
  }
`;

const BalanceWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;

  color: ${rgba('#000', 0.3)};
  font-size: 14px;
  line-height: 17px;
  letter-spacing: -0.3px;
`;

const BalanceText = styled.div``;

const DropDownListContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;

  margin-top: 17px;
  padding: 20px 0 17px;
  z-index: 1;

  background: #fefefe;
  box-shadow: 0px 12px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #efefef;
  border-radius: 0px 0px 10px 10px;
`;

const DropDownHeader = styled.div`
  padding: 0 32px;

  color: #000;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
`;

const DropDownList = styled.div`
  > :not(:last-child) {
    border-bottom: 1px solid ${rgba('#000', 0.05)};
  }
`;

type Props = {
  tokenPublicKey: string;
  tokenAmount: string;
  onTokenChange: (tokenPublicKey: string) => void;
  onAmountChange: (tokenAmount: string) => void;
};

export const FromSelectInput: FunctionComponent<Props> = ({
  tokenPublicKey,
  tokenAmount,
  onTokenChange,
  onAmountChange,
}) => {
  const dispatch = useDispatch();
  const selectorRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const balanceLamports = useSelector((state: RootState) => state.data.blockchain.balanceLamports);
  const order = useSelector((state: RootState) => state.entities.tokens.order);
  const entrypoint = useSelector((state: RootState) => state.data.blockchain.entrypoint);
  const publicKey = useSelector((state: RootState) =>
    state.data.blockchain.account?.publicKey.toBase58(),
  );

  const preparedOrder = useMemo(() => (publicKey ? [publicKey, ...order] : order), [
    publicKey,
    order,
  ]);

  const tokenAccount: TokenAccount = useSelector(
    (state: RootState) => state.entities.tokens.items[tokenPublicKey],
  );
  // eslint-disable-next-line prefer-const
  let { mint, amount } = tokenAccount?.parsed || { amount: 0 };
  const { name, symbol } = usePopulateTokenInfo({ mint: mint?.toBase58(), includeSol: true });

  if (!mint) {
    amount = balanceLamports / web3.LAMPORTS_PER_SOL;
  }

  useEffect(() => {
    dispatch(getOwnedTokenAccounts());
  }, [entrypoint]);

  const handleAwayClick = (e: MouseEvent) => {
    if (!selectorRef.current?.contains(e.target as HTMLDivElement)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleAwayClick);

    return () => {
      window.removeEventListener('click', handleAwayClick);
    };
  }, []);

  const handleSelectorClick = () => {
    if (!preparedOrder) {
      return;
    }

    setIsOpen(!isOpen);
  };

  const handleItemClick = (publicKey: string) => {
    setIsOpen(false);
    onTokenChange(publicKey);
  };

  const handleAllBalanceClick = () => {
    onAmountChange(String(amount));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    onAmountChange(value);
  };

  return (
    <Wrapper>
      <TopWrapper>
        <FromTitle>From</FromTitle>
        <AllBalance onClick={handleAllBalanceClick}>Use all balance</AllBalance>
      </TopWrapper>
      <MainWrapper>
        <TokenAvatarWrapper>
          <TokenAvatar mint={mint?.toBase58()} size={44} includeSol />
        </TokenAvatarWrapper>
        <InfoWrapper>
          <SpecifyTokenWrapper>
            <TokenWrapper ref={selectorRef} onClick={handleSelectorClick}>
              <TokenName title={tokenPublicKey}>
                {name || symbol || shortAddress(tokenPublicKey)}
              </TokenName>
              <ChevronWrapper>
                <ChevronIcon name="arrow-triangle" />
              </ChevronWrapper>
            </TokenWrapper>
            <AmountInput placeholder="0" value={tokenAmount} onChange={handleAmountChange} />
          </SpecifyTokenWrapper>
          <BalanceWrapper>
            <BalanceText>
              Balance = {amount} {symbol}
            </BalanceText>
            <BalanceText> = $0.30</BalanceText>
          </BalanceWrapper>
        </InfoWrapper>
      </MainWrapper>
      {isOpen ? (
        <DropDownListContainer>
          <DropDownHeader>Your wallets</DropDownHeader>
          <DropDownList>
            {preparedOrder.map((publicKey) => (
              <TokenRow key={publicKey} publicKey={publicKey} onClick={handleItemClick} />
            ))}
          </DropDownList>
        </DropDownListContainer>
      ) : undefined}
    </Wrapper>
  );
};
