import React, { FunctionComponent, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { rgba } from 'polished';

import { Token } from 'api/token/Token';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Button, Icon, Input } from 'components/ui';
import { createAccountForToken } from 'store/slices/wallet/WalletSlice';

const Wrapper = styled.div`
  display: flex;

  padding-top: 10px;
`;

const ChevronWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  color: #a3a5ba;

  background: #f6f6f8;
  border-radius: 8px;
  transform: rotate(270deg);

  &.opened {
    background: #a3a5ba;
    transform: rotate(0deg);

    & svg {
      color: #fff;
    }
  }
`;

const ChevronIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  color: ${rgba('#000', 0.4)};
`;

const Main = styled.div`
  flex: 1;

  padding: 0 30px;

  &.opened {
    background: ${rgba('#f6f6f8', 0.5)};
  }
`;

const Content = styled.div`
  display: flex;
  align-items: center;

  padding: 10px 0;

  &.opened {
    padding-bottom: 20px;

    border-bottom: 1px dashed ${rgba('#000', 0.05)};
  }
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

  color: #202020;
  font-weight: 600;
  font-size: 18px;
  line-height: 27px;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 16px;
`;

const Additional = styled.div`
  display: none;

  margin-top: 15px;

  &.opened {
    display: flex;
    align-items: center;

    padding-bottom: 15px;

    border-bottom: 1px dashed ${rgba('#000', 0.05)};
  }

  & label {
    flex: 1;

    height: 44px;

    padding: 0;

    background: inherit;

    & div {
      font-size: 14px;
      line-height: 16px;
    }

    & input {
      font-weight: 600;
      font-size: 13px;
      line-height: 16px;
    }
  }

  & button {
    height: 44px;
  }
`;

const PlusIconWrapper = styled.div`
  padding-right: 5px;
`;

const PlusIcon = styled(Icon)`
  width: 24px;
`;

const BottomInfo = styled.div`
  display: none;

  font-weight: 600;
  font-size: 14px;

  &.opened {
    display: flex;

    padding: 15px 0;
  }

  &.error {
    justify-content: center;
  }
`;

const LeftInfo = styled.div`
  flex: 1;

  color: #a3a5ba;
`;

const RightInfo = styled.div`
  color: #5887ff;

  &.error {
    color: #f43f3d;
  }
`;

const Error = styled.div`
  color: #f43f3d;
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
    // dispatch(getTokenAccounts());
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

  // TODO
  const isError = false;

  return (
    <Wrapper>
      <Main className={classNames({ opened: isOpen })}>
        <Content className={classNames({ opened: isOpen })}>
          <InfoWrapper onClick={handleChevronClick}>
            <TokenAvatar symbol={token.symbol} size={45} />
            <Info>
              <Top>
                <div>{token.symbol}</div> <div />
              </Top>
              <Bottom>
                <div>{token.name}</div> <div />
              </Bottom>
            </Info>
          </InfoWrapper>
          <ChevronWrapper onClick={handleChevronClick} className={classNames({ opened: isOpen })}>
            <ChevronIcon name="chevron" />
          </ChevronWrapper>
        </Content>
        <Additional className={classNames({ opened: isOpen })}>
          <Input
            ref={inputRef}
            title={`${token.symbol} Mint Address`}
            value={token.address.toBase58()}
            readOnly
          />
          <Button primary onClick={handleAddClick}>
            <PlusIconWrapper>
              <PlusIcon name="plus" />
            </PlusIconWrapper>
            Add token
          </Button>
        </Additional>
        <BottomInfo className={classNames({ opened: isOpen, error: isError })}>
          {isError ? (
            <Error>Something went wrong. We couldn’t add a token to your list.</Error>
          ) : (
            <>
              <LeftInfo>View in Solana explorer</LeftInfo>
              <RightInfo>will cost 0.002039 SOL</RightInfo>
            </>
          )}
        </BottomInfo>
      </Main>
    </Wrapper>
  );
};
