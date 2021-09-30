import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';

import { styled } from '@linaria/react';
import TransakSDK from '@transak/transak-sdk';
import { Feature } from 'flagged';

import { Icon } from 'components/ui';
import { FEATURE_NAV_MENU_BUY_BUTTON } from 'config/featureFlags';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 8px;
`;

const NavButton = styled.div`
  display: flex;
  align-items: center;
  height: 52px;
  padding: 10px 20px;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;

  background: #fff;
  border-radius: 12px;
`;

const IconBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 20px;

  background: #f6f6f8;
  border-radius: 12px;
`;

const NavIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #a3a5ba;
`;

const NavLinkMenu = styled(NavLink)`
  &.active {
    ${NavButton} {
      color: #5887ff;

      background: #eff3ff;

      ${IconBlock} {
        color: #5887ff;

        background: #fff !important;
        border: 1px solid #5887ff;

        ${NavIcon} {
          color: #5887ff;
        }
      }
    }
  }

  /* TODO: temp, delete after release recieve and settings */
  &.disabled {
    pointer-events: none;
  }

  &:hover {
    ${NavButton} {
      color: #5887ff;

      ${IconBlock} {
        color: #5887ff;

        background: #eff3ff;
        border: 1px solid #5887ff;

        ${NavIcon} {
          color: #5887ff;
        }
      }
    }
  }
`;

const Separator = styled.div`
  display: flex;
  align-items: center;
  padding: 0px;
  margin: 8px 0px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Line = styled.hr`
  flex: none;
  order: 0;
  height: 2px;
  align-self: stretch;
  border: none;
  flex-grow: 0;
  margin: 0px 0px;
  background: #f6f6f8;
`;

const BuyButton = styled.div`
  cursor: pointer;

  &:hover {
    ${NavButton} {
      color: #5887ff;

      ${IconBlock} {
        color: #5887ff;

        background: #eff3ff;
        border: 1px solid #5887ff;

        ${NavIcon} {
          color: #5887ff;
        }
      }
    }
  }
`;

export const LeftNavMenu: FunctionComponent = () => {
  const location = useLocation();
  const publicKey = useSelector((state) => state.wallet.publicKey);

  const handleTransakClick = () => {
    const transak = new TransakSDK({
      apiKey: process.env.REACT_APP_TRANSAK_API_KEY, // Your API Key
      environment: 'STAGING', // STAGING/PRODUCTION
      defaultCryptoCurrency: 'SOL',
      cryptoCurrencyList: 'SOL,USDT',
      networks: 'solana,mainnet',
      walletAddress: publicKey, // Your customer's wallet address
      themeColor: '5887FF', // App theme color
      fiatCurrency: '', // INR/GBP
      email: '', // Your customer's email address
      redirectURL: '',
      hostURL: window.location.origin,
      widgetHeight: '680px',
      widgetWidth: '500px',
    });

    transak.init();

    // To get all the events
    transak.on(transak.ALL_EVENTS, (data: any) => {
      console.log(data);
    });

    // This will trigger when the user marks payment is made.
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData: any) => {
      console.log(orderData);
      transak.close();
    });
  };

  return (
    <Wrapper>
      <NavLinkMenu
        to={{ pathname: '/wallets', state: { fromPage: location.pathname } }}
        className="button">
        <NavButton>
          <IconBlock>
            <NavIcon name="home" />
          </IconBlock>
          Wallets
        </NavButton>
      </NavLinkMenu>

      <Feature name={FEATURE_NAV_MENU_BUY_BUTTON}>
        {/* <NavLinkMenu
          to={{ pathname: '/buy', state: { fromPage: location.pathname } }}
          className="button"> */}
        <BuyButton className="button" onClick={handleTransakClick}>
          <NavButton>
            <IconBlock>
              <NavIcon name="plus" />
            </IconBlock>
            Buy
          </NavButton>
        </BuyButton>
        {/* </NavLinkMenu> */}
      </Feature>

      <NavLinkMenu
        to={{ pathname: '/receive', state: { fromPage: location.pathname } }}
        className="button">
        <NavButton>
          <IconBlock>
            <NavIcon name="bottom" />
          </IconBlock>
          Receive
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu
        to={{ pathname: '/send', state: { fromPage: location.pathname } }}
        className="button">
        <NavButton>
          <IconBlock>
            <NavIcon name="top" />
          </IconBlock>
          Send
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu
        to={{ pathname: '/swap', state: { fromPage: location.pathname } }}
        className="button">
        <NavButton>
          <IconBlock>
            <NavIcon name="swap" />
          </IconBlock>
          Swap
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu
        to={{ pathname: '/settings', state: { fromPage: location.pathname } }}
        className="button">
        <NavButton>
          <IconBlock>
            <NavIcon name="gear" />
          </IconBlock>
          Settings
        </NavButton>
      </NavLinkMenu>
      <Separator>
        <Line />
      </Separator>
      <NavLinkMenu to={{ pathname: 'https://apple.com/' }} target="_blank" className="button">
        <NavButton>
          <IconBlock>
            <NavIcon name="app-store" />
          </IconBlock>
          App Store
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu to={{ pathname: 'https://google.com' }} target="_blank" className="button">
        <NavButton>
          <IconBlock>
            <NavIcon name="google-play" />
          </IconBlock>
          Google Play
        </NavButton>
      </NavLinkMenu>
    </Wrapper>
  );
};
