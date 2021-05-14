import React, { FunctionComponent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import * as web3 from '@solana/web3.js';
import classNames from 'classnames';
import { rgba } from 'polished';
import QRCode from 'qrcode.react';

import tokenList from 'api/token/token.config';
import { TokenAccount } from 'api/token/TokenAccount';
import { Card } from 'components/common/Card';
import { ToastManager } from 'components/common/ToastManager';
import { Icon } from 'components/ui';
import { setToClipboard } from 'utils/clipboard';

const WrapperCard = styled(Card)`
  flex: 1;
  padding: 0;
`;

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 8px 0 20px;
`;

const TokenWrapper = styled.div`
  flex: 1;
  margin-right: 7px;
`;

const CopiedText = styled.div`
  color: #2db533;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
`;

const TokenName = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
`;

const TokenAddress = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;

  cursor: pointer;
`;

const ExpandWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;

  border-radius: 12px;

  cursor: pointer;

  &:hover {
    background: #f6f6f8;
  }
`;

const ExpandIcon = styled(Icon)`
  width: 32px;
  height: 32px;

  color: #5887ff;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  border-top: 1px solid ${rgba('#000', 0.05)};
`;

const Text = styled.div`
  margin-top: 20px;

  color: #202020;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const QRCodeWrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 3px 0 15px;
  padding: 17px;

  border-radius: 12px;

  &.isImageCopyAvailable:hover {
    background: #f6f6f8;
    cursor: pointer;
  }
`;

const QRCopiedWrapper = styled.div`
  position: absolute;
  right: 0;
  bottom: 10px;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const QRCopied = styled.div`
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

const Footer = styled.div`
  padding: 12px 20px 14px;

  color: #a3a5ba;
  font-size: 14px;
  line-height: 21px;
  text-align: center;

  border-top: 1px solid ${rgba('#000', 0.05)};
`;

type Props = {
  publicKey: web3.PublicKey;
  className?: string;
};

export const QRAddressWidget: FunctionComponent<Props> = ({ publicKey, className }) => {
  const [copied, setCopied] = useState(false);
  const [isExpand, setIsExpand] = useState(false);
  const [isImageCopyAvailable] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const cluster = useSelector((state) => state.wallet.cluster);
  const tokenAccounts = useSelector((state) => state.wallet.tokenAccounts);
  const tokenAccount = useMemo(() => {
    const foundToken = tokenAccounts.find((account) => account.address === publicKey.toBase58());
    return foundToken && TokenAccount.from(foundToken);
  }, [tokenAccounts, publicKey]);

  // useEffect(() => {
  //   askClipboardWritePermission()
  //     .then((state) => setIsImageCopyAvailable(state))
  //     .catch(() => setIsImageCopyAvailable(false));
  // }, []);

  if (!tokenAccount) {
    return null;
  }

  const handleExpandClick = () => {
    setIsExpand(!isExpand);
  };

  const handleCopyClick = () => {
    try {
      void navigator.clipboard.writeText(tokenAccount.address.toBase58());
      setCopied(true);
      ToastManager.info(`Wallet Address Copied!`);

      // fade copied after some seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const qrImageSettings: QRCode.ImageSettings = {
    height: 28,
    width: 28,
  };

  const iconSrc = tokenList
    .filterByClusterSlug(cluster)
    .getList()
    .find((token) => token.symbol === tokenAccount.mint.symbol)?.logoURI;

  if (iconSrc) {
    qrImageSettings.src = iconSrc;
  }

  return (
    <WrapperCard className={className} withShadow>
      <HeaderWrapper>
        <TokenWrapper>
          {copied ? (
            <CopiedText>Wallet Address Copied!</CopiedText>
          ) : (
            <TokenName>Wallet Address</TokenName>
          )}
          <TokenAddress onClick={handleCopyClick}>{tokenAccount.address.toBase58()}</TokenAddress>
        </TokenWrapper>
        <ExpandWrapper onClick={handleExpandClick}>
          <ExpandIcon name="qr" />
        </ExpandWrapper>
      </HeaderWrapper>
      {isExpand ? (
        <>
          <Content>
            <Text>Scan QR code or copy wallet address</Text>
            <QRCodeWrapper
              className={classNames({ isImageCopyAvailable })}
              onClick={isImageCopyAvailable ? handleImageCopyClick : undefined}>
              {isImageCopied ? (
                <QRCopiedWrapper>
                  <QRCopied>Copied</QRCopied>
                </QRCopiedWrapper>
              ) : undefined}
              <QRCode
                id="qrcode"
                value={tokenAccount.address.toBase58()}
                imageSettings={qrImageSettings}
                size={140}
                renderAs="canvas"
              />
            </QRCodeWrapper>
          </Content>
          <Footer>
            All deposits are stored 100% non-custodiallity with keys held on this device
          </Footer>
        </>
      ) : undefined}
    </WrapperCard>
  );
};
