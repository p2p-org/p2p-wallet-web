import type { FunctionComponent } from 'react';
import { useHistory } from 'react-router';

import { styled } from '@linaria/react';
import type { PublicKey } from '@solana/web3.js';
import { Feature } from 'flagged';
import { rgba } from 'polished';

import { ModalType, useModals } from 'app/contexts/general/modals';
import { useSettings, useTokenAccountIsHidden } from 'app/contexts/general/settings';
import { Widget } from 'components/common/Widget';
import { Button, Icon, Switch } from 'components/ui';
import { FEATURE_SETTINGS_CLOSE_ACCOUNT } from 'config/featureFlags';

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
  publicKey: PublicKey;
  tokenName: string;
  isZeroBalance: boolean;
};

export const TokenSettingsWidget: FunctionComponent<Props> = ({
  publicKey,
  tokenName,
  isZeroBalance,
}) => {
  const history = useHistory();
  const { openModal } = useModals();
  const { toggleHideTokenAccount } = useSettings();
  const isHidden = useTokenAccountIsHidden(publicKey);

  const handleCloseTokenAccountClick = () => {
    void openModal(ModalType.SHOW_MODAL_CLOSE_TOKEN_ACCOUNT, { publicKey, tokenName, history });
  };

  const handleHideTokenClick = (pubKey: PublicKey) => () => {
    const tokenAddress = pubKey.toBase58();
    toggleHideTokenAccount(tokenAddress, isZeroBalance);
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
    <Widget
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
    </Widget>
  );
};
