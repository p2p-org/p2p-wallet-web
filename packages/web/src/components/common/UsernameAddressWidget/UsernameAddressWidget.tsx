import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { styled } from '@linaria/react';
import { borders, shadows, theme, up, useIsMobile } from '@p2p-wallet-web/ui';
import QRCode from 'qrcode.react';

import Logo from 'assets/images/logo.png';
import { AddressText } from 'components/common/AddressText';
import { ToastManager } from 'components/common/ToastManager';
import { Button } from 'components/ui';
import { askClipboardWritePermission, setToClipboard } from 'utils/clipboard';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 16px;
`;

const UsernameAddressWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 30px;

  border-radius: 12px;
  ${borders.primaryRGBA}
  ${shadows.card};
`;

const QRCodeWrapper = styled.div`
  margin-right: 30px;
`;

const UsernameAddress = styled.div`
  display: grid;
  grid-gap: 16px;
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
    ToastManager.info(`${text} Copied!`);
  } catch (error) {
    console.error(error);
  }
};

const handleCopyClick = (value: string, text: string) => () => {
  return copy(value, text);
};

type Props = {
  address: string;
  username?: string;
};

export const UsernameAddressWidget: FC<Props> = ({ address, username }) => {
  const isMobile = useIsMobile();

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
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Wrapper>
      <UsernameAddressWrapper>
        <QRCodeWrapper>
          <QRCode id="qrcode" value={address} size={122} />
        </QRCodeWrapper>
        <UsernameAddress>
          {username ? <Username>{username}</Username> : undefined}
          <AddressText address={address} small />
          <LogoImg src={Logo} />
        </UsernameAddress>
      </UsernameAddressWrapper>
      <ButtonsWrapper>
        {username ? (
          <Button
            small={!isMobile}
            medium={isMobile}
            hollow
            onClick={handleCopyClick(username, 'Username')}
          >
            Copy username
          </Button>
        ) : undefined}
        <Button
          small={!isMobile}
          medium={isMobile}
          hollow
          onClick={handleCopyClick(address, 'Address')}
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
