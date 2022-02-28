import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { styled } from '@linaria/react';
import { borders, shadows, theme, up, useIsMobile, useIsTablet } from '@p2p-wallet-web/ui';
import QRCode from 'qrcode.react';

import Logo from 'assets/images/logo.png';
import { AddressText } from 'components/common/AddressText';
import { ToastManager } from 'components/common/ToastManager';
import { Button } from 'components/ui';
import { trackEvent } from 'utils/analytics';
import { askClipboardWritePermission, setToClipboard } from 'utils/clipboard';

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
  ${borders.primaryRGBA}
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

type Type = 'receive';
type CopyType = 'Username' | 'Address';

const handleCopyClick = (type: Type, value: string, text: CopyType) => () => {
  if (type === 'receive') {
    switch (text) {
      case 'Username':
        trackEvent('Receive_Username_Copied');
        break;
      case 'Address':
        trackEvent('Receive_Address_Copied');
    }
  }

  return copy(value, text);
};

type Props = {
  type: Type;
  address: string;
  username?: string;
};

export const UsernameAddressWidget: FC<Props> = ({ type, address, username }) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const [isImageCopyAvailable, setIsImageCopyAvailable] = useState(false);

  useEffect(() => {
    askClipboardWritePermission()
      .then((state) => setIsImageCopyAvailable(state))
      .catch(() => setIsImageCopyAvailable(false));
  }, []);

  const handleImageCopyClick = () => {
    const qrElement = document.querySelector<HTMLCanvasElement>('#qrcode');
    if (!qrElement) {
      return;
    }

    try {
      qrElement.toBlob((blob: Blob | null) => setToClipboard(blob));
      ToastManager.info('QR code Copied!');

      trackEvent('Receive_QR_Saved');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Wrapper>
      <UsernameAddressWrapper>
        {isMobile && username ? <Username>{username}</Username> : undefined}
        <QRCodeWrapper>
          <QRCode id="qrcode" value={address} size={isMobile ? 237 : 122} />
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
            onClick={handleCopyClick(type, username, 'Username')}
          >
            Copy username
          </Button>
        ) : undefined}
        <Button
          small={!isMobile}
          medium={isMobile}
          hollow
          onClick={handleCopyClick(type, address, 'Address')}
        >
          Copy address
        </Button>
        <Button
          small={!isMobile}
          medium={isMobile}
          hollow
          onClick={isImageCopyAvailable ? handleImageCopyClick : undefined}
        >
          Copy QR code
        </Button>
      </ButtonsWrapper>
    </Wrapper>
  );
};
