import React, { FunctionComponent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import * as web3 from '@solana/web3.js';
import { rgba } from 'polished';
import QRCode from 'qrcode.react';

import tokenConfig from 'api/token/token.config';
import { TokenAccount } from 'api/token/TokenAccount';
import { Card } from 'components/common/Card';
import { ToastManager } from 'components/common/ToastManager';
import { Icon } from 'components/ui';
import { RootState } from 'store/rootReducer';

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
  margin: 20px 0;

  color: #202020;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
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
  const cluster = useSelector((state: RootState) => state.wallet.cluster);
  const tokenAccounts = useSelector((state: RootState) => state.wallet.tokenAccounts);
  const tokenAccount = useMemo(() => {
    const foundToken = tokenAccounts.find((account) => account.address === publicKey.toBase58());
    return foundToken && TokenAccount.from(foundToken);
  }, [tokenAccounts, publicKey]);

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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const imageSettings: QRCode.ImageSettings = {
    height: 28,
    width: 28,
  };

  if (tokenAccount.mint.symbol === 'SOL') {
    imageSettings.src =
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png';
  } else {
    const iconSrc = tokenConfig[cluster]?.find(
      (token) => token.tokenSymbol === tokenAccount.mint.symbol,
    )?.icon;

    if (iconSrc) {
      imageSettings.src = iconSrc;
    }
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
            <Text>Send to your {tokenAccount.mint.symbol} wallet</Text>
            <QRCode
              value={tokenAccount.address.toBase58()}
              imageSettings={imageSettings}
              size={140}
            />
            <Text>maxburlak.p2pw.org</Text>
          </Content>
          <Footer>
            All deposits are stored 100% non-custodiallity with keys held on this device
          </Footer>
        </>
      ) : undefined}
    </WrapperCard>
  );
};
