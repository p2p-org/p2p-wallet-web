import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import type { LayoutViewModel } from 'new/ui/components/common/Layout/Layout.ViewModel';

import { MOBILE_HEADER_HEIGHT } from './constants';
import logo from './logo.png';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${MOBILE_HEADER_HEIGHT}px;
  padding: 0 20px;

  border-bottom: 1px solid ${theme.colors.stroke.tertiary};
`;

const LogoLink = styled(Link)`
  color: #000;
  font-weight: bold;
  font-size: 22px;
  line-height: 120%;
  text-decoration: none;
`;

const LogoImg = styled.img`
  width: 32px;
  height: 32px;
`;

const Name = styled.span`
  margin-left: 12px;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
`;

const ActionWrapper = styled.div`
  justify-self: flex-end;
  margin-right: -3px;
`;

type Props = {
  viewModel: LayoutViewModel;
  action?: React.ReactNode;
};

export const MobileHeader: FC<Props> = observer(({ viewModel, action }) => {
  return (
    <Wrapper>
      <LogoLink to={viewModel.walletConnected ? '/wallets' : '/'}>
        <LogoImg src={logo} />
        <Name>Wallet</Name>
      </LogoLink>
      {action ? <ActionWrapper>{action}</ActionWrapper> : undefined}
    </Wrapper>
  );
});
