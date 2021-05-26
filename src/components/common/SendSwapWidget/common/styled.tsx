import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { WidgetPage } from 'components/common/WidgetPage';

import { FromToSelectInput } from './FromToSelectInput';

export const WrapperWidgetPage = styled(WidgetPage)``;

export const FromWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column; /* to don't collapse margins of children */

  padding: 24px 20px 20px;

  border-bottom: 1px solid ${rgba('#000', 0.05)};
`;

export const FromToSelectInputStyled = styled(FromToSelectInput)`
  margin-bottom: 26px;
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
  padding: 20px 20px 24px;

  &:not(:has(div:only-child)) {
    padding: 20px;
  }
`;

export const ButtonWrapper = styled.div``;

export const Hint = styled.div`
  margin-top: 20px;

  color: #a3a5ba;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
`;

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
