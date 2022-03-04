import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';

import { styled } from '@linaria/react';
import { shadows, up } from '@p2p-wallet-web/ui';

import { useUsername } from 'app/contexts';
import { ModalType, useModals } from 'app/contexts/general/modals';
import { useSettings } from 'app/contexts/general/settings';
import { Icon } from 'components/ui';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  margin: 16px 16px 0;
  padding: 20px;
  overflow: hidden;

  background: url('./logo.png') no-repeat 100% 100%;
  background-size: 160px 110px;
  border: 1px solid #a5beff;

  border-radius: 12px;
  ${shadows.notification}

  ${up.tablet} {
    margin: unset;
  }

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;

    width: 100%;
    height: 100%;

    background: linear-gradient(90.79deg, #c2fed3 0.55%, #dbeaff 99.4%);

    content: '';
  }
`;

const WrapperLink = styled(NavLink)`
  text-decoration: none;

  cursor: pointer;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 22px;
  right: 22px;

  flex-shrink: 0;
  height: 14px;
  margin: -10px -12px -10px 0;

  color: #a3a5ba;

  background-color: transparent;
  border: 0;
  outline: none;
  cursor: pointer;

  transition: color 0.15s;

  appearance: none;

  &:hover {
    color: #000;
  }
`;

const CloseIcon = styled(Icon)`
  width: 14px;
  height: 14px;
`;

const Header = styled.div`
  padding-bottom: 16px;

  color: #202020;
  font-weight: 600;
  font-size: 24px;
  line-height: 100%;
`;

const Text = styled.div`
  max-width: 339px;
  padding-bottom: 17px;

  color: #202020;
  font-size: 16px;
  line-height: 140%;
`;

export const UsernameBanner: FC = () => {
  const location = useLocation();
  const { openModal } = useModals();
  const { username } = useUsername();
  const {
    settings: { usernameBannerHiddenByUser },
  } = useSettings();

  const [isBannerShow, setIsBannerShow] = useState<boolean>(false);

  useEffect(() => {
    if (usernameBannerHiddenByUser || username) {
      setIsBannerShow(false);
    } else if (username !== undefined) {
      setIsBannerShow(true);
    }
  }, [username, usernameBannerHiddenByUser]);

  const handleCloseClick = async () => {
    const result = await openModal<boolean>(ModalType.SHOW_MODAL_PROCEED_USERNAME);

    if (result) {
      setIsBannerShow(false);
    }
  };

  if (!isBannerShow) {
    return null;
  }

  return (
    <Wrapper>
      <WrapperLink
        to={{
          pathname: '/settings',
          state: { fromPage: location.pathname, isUsernameActive: true },
        }}
      >
        <Header>Reserve your P2P username now</Header>
        <Text>
          Any token can be received using your username regardless of whether it is in your wallet's
          list
        </Text>
      </WrapperLink>
      <CloseButton type="button" onClick={handleCloseClick}>
        <CloseIcon name="close" />
      </CloseButton>
    </Wrapper>
  );
};
