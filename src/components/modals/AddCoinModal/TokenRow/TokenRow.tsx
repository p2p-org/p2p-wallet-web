import React, { FunctionComponent, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as web3 from '@solana/web3.js';
import classNames from 'classnames';
import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { TokenAvatar } from 'components/common/TokenAvatar';
import { Avatar, Button, Icon, Input } from 'components/ui';
import { TokenType } from 'constants/tokens';
import { createTokenAccount } from 'store/actions/complex/tokens';
import { getOwnedTokenAccounts } from 'store/actions/solana';

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

type Props = TokenType & { closeModal: () => void };

export const TokenRow: FunctionComponent<Props> = ({
  mintAddress,
  tokenName,
  tokenSymbol,
  icon,
  closeModal,
}) => {
  const dispatch = useDispatch();
  // eslint-disable-next-line unicorn/no-null
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleChevronClick = () => {
    setIsOpen(!isOpen);
  };

  const handleAddClick = () => {
    const mint = new web3.PublicKey(mintAddress);
    dispatch(createTokenAccount(mint));
    dispatch(getOwnedTokenAccounts());
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
            <TokenAvatar src={icon} size={44} />
            <Info>
              <Top>
                <div>{tokenSymbol}</div> <div />
              </Top>
              <Bottom>
                <div>{tokenName}</div> <div />
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
            title={`${tokenSymbol} Mint Address`}
            value={mintAddress}
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
