import React, { FC, useEffect, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import QRCode from 'qrcode.react';

import { ToastManager } from 'components/common/ToastManager';
import { TextField } from 'components/ui';
import { trackEvent } from 'utils/analytics';
import { askClipboardWritePermission, setToClipboard } from 'utils/clipboard';

import { TextFieldStyled } from './styled';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding: 16px 24px;
`;

export const QRWrapper = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;

  border: 1px solid #f6f6f8;
  border-radius: 12px;
`;

export const QrTextField = styled(TextField)`
  border: none;
  border-radius: unset;

  border-bottom: 1px solid #f6f6f8;
`;

export const QRCodeWrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 16px 0;

  border-radius: 12px;

  &.isImageCopyAvailable:hover {
    background: #f6f6f8;
    cursor: pointer;
  }
`;

export const QRCopiedWrapper = styled.div`
  position: absolute;
  right: 0;
  bottom: 10px;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const QRCopied = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  height: 29px;
  padding: 0 11px;

  color: #5887ff;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;

  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const copy = (value: string, cb: (state: boolean) => void) => {
  try {
    void navigator.clipboard.writeText(value);
    cb(true);
    ToastManager.info(`${value} Address Copied!`);

    // fade copied after some seconds
    setTimeout(() => {
      cb(false);
    }, 2000);
  } catch (error) {
    console.error(error);
  }
};

const handleCopyClick = (value: string, cb: (state: boolean) => void) => () => {
  trackEvent('receive_address_copy');
  return copy(value, cb);
};

export const AddressQRCodePanel: FC<{ address: string }> = ({ address }) => {
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [isImageCopyAvailable, setIsImageCopyAvailable] = useState(false);
  const [isAddressCopied, setIsAddressCopied] = useState(false);

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
      setIsImageCopied(true);

      // fade copied after some seconds
      setTimeout(() => {
        setIsImageCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Wrapper>
      <TextFieldStyled
        label="Address"
        icon="copy"
        value={isAddressCopied ? 'Address Copied!' : address}
        onClick={handleCopyClick(address, setIsAddressCopied)}
      />
      <QRWrapper>
        <QrTextField
          label="QR code"
          icon="qr"
          value={isImageCopied ? 'QR code Copied!' : 'Click to copy'}
          onClick={isImageCopyAvailable ? handleImageCopyClick : undefined}
        />
        <QRCodeWrapper
          className={classNames({ isImageCopyAvailable })}
          onClick={isImageCopyAvailable ? handleImageCopyClick : undefined}>
          {isImageCopied ? (
            <QRCopiedWrapper>
              <QRCopied>Copied</QRCopied>
            </QRCopiedWrapper>
          ) : undefined}
          <QRCode id="qrcode" value={address} size={150} />
        </QRCodeWrapper>
      </QRWrapper>
    </Wrapper>
  );
};
