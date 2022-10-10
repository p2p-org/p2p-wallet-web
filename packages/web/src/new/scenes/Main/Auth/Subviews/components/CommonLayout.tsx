import type { FC } from 'react';

import { styled } from '@linaria/react';
import { useIsDesktop } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';

import { LoaderWide } from 'components/common/LoaderWide';
import app from 'components/pages/auth/app.png';
import { Back } from 'components/pages/auth/AuthSide/common/Back';
import logo from 'components/pages/auth/logo.svg';
import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { AuthViewModel } from '../../Auth.ViewModel';

const Wrapper = styled.div`
  display: flex;
  min-height: 100%;
`;

const Left = styled.div`
  position: relative;

  flex: 1;
  padding: 20px 50px 50px;
  overflow: hidden;

  background: #f5f7fe;
`;

const Logo = styled.div`
  width: 32px;
  height: 24px;

  background: url(${logo}) no-repeat 50%;
`;

const Title = styled.span`
  display: inline-block;
  margin-top: 67px;

  color: #161616;
  font-size: 32px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 40px;
`;

const WalletTitle = styled.span`
  position: relative;

  color: #161616;
  font-weight: 700;
  font-size: 26px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 32px;
  text-align: center;
`;

const BackStyled = styled(Back)`
  position: absolute;
  left: 0;
`;

const TitleBold = styled.strong`
  display: block;

  font-weight: 900;
`;

const AppImg = styled.img`
  position: absolute;
  z-index: 0;

  display: block;

  width: 110%;
  min-width: 820px;
  margin-top: 50px;

  filter: drop-shadow(-34px 42px 100px rgba(0, 0, 0, 0.05));
`;

const TabButton = styled.button`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 180px;
  height: 50px;

  color: #1616164c;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
  white-space: nowrap;
  text-align: center;
  text-decoration: none;

  background: transparent;

  cursor: pointer;

  &.isActive {
    color: #161616cc;

    &::after {
      position: absolute;
      right: 0;
      bottom: -1px;
      left: 0;

      height: 1px;

      background: #161616;

      content: '';
    }
  }
`;

const Navigate = styled.div`
  display: flex;
  margin-bottom: 70px;

  border-bottom: 1px solid #16161626;
`;

const MenuContainer = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;

  padding-bottom: 20px;

  background: #fff;
`;

const ContentContainer = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;

  width: 360px;
`;

type Props = {
  showNavigation?: boolean;
};

const defaultProps = {
  showNavigation: true,
};

export const CommonLayout: FC<Props> = observer((props) => {
  const isDesktop = useIsDesktop();
  const viewModel = useViewModel(AuthViewModel);

  const elBanner = isDesktop && (
    <Left>
      <Logo />
      <Title>
        Your crypto <TitleBold>is starting here</TitleBold>
      </Title>
      <AppImg src={app} />
    </Left>
  );

  const elNavigation = props.showNavigation && (
    <Navigate>
      <TabButton
        className={classNames({ isActive: viewModel.isCreate })}
        onClick={viewModel.setCreateStart}
      >
        Create new wallet
      </TabButton>
      <TabButton
        className={classNames({ isActive: viewModel.isRestore })}
        onClick={viewModel.setRestoreStart}
      >
        I already have wallet
      </TabButton>
    </Navigate>
  );

  const elHead = props.showNavigation && (
    <WalletTitle>
      {viewModel.showBackButton && <BackStyled onClick={viewModel.previousStep} />}
      {viewModel.isCreate ? 'New wallet' : 'Log in to your wallet'}
    </WalletTitle>
  );

  return (
    <Wrapper>
      {elBanner}
      <MenuContainer>
        {elNavigation}
        <ContentContainer>
          {elHead}
          {props.children}
        </ContentContainer>
        {/*// @TODO check if working*/}
        {viewModel.isLoading && <LoaderWide />}
      </MenuContainer>
    </Wrapper>
  );
});

CommonLayout.defaultProps = defaultProps;
