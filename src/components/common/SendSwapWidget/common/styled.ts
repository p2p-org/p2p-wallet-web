import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { Widget } from 'components/common/Widget';
import { Icon } from 'components/ui';

import { FromToSelectInput } from './FromToSelectInput';

export const WrapperWidget = styled(Widget)``;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;

  background: #5887ff;
  border-radius: 12px;
`;

export const IconStyled = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #fff;
`;

export const Title = styled.div`
  margin-left: 16px;

  color: #000;
  font-weight: 600;
  font-size: 20px;
  line-height: 120%;
`;

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
`;

export const FeeRight = styled.div`
  flex: 1;

  text-align: right;
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
