import type { FC } from 'react';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import { useWallet } from '@saberhq/use-solana';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { Icon, Switch } from 'components/ui';
import { appStorePath, playStorePath } from 'new/constants';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import AppStoreBadge from 'new/scenes/Main/Settings/images/app-store-badge.png';
import GooglePlayBadge from 'new/scenes/Main/Settings/images/google-play-badge.png';
import { SettingsViewModel } from 'new/scenes/Main/Settings/Settings.ViewModel';
import { Defaults } from 'new/services/Defaults';
import { Layout } from 'new/ui/components/common/Layout';
import { UsernameAddressWidget } from 'new/ui/components/common/UsernameAddressWidget';
import { WidgetPage } from 'new/ui/components/common/WidgetPage';
import { Accordion } from 'new/ui/components/ui/Accordion';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 24px;
`;

const ItemsWrapper = styled.div`
  margin-top: 10px;
  padding: 20px;

  border-bottom: 1px solid #f6f6f8;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;

  border: 1px solid #f6f6f8;
  border-radius: 12px;

  &:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const ItemTitle = styled.div`
  display: flex;
  flex: 1 0 auto;

  font-weight: 600;
  font-size: 16px;
`;

const ItemAction = styled.div`
  display: flex;
  align-items: center;
`;

const LogoutWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`;

const Logout = styled.div`
  padding: 0 10px;

  color: #f43d3d;
  font-weight: 600;
  font-size: 16px;

  cursor: pointer;
`;

/*const CurrencyItem = styled.div``;

const Symbol = styled.span`
  padding-left: 3px;

  color: #a3a5ba;
`;

const Capitalize = styled.span`
  text-transform: capitalize;
`;*/

const Title = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;

  text-align: right;
`;

const ChevronIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #a3a5ba;
`;

const ChevronWrapper = styled.div`
  margin-left: 20px;

  transform: rotate(270deg);
`;

const AccordionItem = styled.div`
  margin-bottom: 8px;
`;

const AccordionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  width: 95%;
`;

const AccordionTitlePrimary = styled.div``;

const AccordionTitleSecondary = styled.div`
  &.warning {
    color: #f43d3d;
  }
`;

const MobileButtons = styled.div`
  display: flex;
  justify-content: space-between;

  width: 263px;
  padding: 5px 0;
`;

const Text = styled.div`
  margin-bottom: 20px;
`;

// const FIATS = [Fiat.usd, Fiat.eur, Fiat.rub];

export const Settings: FC = observer(() => {
  const viewModel = useViewModel(SettingsViewModel);
  const history = useHistory();
  const domain = Defaults.apiEndPoint.network === 'mainnet-beta' ? '.p2p.sol' : '.p2p';
  const { disconnect } = useWallet();

  return (
    <Layout>
      <Wrapper>
        <WidgetPage icon="gear" title="Settings">
          <ItemsWrapper>
            {/*<Item>
              <ItemTitle>Currency</ItemTitle>
              <ItemAction>
                <Select value={Defaults.fiat.code} mobileListTitle="Choose currency">
                  {FIATS.map((fiat) => (
                    <SelectItem
                      key={fiat.code}
                      isSelected={fiat.code === Defaults.fiat.code}
                      onItemClick={() => viewModel.setFiat(fiat)}
                    >
                      <CurrencyItem>
                        {fiat.name}
                        <Symbol>{`(${fiat.symbol})`}</Symbol>
                      </CurrencyItem>
                    </SelectItem>
                  ))}
                </Select>
              </ItemAction>
            </Item>
            <Item>
              <ItemTitle>Appearance</ItemTitle>
              <ItemAction>
                <Select
                  value={<Capitalize>{Defaults.appearance}</Capitalize>}
                  mobileListTitle="Choose appearance"
                >
                  {Object.values(Appearance).map((appearance: Appearance) => (
                    <SelectItem
                      key={appearance}
                      isSelected={appearance === Defaults.appearance}
                      onItemClick={() => viewModel.setAppearance(appearance)}
                    >
                      <Capitalize>{appearance}</Capitalize>
                    </SelectItem>
                  ))}
                </Select>
              </ItemAction>
            </Item>*/}
            <AccordionItem>
              <Accordion
                title={
                  <AccordionTitle>
                    <AccordionTitlePrimary>Username</AccordionTitlePrimary>
                    <AccordionTitleSecondary
                      className={classNames({ warning: !viewModel.username })}
                    >
                      {viewModel.username ? `${viewModel.username}${domain}` : 'Not yet reserved'}
                    </AccordionTitleSecondary>
                  </AccordionTitle>
                }
              >
                {viewModel.username ? (
                  <>
                    <Text>
                      Your P2P username allows you to receive any token within the Solana network
                      even if it is not included in your wallet list.
                    </Text>
                    <UsernameAddressWidget
                      address={viewModel.pubkeyBase58}
                      username={`${viewModel.username}${domain}`}
                    />
                  </>
                ) : (
                  <>
                    <Text>
                      You can receive and send tokens using your P2P username or link. Users who
                      know your URL or username can also send you any token, even if you don’t have
                      it in your wallet's list.
                    </Text>
                    <div>You can access the feature in the app</div>
                    <MobileButtons>
                      <a href={playStorePath} target="_blank" className="button" rel="noreferrer">
                        <img
                          src={GooglePlayBadge}
                          height="40"
                          alt="Download P2P Wallet at the Google Play Store"
                        />
                      </a>
                      <a href={appStorePath} target="_blank" className="button" rel="noreferrer">
                        <img
                          src={AppStoreBadge}
                          height="40"
                          alt="Download P2P Wallet from the App Store"
                        />
                      </a>
                    </MobileButtons>
                  </>
                )}
              </Accordion>
            </AccordionItem>
            <Item>
              <ItemTitle>Network</ItemTitle>
              <ItemAction
                onClick={() => {
                  history.push('/settings/networkNew');
                }}
                style={{ cursor: 'pointer' }}
              >
                <Title title={Defaults.apiEndPoint.address}>{Defaults.apiEndPoint.address}</Title>
                <ChevronWrapper
                  onClick={() => {
                    history.push('/settings/networkNew');
                  }}
                >
                  <ChevronIcon name="chevron" />
                </ChevronWrapper>
              </ItemAction>
            </Item>
            <Item>
              <ItemTitle>Hide zero balances</ItemTitle>
              <ItemAction>
                <Switch
                  checked={Defaults.hideZeroBalances}
                  onChange={(checked) => viewModel.setHideZeroBalances(checked)}
                />
              </ItemAction>
            </Item>
            {/*<Item>
              <ItemTitle>Use free transactions</ItemTitle>
              <ItemAction>
                <Switch
                  checked={Defaults.useFreeTransactions}
                  onChange={(checked) => viewModel.setUseFreeTransactions(checked)}
                />
              </ItemAction>
            </Item>*/}
          </ItemsWrapper>
          <LogoutWrapper>
            <Logout onClick={() => void disconnect()}>Logout now</Logout>
          </LogoutWrapper>
        </WidgetPage>
      </Wrapper>
    </Layout>
  );
});
