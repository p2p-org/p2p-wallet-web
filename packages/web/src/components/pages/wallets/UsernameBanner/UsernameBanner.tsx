import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';

import { styled } from '@linaria/react';

import { Icon } from 'components/ui';
import { openModal } from 'store/actions/modals';
import { SHOW_MODAL_PROCEED_USERNAME } from 'store/constants/modalTypes';
import { useUsername } from 'utils/hooks/useUsername';
import { isUsernameBannerDisplayed } from 'utils/settings';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 20px;
  background: url('./background.png') no-repeat center center;
  border: 1px solid #a5beff;

  box-shadow: 0px 4px 4px #f6f6f9;
  border-radius: 12px;
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

  font-weight: 600;
  font-size: 24px;
  line-height: 100%;

  color: #202020;
`;

const Text = styled.div`
  padding-bottom: 17px;
  width: 339px;

  font-size: 16px;
  line-height: 140%;

  color: #202020;
`;

export const UsernameBanner: FC = () => {
  const dispatch = useDispatch();
  const [isBannerDisplayed, setIsBannerDisplayed] = useState<boolean>(true);
  const { username } = useUsername();

  useEffect(() => {
    if (username) {
      setIsBannerDisplayed(false);
    } else {
      setIsBannerDisplayed(isUsernameBannerDisplayed());
    }
  }, [setIsBannerDisplayed, username]);

  const onClose = async () => {
    const result = await dispatch(
      openModal({
        modalType: SHOW_MODAL_PROCEED_USERNAME,
      }),
    );

    if (result.payload) {
      setIsBannerDisplayed(false);
    }
  };

  const location = useLocation();

  return isBannerDisplayed ? (
    <Wrapper>
      <WrapperLink
        to={{
          pathname: '/settings',
          state: { fromPage: location.pathname, isUsernameActive: true },
        }}>
        <Header>Reserve your P2P username now</Header>
        <Text>
          Any token can be received using username regardless of whether it is in your wallets list
        </Text>
      </WrapperLink>
      <CloseButton type="button" onClick={onClose}>
        <CloseIcon name="close" />
      </CloseButton>
    </Wrapper>
  ) : null;
};
