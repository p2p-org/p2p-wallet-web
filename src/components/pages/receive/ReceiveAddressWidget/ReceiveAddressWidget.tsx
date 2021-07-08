import React, { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { rgba } from 'polished';
import QRCode from 'qrcode.react';

import tokenList from 'api/token/token.config';
import { TokenAccount } from 'api/token/TokenAccount';
import { Hint } from 'components/common/Hint';
import { ToastManager } from 'components/common/ToastManager';
import { WidgetPage } from 'components/common/WidgetPage';
import { Avatar, Icon, Tooltip } from 'components/ui';
import { trackEvent } from 'utils/analytics';
import { askClipboardWritePermission, setToClipboard } from 'utils/clipboard';
import { getExplorerUrl } from 'utils/connection';

import ethLogo from './ETH-logo.png';
import ftxLogo from './FTX-logo.png';

const WrapperWidgetPage = styled(WidgetPage)``;

const QRWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 32px 20px 36px;

  border-bottom: 1px solid ${rgba('#000', 0.05)};
`;

const QRContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const QRText = styled.div`
  display: flex;
  align-items: center;

  color: #202020;
  font-weight: 600;
  font-size: 18px;
  line-height: 120%;
`;

const TooltipContent = styled.div`
  max-width: 318px;
`;

const TooltipTitle = styled.span`
  display: block;
  margin-bottom: 10px;

  color: #fff;
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
`;

const TooltipText = styled.span`
  display: block;

  color: #fff;
  font-weight: 400;
  font-size: 14px;
  line-height: 140%;
`;

const QRCodeWrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-top: 20px;
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

const CopyIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const Address = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  margin-top: 32px;
  padding: 0 16px;

  color: #202020;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;

  background: #f6f6f8;
  border-radius: 12px;
  cursor: pointer;

  &:hover {
    color: #458aff;

    ${CopyIcon} {
      color: #458aff;
    }
  }

  &.isAddressCopied {
    color: #2db533;
  }
`;

const BottomInfo = styled.div`
  display: flex;

  justify-content: space-between;
  padding: 15px 20px;

  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

const ExplorerA = styled.a`
  color: #a3a5ba;

  &:hover {
    color: #458aff;
  }
`;

const TokensWrapper = styled.div`
  display: flex;

  align-items: center;
  justify-content: center;

  margin-top: 24px;
`;

const AvatarStyled = styled(Avatar)`
  margin-left: -13px;
  border-radius: 50%;
`;

const InfoBadge = styled.span`
  margin-left: -13px;
  padding: 4px 6px;

  color: #fff;
  font-weight: 600;
  font-size: 12px;

  border-radius: 12px;
  background: #202020;
  cursor: pointer;
  opacity: 0.8;

  &:hover {
    background: #458aff;
    opacity: 1;
  }
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

export const ReceiveAddressWidget: FC = () => {
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [isImageCopyAvailable, setIsImageCopyAvailable] = useState(false);
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const cluster = useSelector((state) => state.wallet.network.cluster);

  const availableTokenAccounts = useSelector((state) =>
    state.wallet.tokenAccounts.map((itemToken) => TokenAccount.from(itemToken)),
  );
  const publicKey = useSelector((state) => state.wallet.publicKey);
  const solAccount = useMemo(
    () => availableTokenAccounts.find((account) => account.address.toBase58() === publicKey),
    [availableTokenAccounts, publicKey],
  );

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

  if (!solAccount) {
    return null;
  }

  return (
    <div>
      <WrapperWidgetPage title="Receive" icon="bottom">
        <QRWrapper>
          <QRContent>
            <QRText>One unified address to receive SOL or SPL Tokens</QRText>
            <QRCodeWrapper
              className={classNames({ isImageCopyAvailable })}
              onClick={isImageCopyAvailable ? handleImageCopyClick : undefined}>
              {isImageCopied ? (
                <QRCopiedWrapper>
                  <QRCopied>Copied</QRCopied>
                </QRCopiedWrapper>
              ) : undefined}
              <QRCode id="qrcode" value={solAccount.address.toBase58()} size={150} />
            </QRCodeWrapper>
          </QRContent>
          <TokensWrapper>
            <AvatarStyled
              src={tokenList.getList().find((token) => token.symbol === 'SOL')?.logoURI}
              size={32}
            />
            <AvatarStyled src={ethLogo} size={32} />
            <AvatarStyled
              src={tokenList.getList().find((token) => token.symbol === 'BTC')?.logoURI}
              size={32}
            />
            <AvatarStyled src={ftxLogo} size={32} />
            <Tooltip title={<InfoBadge>30+</InfoBadge>} noOpacity>
              <TooltipContent>
                <TooltipTitle>One address for any SPL Tokens</TooltipTitle>
                <TooltipText>
                  The Solana Program Library (SPL) is a collection of on-chain programs maintained
                  by the Solana team. The SPL Token program is the token standard of the Solana
                  blockchain.
                  <br />
                  <br />
                  Similar to ERC20 tokens on the Ethereum network, SPL Tokens are designed for DeFi
                  applications. SPL Tokens can be traded on Serum, a Solana based decentralized
                  exchange and FTX.
                </TooltipText>
              </TooltipContent>
            </Tooltip>
          </TokensWrapper>
          <Address
            className={classNames({ isAddressCopied })}
            onClick={handleCopyClick(solAccount.address.toBase58(), setIsAddressCopied)}>
            {isAddressCopied ? 'Address Copied!' : solAccount.address.toBase58()}

            <CopyIcon name="copy" />
          </Address>
        </QRWrapper>
        <BottomInfo>
          <ExplorerA
            href={getExplorerUrl('address', solAccount.address.toBase58(), cluster)}
            target="_blank"
            rel="noopener noreferrer noindex"
            className="button">
            View in Solana explorer
          </ExplorerA>
        </BottomInfo>
      </WrapperWidgetPage>
      <Hint />
    </div>
  );
};
