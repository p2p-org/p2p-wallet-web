import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { Card } from 'components/common/Card';
import { Layout } from 'components/common/Layout';
import { WidgetPage } from 'components/common/WidgetPage';
import { Icon } from 'components/ui';
import { disconnect } from 'store/slices/wallet/WalletSlice';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 24px;
`;

const RowsWrapper = styled.div`
  margin-top: 10px;
`;

const RowWrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  height: 76px;
  margin: 0 10px;
  padding: 6px 0;

  &:not(:last-child) {
    &::after {
      position: absolute;
      right: 10px;
      bottom: 0;
      left: 10px;

      border-bottom: 1px solid ${rgba(0, 0, 0, 0.05)};

      content: '';
    }
  }
`;

const RowIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-right: 20px;

  background: #f6f6f8;
  border-radius: 12px;
`;

const RowIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const CenterWrapper = styled.div`
  display: flex;
  flex: 1;
  height: 64px;
  padding: 0 10px;

  border-radius: 12px;
  cursor: pointer;

  &:hover {
    background: #f6f6f8;

    ${RowIconWrapper} {
      background: #fff;
    }

    ${RowIcon} {
      color: #5887ff;
    }
  }
`;

const FieldNameWrapper = styled.div`
  display: flex;
  align-items: center;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const LogoutCard = styled(Card)`
  padding: 0;
`;

const LogoutIcon = styled(RowIcon)`
  width: 20px;
  height: 20px;

  color: #a3a5ba;
`;

const LogoutWrapper = styled(RowWrapper)`
  cursor: pointer;

  &:hover {
    ${LogoutIcon} {
      color: #f43d3d;
    }
  }
`;

type RowProps = {
  icon: string;
  title: React.ReactNode;
};

const Row: FunctionComponent<RowProps> = ({ icon, title }) => {
  return (
    <RowWrapper>
      <CenterWrapper>
        <FieldNameWrapper>
          <RowIconWrapper>
            <RowIcon name={icon} />
          </RowIconWrapper>
          {title}
        </FieldNameWrapper>
      </CenterWrapper>
    </RowWrapper>
  );
};

export const Settings: FunctionComponent = () => {
  const dispatch = useDispatch();

  const handleLogoutClick = () => {
    void dispatch(disconnect());
  };

  return (
    <Layout
      rightColumn={
        <Wrapper>
          <WidgetPage icon="gear" title="Settings">
            <RowsWrapper>
              <Row icon="reload" title="Backup" />
              <Row icon="currency" title="Currency" />
              <Row icon="plug" title="Network" />
              <Row icon="card" title="Payment methods" />
              <Row icon="branch" title="Node" />
              <Row icon="lock" title="Security" />
              <Row icon="sun" title="Appearance" />
            </RowsWrapper>
          </WidgetPage>
          <LogoutCard withShadow>
            <LogoutWrapper onClick={handleLogoutClick}>
              <CenterWrapper>
                <FieldNameWrapper>
                  <RowIconWrapper>
                    <LogoutIcon name="logout" />
                  </RowIconWrapper>
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
