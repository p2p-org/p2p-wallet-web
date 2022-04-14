import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { rgba } from 'polished';

import { Button, Icon } from 'components/ui';

import { INITIAL_PROGRESS } from '../TransactionStatusModal/TransactionStatusModal';

// @FIXME fix all pallete colors
/* eslint-disable  @typescript-eslint/no-magic-numbers */

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  width: 524px;

  background: ${theme.colors.bg.primary};

  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
`;

export const Header = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 24px;
  font-style: normal;
  line-height: 140%;
  text-align: center;
`;

export const Title = styled.div`
  margin-bottom: 10px;

  color: #000;
  font-weight: bold;
  font-size: 20px;
  line-height: 100%;
  text-transform: capitalize;
`;

export const Desc = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 100%;
`;

export const CloseWrapper = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  background: #f6f6f8;
  border-radius: 8px;

  cursor: pointer;
`;

export const CloseIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  color: #a3a5ba;
`;

export const CheckmarkIcon = styled(Icon)`
  width: 45px;
  height: 45px;

  color: #fff;
`;

export const OtherIcon = styled(Icon)`
  width: 37px;
  height: 37px;

  color: #fff;
`;

export const ProgressWrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  height: 85px;
`;

export const ProgressLine = styled.div`
  position: absolute;

  z-index: ${theme.zIndex.base + theme.zIndex.bellow};

  width: ${INITIAL_PROGRESS}%;
  height: 1px;

  background: #5887ff;

  transition: width 0.15s;
`;

const StatusColors = styled.div`
  &.isProcessing {
    background: #ffd177;
  }

  &.isSuccess {
    background: #77db7c;
  }

  &.isError {
    background: #f77;
  }
`;

export const BlockWrapper = styled(StatusColors)`
  z-index: ${theme.zIndex.base};

  display: flex;
  align-items: center;
  justify-content: center;
  width: 55px;
  height: 55px;

  border-radius: 12px;
`;

export const TransactionStatus = styled.div`
  display: flex;
  align-items: center;

  margin: 17px 40px;

  color: ${theme.colors.textIcon.primary};

  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
`;

export const TransactionBadge = styled.div`
  display: flex;
  align-items: center;

  margin-left: 4px;
  padding: 5px 12px;

  color: ${theme.colors.textIcon.secondary};

  font-weight: 500;
  font-size: 12px;

  background: ${theme.colors.bg.secondary};
  border-radius: 4px;
`;

export const TransactionLabel = styled(StatusColors)`
  display: block;
  width: 8px;
  height: 8px;

  margin-right: 8px;
`;

export const Content = styled.div`
  padding-top: 40px;
`;

export const SendWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

export const ValueCurrency = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 28px;
  line-height: 120%;
`;

export const ValueOriginal = styled.div`
  margin-top: 4px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 120%;
`;

export const SwapWrapper = styled.div`
  display: flex;
  justify-content: center;

  margin-bottom: 40px;
`;

export const SwapColumn = styled.div`
  display: flex;
  flex: 1;
  align-items: center;

  &:not(:first-child) {
    justify-content: flex-start;
  }

  &:not(:last-child) {
    justify-content: flex-end;
  }
`;

export const SwapInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SwapBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
  margin: 6px 26px 0;

  background: #f6f6f8;
  border-radius: 12px;
`;

export const SwapIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

export const SwapAmount = styled.div`
  margin-top: 10px;

  color: #000;
  font-weight: 600;
  font-size: 18px;
  line-height: 120%;
`;

export const FieldsWrapper = styled.div``;

export const FieldWrapper = styled.div`
  padding: 16px 30px;

  &:first-child {
    border-top: 1px solid ${rgba('#000', 0.05)};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${rgba('#000', 0.05)};
  }
`;

export const FieldTitle = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
`;

export const FieldValue = styled.div`
  display: flex;
  align-items: center;
  margin-top: 3px;

  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
`;

export const ShareIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

export const ShareWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-left: 20px;

  background: rgba(163, 165, 186, 0.1);
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #eff3ff;

    ${ShareIcon} {
      color: #5887ff;
    }
  }
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 20px;

  border-top: 1px solid ${rgba('#000', 0.05)};

  & > :not(:last-child) {
    margin-right: 16px;
  }

  &.isCentered {
    justify-content: center;
  }
`;

export const ButtonExplorer = styled(Button)`
  font-weight: 600;
  font-size: 14px;
  line-height: 150%;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 20px;
`;

export const DateHeader = styled.div`
  display: flex;
  justify-content: center;

  color: ${theme.colors.textIcon.secondary};

  font-weight: 500;
  font-size: 14px;
  line-height: 120%;

  & > *:not(:first-child) {
    margin-left: 4px;
  }
`;

export const Time = styled.div`
  color: ${theme.colors.textIcon.primary};
`;
