import React, { FunctionComponent, ReactNode } from 'react';

import { styled } from '@linaria/react';
import Decimal from 'decimal.js';
import { rgba } from 'polished';

import { TokenAccount } from 'api/token/TokenAccount';
import { AmountUSDT } from 'components/common/AmountUSDT';
import { Card } from 'components/common/Card';
import { RateUSDT } from 'components/common/RateUSDT';
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
  position: relative;

  padding: 20px 32px;

  border-bottom: 1px solid ${rgba('#000', 0.1)};
`;

const ReverseWrapper = styled.div`
  position: absolute;
  top: -24px;
  right: 32px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: #fff;
  border: 1px solid #e7e7e7;
  border-radius: 44px;
  cursor: pointer;
`;

const ReverseIcon = styled(Icon)`
  width: 24px;
  height: 24px;
`;

const ToWrapper = styled.div`
  padding: 16px 32px 32px;

  border-bottom: 1px solid ${rgba('#000', 0.1)};
`;

const ToSelect = styled.div`
  display: flex;
  /*margin-bottom: 32px; */
  margin-bottom: 20px;

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

const SendTo = styled.div`
  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 17px;
`;

const FeeLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 35px;
  margin-top: 10px;
  padding: 0 18px;

  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 17px;

  background: #f7f7f7;
  border-radius: 8px;
`;

const FeeLeft = styled.div`
  display: flex;
`;

const FeeRight = styled.div`
  flex: 1;

  text-align: right;
`;

const ActionWrapper = styled.div`
  padding: 32px;
`;

// const Hint = styled.div`
//   margin-top: 24px;
//
//   color: ${rgba('#000', 0.5)};
//   font-size: 14px;
//   line-height: 17px;
// `;

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
  rate?: ReactNode;
  properties?: ReactNode;
  onFromTokenAccountChange: (tokenAccount: TokenAccount) => void;
  onFromAmountChange: (minorAmount: string) => void;
  onToTokenAccountChange: (tokenAccount: TokenAccount | string) => void;
  onToAmountChange?: (minorAmount: string) => void;
  onBackClick: () => void;
  onSubmit: () => void;
  onReverseClick?: () => void;
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
  rate,
  properties,
  onFromTokenAccountChange,
  onFromAmountChange,
  onToTokenAccountChange,
  onToAmountChange = () => {},
  onBackClick,
  onSubmit,
  onReverseClick,
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
          {type === 'send' ? (
            <FeeLine>
              {fromTokenAccount?.mint ? (
                <FeeLeft>
                  1 {fromTokenAccount?.mint.symbol} =&nbsp;
                  <RateUSDT symbol={fromTokenAccount?.mint.symbol} />
                </FeeLeft>
              ) : undefined}

              {fee ? <FeeRight>Fee: {fee} SOL</FeeRight> : undefined}
            </FeeLine>
          ) : undefined}
        </FromWrapper>
        {type === 'send' ? (
          <ToWrapper>
            <ToSelect>
              {/* <ToOption>To user</ToOption> */}
              {/* <ToOption className="active">To wallet</ToOption> */}
              <SendTo>Send to</SendTo>
            </ToSelect>
            <ToAddressInput
              value={String(toTokenAccount) || ''}
              onChange={onToTokenAccountChange}
            />
          </ToWrapper>
        ) : (
          <FromWrapper>
            <ReverseWrapper onClick={onReverseClick}>
              <ReverseIcon name="change" />
            </ReverseWrapper>
            <FromToSelectInput
              type={type}
              direction="to"
              tokenAccount={toTokenAccount as TokenAccount}
              amount={toAmount}
              onTokenAccountChange={onToTokenAccountChange}
              onAmountChange={onToAmountChange}
              disabled={disabled}
            />
            {rate ? (
              <FeeLine>
                <FeeLeft>Price:</FeeLeft>
                <FeeRight>{rate}</FeeRight>
              </FeeLine>
            ) : undefined}
          </FromWrapper>
        )}
        {properties}
        <ActionWrapper>
          <Button primary={!disabled} secondary={disabled} big full onClick={onSubmit}>
            {actionText}
          </Button>
          {/* <Hint> */}
          {/*  Physical space is often conceived in three linear dimensions, although modern physicists */}
          {/*  usually consider it, with time */}
          {/* </Hint> */}
        </ActionWrapper>
      </WrapperCard>
    </Wrapper>
  );
};
