import React, { FC, useEffect, useState } from 'react';

import { styled } from '@linaria/react';
import QRCode from 'qrcode.react';

import Logo from 'assets/images/logo.png';
import { AddressText } from 'components/common/AddressText';
import { ToastManager } from 'components/common/ToastManager';
import { Button } from 'components/ui';
import { askClipboardWritePermission, setToClipboard } from 'utils/clipboard';

const Wrapper = styled.div``;

const UsernameAddressWrapper = styled.div`
  display: flex;
  margin-bottom: 16px;
  padding: 32px;

  box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
`;

const QRCodeWrapper = styled.div`
  margin-right: 30px;
`;

const UsernameAddress = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.div`
  margin-bottom: 16px;

  font-weight: 600;
  font-size: 20px;
`;

const LogoImg = styled.img`
  width: 108px;
  height: 38px;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const ButtonStyled = styled(Button)`
  margin-right: 8px;
`;

type Props = {
  address: string;
  username?: string;
};

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

export const UsernameAddressWidget: FC<Props> = ({ address, username }) => {
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
          <QRCode id="qrcode" value={address} size={150} />
        </QRCodeWrapper>
        <UsernameAddress>
          {username ? <Username>{username}</Username> : undefined}
          <AddressText address={address} medium />
          <LogoImg src={Logo} />
        </UsernameAddress>
      </UsernameAddressWrapper>
      <ButtonsWrapper>
        {username ? (
          <ButtonStyled hollow onClick={handleCopyClick(username, 'Username')}>
            Copy username
          </ButtonStyled>
        ) : undefined}
        <ButtonStyled hollow onClick={handleCopyClick(address, 'Address')}>
          Copy address
        </ButtonStyled>
        <ButtonStyled hollow onClick={isImageCopyAvailable ? handleImageCopyClick : undefined}>
          Copy QR code
        </ButtonStyled>
      </ButtonsWrapper>
    </Wrapper>
  );
};
