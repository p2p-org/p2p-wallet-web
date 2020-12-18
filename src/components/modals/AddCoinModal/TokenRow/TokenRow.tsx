import React, { FunctionComponent, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { styled } from '@linaria/react';
import * as web3 from '@solana/web3.js';
import classNames from 'classnames';
import { rgba } from 'polished';

import { Token } from 'api/token/Token';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Avatar, Button, Icon, Input } from 'components/ui';
import { TokenType } from 'constants/tokens';
import { createAccountForToken } from 'store/slices/wallet/WalletSlice';

const Wrapper = styled.div`
  display: flex;
  padding: 15px 30px;

  border-bottom: 1px solid ${rgba('#000', 0.05)};

  &:last-child {
    border-bottom: none;
  }
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 44px;
  margin-right: 12px;

  &.opened {
    transform: rotate(180deg);
  }
`;

const ChevronIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  color: ${rgba('#000', 0.4)};
`;

const Main = styled.div`
  flex: 1;
`;

const Content = styled.div`
  display: flex;
  align-items: center;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex: 1;
  margin-right: 48px;

  cursor: pointer;
`;

const Info = styled.div`
  flex: 1;
  margin-left: 20px;

  font-size: 14px;
  line-height: 17px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: #000;
  font-weight: 500;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 17px;
`;

const Additional = styled.div`
  display: none;
  margin-top: 20px;

  &.opened {
    display: block;
  }
`;

const CopyWrapper = styled.div`
  cursor: pointer;
`;

const CopyIcon = styled(Icon)`
  width: 24px;
  height: 24px;
`;

type Props = {
  token: Token;
  closeModal: () => void;
};

export const TokenRow: FunctionComponent<Props> = ({ token, closeModal }) => {
  const dispatch = useDispatch();
  // eslint-disable-next-line unicorn/no-null
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleChevronClick = () => {
    setIsOpen(!isOpen);
  };

  const handleAddClick = async () => {
    await dispatch(createAccountForToken({ token }));
    // dispatch(getOwnedTokenAccounts());
    closeModal();
  };

  const handleCopyClick = () => {
    const input = inputRef.current;

    if (input) {
      input.focus();
      input.setSelectionRange(0, input.value.length);
      document.execCommand('copy');
    }
  };

  return (
    <Wrapper>
      <ChevronWrapper onClick={handleChevronClick} className={classNames({ opened: isOpen })}>
        <ChevronIcon name="chevron" />
      </ChevronWrapper>
      <Main>
        <Content>
          <InfoWrapper onClick={handleChevronClick}>
            <TokenAvatar symbol={token.symbol} size={44} />
            <Info>
              <Top>
                <div>{token.symbol}</div> <div />
              </Top>
              <Bottom>
                <div>{token.name}</div> <div />
              </Bottom>
            </Info>
          </InfoWrapper>
          <Button primary small onClick={handleAddClick}>
            Add
          </Button>
        </Content>
        <Additional className={classNames({ opened: isOpen })}>
          <Input
            ref={inputRef}
            title={`${token.symbol} Mint Address`}
            value={token.address.toBase58()}
            readOnly
            postfix={
              <CopyWrapper onClick={handleCopyClick}>
                <CopyIcon name="copy" />
              </CopyWrapper>
            }
          />
        </Additional>
      </Main>
    </Wrapper>
  );
};
