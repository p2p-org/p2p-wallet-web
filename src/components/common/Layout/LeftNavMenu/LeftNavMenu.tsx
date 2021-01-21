import React, { FunctionComponent } from 'react';
import { NavLink } from 'react-router-dom';

import { styled } from '@linaria/react';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 8px;
`;

const NavButton = styled.div`
  display: flex;
  align-items: center;
  height: 56px;
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
  width: 36px;
  height: 36px;
  margin-right: 20px;

  background: #f6f6f8;
  border-radius: 8px;
`;

const NavIcon = styled(Icon)`
  width: 24px;
  height: 24px;

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

        ${NavIcon} {
          color: #5887ff;
        }
      }
    }
  }
`;

export const LeftNavMenu: FunctionComponent = () => {
  return (
    <Wrapper>
      <NavLinkMenu to="/wallets" className="button">
        <NavButton>
          <IconBlock>
            <NavIcon name="home" />
          </IconBlock>
          Wallets
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu to="/receive" className="button disabled">
        <NavButton>
          <IconBlock>
            <NavIcon name="bottom" />
          </IconBlock>
          Receive
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu to="/send" className="button">
        <NavButton>
          <IconBlock>
            <NavIcon name="top" />
          </IconBlock>
          Send
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu to="/swap" className="button">
        <NavButton>
          <IconBlock>
            <NavIcon name="swap" />
          </IconBlock>
          Swap
        </NavButton>
      </NavLinkMenu>
      <NavLinkMenu to="/settings" className="button disabled">
        <NavButton>
          <IconBlock>
            <NavIcon name="gear" />
          </IconBlock>
          Settings
        </NavButton>
      </NavLinkMenu>
    </Wrapper>
  );
};
