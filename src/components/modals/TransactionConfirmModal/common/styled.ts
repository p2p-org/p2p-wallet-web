import { styled } from '@linaria/react';

import { Icon } from 'components/ui';

export const Section = styled.div`
  padding: 20px;

  &.swap {
    padding: 20px 20px 0;
  }

  &.send {
    padding: 0 20px;
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
`;

export const SectionTitle = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

export const FieldInfo = styled.div`
  display: flex;
  padding: 20px 0;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
`;

export const WalletIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: #f6f6f8;
  border-radius: 12px;
`;

export const InfoWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin: 0 9px 0 12px;
`;

export const InfoTitle = styled.div`
  margin-bottom: 2px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
`;

export const Username = styled(InfoTitle)`
  color: #000;
  font-size: 16px;
`;

export const InfoValue = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 16px;
`;
