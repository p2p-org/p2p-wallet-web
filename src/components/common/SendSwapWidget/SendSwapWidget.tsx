import React, { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { TokenAccount } from 'api/token/TokenAccount';
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

// TODO: make amounts with decimal type
type Props = {
  type: 'send' | 'swap';
  title: string;
  fromTokenAccount?: TokenAccount;
  fromAmount: string;
  toTokenAccount?: TokenAccount | string;
  toAmount?: string;
  actionText: string;
  fee?: number;
  onFromTokenAccountChange: (tokenAccount: TokenAccount) => void;
  onFromAmountChange: (minorAmount: string) => void;
  onToTokenAccountChange: (tokenAccount: TokenAccount | string) => void;
  onToAmountChange?: (minorAmount: string) => void;
  onBackClick: () => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export const SendSwapWidget: FunctionComponent<Props> = ({
  type,
  title,
  fromTokenAccount,
  fromAmount,
  toTokenAccount,
  toAmount,
  actionText,
  fee,
  onFromTokenAccountChange,
  onFromAmountChange,
  onToTokenAccountChange,
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
            type={type}
            tokenAccount={fromTokenAccount}
            amount={fromAmount}
            onTokenAccountChange={onFromTokenAccountChange}
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
            <ToAddressInput
              value={String(toTokenAccount) || ''}
              onChange={onToTokenAccountChange}
            />
          </ToWrapper>
        ) : (
          <FromWrapper>
            <FromToSelectInput
              type={type}
              direction="to"
              tokenAccount={toTokenAccount as TokenAccount}
              amount={toAmount}
              onTokenAccountChange={onToTokenAccountChange}
              onAmountChange={onToAmountChange}
              disabled={disabled}
            />
          </FromWrapper>
        )}
        <ActionWrapper>
          <Button primary={!disabled} secondary={disabled} big full onClick={onSubmit}>
            {actionText}
          </Button>
          {fee ? <Hint>{fee}</Hint> : undefined}
        </ActionWrapper>
      </WrapperCard>
    </Wrapper>
  );
};
