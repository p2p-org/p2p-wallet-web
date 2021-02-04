import React, { FunctionComponent, ReactNode } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { TokenAccount } from 'api/token/TokenAccount';
import { RateUSDT } from 'components/common/RateUSDT';
import { SettingsAction } from 'components/common/SendSwapWidget/SettingsAction';
import { Widget } from 'components/common/Widget';
import { Button, Icon } from 'components/ui';

import { FromToSelectInput } from './FromToSelectInput';
import { ToAddressInput } from './ToAddressInput';

const WrapperWidget = styled(Widget)``;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;

  background: #5887ff;
  border-radius: 12px;
`;

const IconStyled = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #fff;
`;

const Title = styled.div`
  margin-left: 16px;

  color: #000;
  font-weight: 600;
  font-size: 20px;
  line-height: 120%;
`;

const ActionsWrapper = styled.div`
  display: flex;

  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const FromWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column; /* to don't collapse margins of children */

  padding: 24px 20px 20px;

  border-bottom: 1px solid ${rgba('#000', 0.05)};
`;

const FromToSelectInputStyled = styled(FromToSelectInput)`
  margin-bottom: 26px;
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

  background: #5887ff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
`;

const ReverseIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #fff;
`;

const ToSendWrapper = styled(FromWrapper)``;

const ToSwapWrapper = styled(FromWrapper)`
  padding-top: 34px;
`;

const FromTitle = styled.div`
  margin-bottom: 20px;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const FeeLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  margin-top: 10px;
  padding: 0 20px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;

  background: #f6f6f8;
  border-radius: 12px;
`;

const FeeLeft = styled.div`
  display: flex;
`;

const FeeRight = styled.div`
  flex: 1;

  text-align: right;
`;

const BottomWrapper = styled.div`
  padding: 20px 20px 24px;

  &:not(:has(div:only-child)) {
    padding: 20px;
  }
`;

const ButtonWrapper = styled.div``;

const Hint = styled.div`
  margin-top: 20px;

  color: #a3a5ba;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
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
  rate?: ReactNode;
  properties?: ReactNode;
  onFromTokenAccountChange: (tokenAccount: TokenAccount) => void;
  onFromAmountChange: (minorAmount: string) => void;
  onToTokenAccountChange: (tokenAccount: TokenAccount | string) => void;
  onToAmountChange?: (minorAmount: string) => void;
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
  onSubmit,
  onReverseClick,
  disabled,
}) => {
  return (
    <WrapperWidget
      title={
        <TitleWrapper>
          <IconWrapper>
            <IconStyled name="top" />
          </IconWrapper>
          <Title>{title}</Title>
        </TitleWrapper>
      }
      action={
        type === 'swap' ? (
          <ActionsWrapper>
            <SettingsAction />
          </ActionsWrapper>
        ) : undefined
      }>
      <FromWrapper>
        <FromToSelectInputStyled
          // type={type}
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
        <ToSendWrapper>
          <FromTitle>Send to</FromTitle>
          <ToAddressInput value={String(toTokenAccount) || ''} onChange={onToTokenAccountChange} />
        </ToSendWrapper>
      ) : (
        <ToSwapWrapper>
          <ReverseWrapper onClick={onReverseClick}>
            <ReverseIcon name="swap" />
          </ReverseWrapper>
          <FromToSelectInputStyled
            // type={type}
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
        </ToSwapWrapper>
      )}
      <BottomWrapper>
        {properties}
        <ButtonWrapper>
          <Button primary={!disabled} disabled={disabled} big full onClick={onSubmit}>
            {actionText}
          </Button>
          <Hint>All deposits are stored 100% non-custodiallity with keys held on this device</Hint>
        </ButtonWrapper>
      </BottomWrapper>
    </WrapperWidget>
  );
};
