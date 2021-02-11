import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { styled } from '@linaria/react';

import { Card } from 'components/common/Card';
import { Layout } from 'components/common/Layout';
import { WidgetPage } from 'components/common/WidgetPage';
import { Icon } from 'components/ui';
import { disconnect } from 'store/slices/wallet/WalletSlice';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 24px;
`;

const LineWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 76px;

  padding: 0 20px;
`;

const CenterWrapper = styled.div``;

const FieldNameWrapper = styled.div`
  display: flex;
  align-items: center;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-right: 20px;

  background: #f6f6f8;
  border-radius: 12px;
`;

const LineIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const LogoutCard = styled(Card)`
  padding: 0;
`;

const LogoutIcon = styled(LineIcon)`
  width: 20px;
  height: 20px;

  color: #a3a5ba;
`;

const LogoutWrapper = styled(LineWrapper)`
  cursor: pointer;

  &:hover {
    ${LogoutIcon} {
      color: #f43d3d;
    }
  }
`;

export const Settings: FunctionComponent = () => {
  const dispatch = useDispatch();

  const handleLogoutClick = () => {
    void dispatch(disconnect());
  };

  return (
    <Layout
      rightColumn={
        <Wrapper>
          <WidgetPage icon="gear" title="Settings" />
          <LogoutCard withShadow>
            <LogoutWrapper onClick={handleLogoutClick}>
              <CenterWrapper>
                <FieldNameWrapper>
                  <IconWrapper>
                    <LogoutIcon name="logout" />
                  </IconWrapper>
                  Logout
                </FieldNameWrapper>
              </CenterWrapper>
            </LogoutWrapper>
          </LogoutCard>
        </Wrapper>
      }
    />
  );
};
