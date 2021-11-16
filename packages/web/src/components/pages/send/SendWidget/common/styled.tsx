import { styled } from '@linaria/react';

import { WidgetPage } from 'components/common/WidgetPage';

export const WrapperWidgetPage = styled(WidgetPage)``;

export const FromWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column; /* to don't collapse margins of children */

  margin-bottom: 8px;
  padding: 16px 20px;

  border: 1px solid #f6f6f8;
  border-radius: 12px;
`;

export const FeeLine = styled.div`
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

export const FeeLeft = styled.div`
  display: flex;
  flex-grow: 1;
`;

export const FeeRight = styled.div`
  display: flex;
  align-items: center;
`;

export const BottomWrapper = styled.div`
  padding: 24px 0;

  &:not(:has(div:only-child)) {
    padding: 20px;
  }
`;

export const ButtonWrapper = styled.div``;

export const TooltipRow = styled.div`
  display: flex;

  font-size: 14px;
`;

export const TxName = styled.div`
  flex-grow: 1;

  margin-right: 5px;

  font-weight: normal;
`;

export const TxValue = styled.div`
  font-weight: 600;
`;
