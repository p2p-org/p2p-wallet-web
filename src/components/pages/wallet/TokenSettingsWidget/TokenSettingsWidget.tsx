import React, { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import * as web3 from '@solana/web3.js';

import { Widget } from 'components/common/Widget';
import { Button, Icon } from 'components/ui';
import { openModal } from 'store/actions/modals';
import { SHOW_MODAL_CLOSE_TOKEN_ACCOUNT } from 'store/constants/modalTypes';

const WrapperWidget = styled(Widget)``;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const TokenSettingsIconWrapper = styled.div`
  display: flex;
  align-items: center;

  margin-right: 20px;
  padding: 8px;

  background-color: #5887ff;

  border-radius: 12px;
`;

const TokenSettingsIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #fff;
`;

const Settings = styled.div`
  display: flex;
  flex-direction: column;

  padding: 42px 20px 20px;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
`;

const ButtonStyled = styled(Button)`
  width: fit-content;
  padding: 0;

  &:disabled {
    color: #a3a5ba;

    background: #fff;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;

  margin-right: 20px;
  padding: 8px;

  background: #f6f6f8;
  border-radius: 12px;
`;

const CloseAccountIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #a3a5ba;
`;

type Props = {
  publicKey: web3.PublicKey;
  tokenName: string;
  isBalanceEmpty: boolean;
};

export const TokenSettingsWidget: FunctionComponent<Props> = ({
  publicKey,
  tokenName,
  isBalanceEmpty,
}) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const handleCloseTokenAccountClick = () => {
    dispatch(openModal(SHOW_MODAL_CLOSE_TOKEN_ACCOUNT, { publicKey, tokenName, history }));
  };

  const renderSettings = () => {
    return (
      <ButtonStyled
        disabled={isBalanceEmpty}
        small
        title="Close token account"
        onClick={handleCloseTokenAccountClick}>
        <SettingItem>
          <IconWrapper>
            <CloseAccountIcon name="bucket" />
          </IconWrapper>
          Close token account
        </SettingItem>
      </ButtonStyled>
    );
  };

  return (
    <WrapperWidget
      title={
        <TitleWrapper>
          <TokenSettingsIconWrapper>
            <TokenSettingsIcon name="gear" />
          </TokenSettingsIconWrapper>
          Wallet settings
        </TitleWrapper>
      }>
      <Settings>{renderSettings()}</Settings>
    </WrapperWidget>
  );
};
