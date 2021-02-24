import React, { FunctionComponent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { styled } from '@linaria/react';
import { Feature } from 'flagged';
import { rgba } from 'polished';

import { Card } from 'components/common/Card';
import { Layout } from 'components/common/Layout';
import { WidgetPage } from 'components/common/WidgetPage';
import { Icon, Select } from 'components/ui';
import { MenuItem } from 'components/ui/Select/MenuItem';
import { CLUSTERS } from 'config/constants';
import { FEATURE_SETTINGS_LIST } from 'config/featureFlags';
import { disconnect, STORAGE_KEY_SEED } from 'store/slices/wallet/WalletSlice';
import {
  appearance,
  currencies,
  defaultSettings,
  loadSettings,
  saveSettings,
} from 'utils/settings';
import { WalletSettings } from 'utils/types';

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
  align-items: center;
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

const SecondaryWrapper = styled.div``;

const FieldNameWrapper = styled.div`
  display: flex;
  flex: 1;
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

const CurrencyItem = styled.div``;

const Symbol = styled.span`
  padding-left: 3px;

  color: #a3a5ba;
`;

const Capitalize = styled.span`
  text-transform: capitalize;
`;

type RowProps = {
  icon: string;
  title: React.ReactNode;
  secondary?: React.ReactNode;
};

const Row: FunctionComponent<RowProps> = ({ icon, title, secondary }) => {
  return (
    <RowWrapper>
      <CenterWrapper>
        <FieldNameWrapper>
          <RowIconWrapper>
            <RowIcon name={icon} />
          </RowIconWrapper>
          {title}
        </FieldNameWrapper>
        <SecondaryWrapper>{secondary}</SecondaryWrapper>
      </CenterWrapper>
    </RowWrapper>
  );
};

export const Settings: FunctionComponent = () => {
  const dispatch = useDispatch();
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const mount = async () => {
      const currentSetting = loadSettings();
      setSettings(currentSetting);
    };
    void mount();
  }, []);

  const handleLogoutClick = () => {
    localStorage.removeItem(STORAGE_KEY_SEED);
    void dispatch(disconnect());
  };

  const onItemSelectHandler = (option: Partial<WalletSettings> = settings) => () => {
    const newSettings = {
      ...settings,
      ...option,
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <Layout
      rightColumn={
        <Wrapper>
          <WidgetPage icon="gear" title="Settings">
            <Feature name={FEATURE_SETTINGS_LIST}>
              <RowsWrapper>
                <Row icon="reload" title="Backup" />
                <Row
                  icon="currency"
                  title="Currency"
                  secondary={
                    <Select value={settings.currency}>
                      {currencies.map(({ ticker, name, symbol }) => (
                        <MenuItem
                          key={ticker}
                          isSelected={ticker === settings.currency}
                          onItemClick={onItemSelectHandler({ currency: ticker })}>
                          <CurrencyItem>
                            {name}
                            <Symbol>{`(${symbol})`}</Symbol>
                          </CurrencyItem>
                        </MenuItem>
                      ))}
                    </Select>
                  }
                />
                <Row
                  icon="plug"
                  title="Network"
                  secondary={
                    <Select value={settings.network}>
                      {CLUSTERS.map((value) => (
                        <MenuItem
                          key={value}
                          isSelected={value === settings.network}
                          onItemClick={onItemSelectHandler({ network: value })}>
                          <Capitalize>{value}</Capitalize>
                        </MenuItem>
                      ))}
                    </Select>
                  }
                />
                <Row icon="card" title="Payment methods" />
                <Row icon="branch" title="Node" />
                <Row icon="lock" title="Security" />
                <Row
                  icon="sun"
                  title="Appearance"
                  secondary={
                    <Select value={settings.appearance}>
                      {appearance.map((value) => (
                        <MenuItem
                          key={value}
                          isSelected={value === settings.appearance}
                          onItemClick={onItemSelectHandler({ appearance: value })}>
                          <Capitalize>{value}</Capitalize>
                        </MenuItem>
                      ))}
                    </Select>
                  }
                />
              </RowsWrapper>
            </Feature>
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
