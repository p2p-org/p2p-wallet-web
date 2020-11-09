import React, { FunctionComponent, MutableRefObject, Ref, useRef, useState } from 'react';

import classNames from 'classnames';
import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { Button, Icon, Input } from 'components/ui';

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

  cursor: pointer;
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

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  margin-right: 20px;

  background: #dadada;
  border-radius: 50%;
`;

const Info = styled.div`
  flex: 1;

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

type Props = {};

export const TokenItem: FunctionComponent<Props> = ({ symbol, name, price, delta }) => {
  // eslint-disable-next-line unicorn/no-null
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleChevronClick = () => {
    setIsOpen(!isOpen);
  };

  const handleCopyClick = () => {
    const input = inputRef.current;

    input.focus();
    input.setSelectionRange(0, input.value.length);
    document.execCommand('copy');
  };

  return (
    <Wrapper>
      <ChevronWrapper onClick={handleChevronClick} className={classNames({ opened: isOpen })}>
        <ChevronIcon name="chevron" />
      </ChevronWrapper>
      <Main>
        <Content>
          <InfoWrapper onClick={handleChevronClick}>
            <Avatar />
            <Info>
              <Top>
                <div>{symbol}</div> <div>{price}</div>
              </Top>
              <Bottom>
                <div>{name}</div> <div>{delta}</div>
              </Bottom>
            </Info>
          </InfoWrapper>
          <Button secondary small>
            Add
          </Button>
        </Content>
        <Additional className={classNames({ opened: isOpen })}>
          <Input
            ref={inputRef}
            title="SRM Mint Address"
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
