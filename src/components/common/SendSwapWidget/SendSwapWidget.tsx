import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { Card } from 'components/common/Card';
import { Button, Icon } from 'components/ui';

import { FromToSelectInput } from './FromToSelectInput';
import { ToAddressInput } from './ToAddressInput';

const Wrapper = styled.div``;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const BackWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;

  background: #fcfcfc;
  border: 1px solid ${rgba('#000', 0.1)};
  border-radius: 10px;
  cursor: pointer;
`;

const BackIcon = styled(Icon)`
  width: 15px;
  height: 15px;

  color: #000;

  transform: rotate(90deg);
`;

const Title = styled.div`
  margin-left: 20px;

  color: #000;

  font-weight: 500;
  font-size: 22px;
  line-height: 120%;
`;

const WrapperCard = styled(Card)`
  margin-top: 20px;
  padding: 0;
`;

const FromWrapper = styled.div`
  border-bottom: 1px solid ${rgba('#000', 0.1)};
`;

const ToWrapper = styled.div`
  padding: 16px 32px 32px;

  border-bottom: 1px solid ${rgba('#000', 0.1)};
`;

const ToSelect = styled.div`
  display: flex;
  margin-bottom: 32px;

  > :not(:last-child) {
    margin-right: 10px;
  }
`;

const ToOption = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 20px;

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 17px;

  background: #fafafa;
  border-radius: 10px;

  &.active {
    color: #000;

    background: #e6e6e6;
  }
`;

const ActionWrapper = styled.div`
  padding: 32px;
`;

const Hint = styled.div`
  margin-top: 24px;

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 17px;
`;

type Props = {
  type: 'send' | 'swap';
  title: string;
  fromTokenPublicKey: string;
  fromTokenAmount: string;
  toTokenPublicKey: string;
  toTokenAmount?: string;
  actionText: string;
  onFromTokenChange: (pubkey: string) => void;
  onFromAmountChange: (amount: string) => void;
  onToTokenChange: (pubkey: string) => void;
  onToAmountChange?: (amount: string) => void;
  onBackClick: () => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export const SendSwapWidget: FunctionComponent<Props> = ({
  type,
  title,
  fromTokenPublicKey,
  fromTokenAmount,
  toTokenPublicKey,
  toTokenAmount = '',
  actionText,
  onFromTokenChange,
  onFromAmountChange,
  onToTokenChange,
  onToAmountChange = () => {},
  onBackClick,
  onSubmit,
  disabled,
}) => {
  return (
    <Wrapper>
      <TitleWrapper>
        <BackWrapper onClick={onBackClick}>
          <BackIcon name="chevron-1" />
        </BackWrapper>
        <Title>{title}</Title>
      </TitleWrapper>
      <WrapperCard>
        <FromWrapper>
          <FromToSelectInput
            tokenPublicKey={fromTokenPublicKey}
            tokenAmount={fromTokenAmount}
            onTokenChange={onFromTokenChange}
            onAmountChange={onFromAmountChange}
            disabled={disabled}
          />
        </FromWrapper>
        {type === 'send' ? (
          <ToWrapper>
            <ToSelect>
              {/* <ToOption>To user</ToOption> */}
              <ToOption className="active">To wallet</ToOption>
            </ToSelect>
            <ToAddressInput value={toTokenPublicKey} onChange={onToTokenChange} />
          </ToWrapper>
        ) : (
          <FromWrapper>
            <FromToSelectInput
              type="to"
              tokenPublicKey={toTokenPublicKey}
              tokenAmount={toTokenAmount}
              onTokenChange={onToTokenChange}
              onAmountChange={onToAmountChange}
              disabled={disabled}
            />
          </FromWrapper>
        )}
        <ActionWrapper>
          <Button primary={!disabled} secondary={disabled} big full onClick={onSubmit}>
            {actionText}
          </Button>
          <Hint>fee calculator comming soon</Hint>
        </ActionWrapper>
      </WrapperCard>
    </Wrapper>
  );
};
