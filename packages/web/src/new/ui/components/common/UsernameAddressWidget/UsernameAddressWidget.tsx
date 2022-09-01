import type { FC } from 'react';

import { styled } from '@linaria/react';
import { borders, shadows, theme, up, useIsMobile, useIsTablet } from '@p2p-wallet-web/ui';
import QRCode from 'qrcode.react';

import { ToastManager } from 'components/common/ToastManager';
import Logo from 'new/ui/assets/images/logo.png';
import { AddressText } from 'new/ui/components/common/AddressText';
import { Button } from 'new/ui/components/ui/Button';
import { setToClipboard } from 'new/utils/Clipboard';
import { browserName, BrowserNames } from 'new/utils/UserAgent';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 16px;
`;

const UsernameAddressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  grid-gap: 8px;
  align-items: center;
  padding: 24px 16px 16px;

  text-align: center;

  border-radius: 12px;
  ${borders.primary}
  ${shadows.card};

  ${up.tablet} {
    flex-direction: row;
    padding: 16px 30px 16px 16px;

    text-align: left;
  }
`;

const QRCodeWrapper = styled.div`
  padding: 15px;
`;

const AddressWrapper = styled.div`
  ${up.tablet} {
    display: grid;
    grid-gap: 16px;
  }
`;

const AddressTextStyled = styled(AddressText)`
  padding: 12px 26px;

  ${up.tablet} {
    padding: 0;
  }
`;

const Username = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
`;

const LogoImg = styled.img`
  width: auto;
  height: 30px;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-auto-flow: dense;
  grid-gap: 8px;

  ${up.tablet} {
    grid-auto-flow: column;
  }
`;

const copy = (value: string, text: string) => {
  try {
    void navigator.clipboard.writeText(value);
    ToastManager.info(`${text} copied!`);
  } catch (error) {
    console.error(error);
  }
};

const QR_CODE_SIZE_MOBILE = 237;
const QR_CODE_SIZE = 122;

type Props = {
  address: string;
  username?: string;
};

export const UsernameAddressWidget: FC<Props> = ({ address, username }) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const qrCopyEnabled = browserName !== BrowserNames.FIREFOX;

  const handleImageCopyClick = () => {
    const showNotification = () => {
      ToastManager.info('QR code Copied!');
      // trackEvent('Receive_QR_Saved');
    };

    const qrElement = document.querySelector<HTMLCanvasElement>('#qrcode');
    if (!qrElement) {
      return;
    }

    void setToClipboard(qrElement, showNotification);
  };

  return (
    <Wrapper>
      <UsernameAddressWrapper>
        {isMobile && username ? <Username>{username}</Username> : undefined}
        <QRCodeWrapper>
          <QRCode
            id="qrcode"
            value={address}
            size={isMobile ? QR_CODE_SIZE_MOBILE : QR_CODE_SIZE}
          />
        </QRCodeWrapper>
        <AddressWrapper>
          {isTablet && username ? <Username>{username}</Username> : undefined}
          <AddressTextStyled address={address} small />
          {isTablet ? <LogoImg src={Logo} /> : undefined}
        </AddressWrapper>
      </UsernameAddressWrapper>
      <ButtonsWrapper>
        {username ? (
          <Button
            small={!isMobile}
            medium={isMobile}
            hollow
            onClick={() => copy(username, 'Username')}
          >
            Copy username
          </Button>
        ) : undefined}
        <Button small={!isMobile} medium={isMobile} hollow onClick={() => copy(address, 'Address')}>
          Copy address
        </Button>
        {qrCopyEnabled ? (
          <Button small={!isMobile} medium={isMobile} hollow onClick={handleImageCopyClick}>
            Copy QR code
          </Button>
        ) : null}
      </ButtonsWrapper>
    </Wrapper>
  );
};
