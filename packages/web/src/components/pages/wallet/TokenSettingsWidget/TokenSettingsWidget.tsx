import type { FunctionComponent } from 'react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import type * as web3 from '@solana/web3.js';
import { Feature } from 'flagged';
import { rgba } from 'polished';

import { Widget } from 'components/common/Widget';
import { Button, Icon, Switch } from 'components/ui';
import { FEATURE_SETTINGS_CLOSE_ACCOUNT } from 'config/featureFlags';
import { openModal } from 'store/actions/modals';
import { SHOW_MODAL_CLOSE_TOKEN_ACCOUNT } from 'store/constants/modalTypes';
import type { RootState } from 'store/rootReducer';
import { updateHiddenTokens } from 'store/slices/wallet/WalletSlice';
import {
  hideUnhideToken,
  hideUnhideZeroBalanceToken,
  loadHiddenTokens,
  removeHiddenToken,
  removeZeroBalanceToken,
} from 'utils/settings';

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

  padding: 16px 20px 0;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 20px 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${rgba('#000', 0.05)};
  }
`;

const ButtonStyled = styled(Button)`
  width: fit-content;
  padding: 0;

  &:disabled {
    color: #a3a5ba;

    background: #fff !important;
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

const StyledIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #a3a5ba;
`;

const Text = styled.div`
  flex-grow: 1;

  font-weight: 600;
  font-size: 16px;
`;

const Warning = styled.div`
  display: flex;
  align-items: center;
`;

const WarningIcon = styled(Icon)`
  margin-left: 10px;
  width: 18px;
  height: 18px;

  color: #ffa631;
`;

type Props = {
  publicKey: web3.PublicKey;
  tokenName: string;
  isZeroBalance: boolean;
};

export const TokenSettingsWidget: FunctionComponent<Props> = ({
  publicKey,
  tokenName,
  isZeroBalance,
}) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const { isZeroBalancesHidden } = useSelector((state: RootState) => state.wallet.settings);
  const zeroBalanceTokens = useSelector((state: RootState) => state.wallet.zeroBalanceTokens) || [];

  const hiddenTokens = loadHiddenTokens();
  const isHidden =
    (isZeroBalancesHidden && isZeroBalance && !zeroBalanceTokens.includes(publicKey.toBase58())) ||
    hiddenTokens.has(publicKey.toBase58());

  const handleCloseTokenAccountClick = () => {
    void dispatch(
      openModal({
        modalType: SHOW_MODAL_CLOSE_TOKEN_ACCOUNT,
        props: { publicKey, tokenName, history },
      }),
    );
  };

  const handleHideTokenClick = (pubKey: web3.PublicKey) => () => {
    const tokenAddress = pubKey.toBase58();
    if (isZeroBalancesHidden && isZeroBalance) {
      hideUnhideZeroBalanceToken(tokenAddress);
      removeHiddenToken(tokenAddress);
    } else {
      hideUnhideToken(tokenAddress);
      removeZeroBalanceToken(tokenAddress);
    }

    dispatch(updateHiddenTokens());
  };

  const renderSettings = () => {
    return (
      <>
        <SettingItem>
          <IconWrapper>
            <StyledIcon name="eye-hide" />
          </IconWrapper>
          <Text>Hide in token list</Text>
          <Switch checked={isHidden} onChange={handleHideTokenClick(publicKey)} />
        </SettingItem>
        <Feature name={FEATURE_SETTINGS_CLOSE_ACCOUNT}>
          <SettingItem>
            <ButtonStyled
              disabled={!isZeroBalance}
              small
              title="Close token account"
              onClick={handleCloseTokenAccountClick}
            >
              <IconWrapper>
                <StyledIcon name="bucket" />
              </IconWrapper>
              Close token account
            </ButtonStyled>
            {!isZeroBalance ? (
              <Warning>
                <Text>Token account should be zero</Text>
                <WarningIcon name="warning" />
              </Warning>
            ) : undefined}
          </SettingItem>
        </Feature>
      </>
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
      }
    >
      <Settings>{renderSettings()}</Settings>
    </WrapperWidget>
  );
};
