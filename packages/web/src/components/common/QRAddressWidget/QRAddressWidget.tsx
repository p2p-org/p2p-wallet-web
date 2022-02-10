import type { FunctionComponent } from 'react';
import { memo, useEffect, useState } from 'react';

import { styled } from '@linaria/react';
import { useConnectionContext, useTokenAccount, useWallet } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import classNames from 'classnames';
import { rgba } from 'polished';
import QRCode from 'qrcode.react';

import { Card } from 'components/common/Card';
import { ToastManager } from 'components/common/ToastManager';
import { Button, Icon } from 'components/ui';
import { trackEvent } from 'utils/analytics';
import { askClipboardWritePermission, setToClipboard } from 'utils/clipboard';
import { getExplorerUrl } from 'utils/connection';

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

  margin: 20px 0;
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

const Details = styled.div`
  border-top: 1px solid ${rgba('#000', 0.05)};
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 20px;

  &:not(:last-child) {
    border-bottom: 1px solid ${rgba('#000', 0.05)};
  }
`;

const FieldGroup = styled.div``;

const FieldTitle = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
`;

const FieldValue = styled.div`
  margin-top: 4px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;

  cursor: pointer;

  &:hover {
    color: #5887ff;
  }
`;

export const ShareIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

export const ShareWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-left: 20px;

  background: rgba(163, 165, 186, 0.1);
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #eff3ff;

    ${ShareIcon} {
      color: #5887ff;
    }
  }
`;

const Footer = styled.div`
  padding: 20px;

  color: #a3a5ba;
  font-size: 14px;
  line-height: 21px;
  text-align: center;

  border-top: 1px solid ${rgba('#000', 0.05)};
`;

type Props = {
  publicKey: string;
  className?: string;
};

export const QRAddressWidgetOrigin: FunctionComponent<Props> = ({ publicKey, className }) => {
  const [copied, setCopied] = useState(false);
  const [isExpand, setIsExpand] = useState(false);
  const [isShowDetails, setIsShowDetails] = useState(false);
  const [isImageCopyAvailable, setIsImageCopyAvailable] = useState(false);
  const [isImageCopied, setIsImageCopied] = useState(false);
  const { network } = useConnectionContext();
  const { publicKey: solPublicKey } = useWallet();

  const tokenAccount = useTokenAccount(usePubkey(publicKey));

  useEffect(() => {
    askClipboardWritePermission()
      .then((state) => setIsImageCopyAvailable(state))
      .catch(() => setIsImageCopyAvailable(false));
  }, []);

  if (!tokenAccount) {
    return null;
  }

  const handleExpandClick = () => {
    setIsExpand(!isExpand);

    if (!isExpand) {
      trackEvent('wallet_qr_click');
    }
  };

  const handleCopyClick = (type: 'sol' | 'token' | 'mint', address: string) => () => {
    try {
      void navigator.clipboard.writeText(address);
      setCopied(true);
      ToastManager.info(`Address Copied!`);

      if (type === 'sol') {
        trackEvent('wallet_sol_address_copy');
      } else if (type === 'token') {
        trackEvent('wallet_token_address_copy');
      } else if (type === 'mint') {
        trackEvent('wallet_mint_address_copy');
      }

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

  const handleToggleAddressDetailsClick = () => {
    setIsShowDetails((state) => !state);
  };

  if (!solPublicKey) {
    return null;
  }

  return (
    <WrapperCard className={className}>
      <HeaderWrapper>
        <TokenWrapper>
          {copied ? (
            <CopiedText>Wallet Address Copied!</CopiedText>
          ) : (
            <TokenName>Wallet Address</TokenName>
          )}
          <TokenAddress onClick={handleCopyClick('sol', solPublicKey.toBase58())}>
            {solPublicKey.toBase58()}
          </TokenAddress>
        </TokenWrapper>
        <ExpandWrapper onClick={handleExpandClick}>
          <ExpandIcon name="qr" />
        </ExpandWrapper>
      </HeaderWrapper>
      {isExpand ? (
        <>
          <Content>
            <Text>Scan or copy QR code</Text>
            <QRCodeWrapper
              className={classNames({ isImageCopyAvailable })}
              onClick={isImageCopyAvailable ? handleImageCopyClick : undefined}
            >
              {isImageCopied ? (
                <QRCopiedWrapper>
                  <QRCopied>Copied</QRCopied>
                </QRCopiedWrapper>
              ) : undefined}
              <QRCode id="qrcode" value={solPublicKey.toBase58()} size={150} />
            </QRCodeWrapper>
          </Content>
          {isShowDetails ? (
            <Details>
              <DetailRow>
                <FieldGroup>
                  <FieldTitle>Direct {tokenAccount.balance?.token.symbol} Address</FieldTitle>
                  {tokenAccount.key ? (
                    <FieldValue onClick={handleCopyClick('token', tokenAccount.key.toBase58())}>
                      {tokenAccount.key.toBase58()}
                    </FieldValue>
                  ) : undefined}
                </FieldGroup>
                {tokenAccount.key ? (
                  <a
                    href={getExplorerUrl('address', tokenAccount?.key.toBase58(), network)}
                    target="_blank"
                    rel="noopener noreferrer noindex"
                    className="button"
                  >
                    <ShareWrapper>
                      <ShareIcon name="external" />
                    </ShareWrapper>
                  </a>
                ) : undefined}
              </DetailRow>
              <DetailRow>
                <FieldGroup>
                  <FieldTitle>{tokenAccount.balance?.token.symbol} Mint Address</FieldTitle>
                  {tokenAccount.balance ? (
                    <FieldValue
                      onClick={handleCopyClick('mint', tokenAccount.balance?.token.address)}
                    >
                      {tokenAccount.balance?.token.address}
                    </FieldValue>
                  ) : undefined}
                </FieldGroup>
                {tokenAccount.balance ? (
                  <a
                    href={getExplorerUrl('address', tokenAccount.balance?.token.address, network)}
                    target="_blank"
                    rel="noopener noreferrer noindex"
                    className="button"
                  >
                    <ShareWrapper>
                      <ShareIcon name="external" />
                    </ShareWrapper>
                  </a>
                ) : undefined}
              </DetailRow>
            </Details>
          ) : undefined}
          <Footer>
            <Button lightGray onClick={handleToggleAddressDetailsClick}>
              {isShowDetails ? 'Hide address details' : 'Show address details'}
            </Button>
          </Footer>
        </>
      ) : undefined}
    </WrapperCard>
  );
};

export const QRAddressWidget = memo(QRAddressWidgetOrigin);
