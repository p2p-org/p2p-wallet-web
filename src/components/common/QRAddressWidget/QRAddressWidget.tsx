import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import * as web3 from '@solana/web3.js';
import { rgba } from 'polished';
import QRCode from 'qrcode.react';

import tokenConfig from 'api/token/token.config';
import { TokenAccount } from 'api/token/TokenAccount';
import { Card } from 'components/common/Card';
import { Icon } from 'components/ui';
import { RootState } from 'store/rootReducer';

const WrapperCard = styled(Card)`
  flex: 1;
  padding: 0;
`;

const HeaderWrapper = styled.div`
  display: flex;
  padding: 20px;

  border-bottom: 1px solid ${rgba('#000', 0.05)};
`;

const TokenWrapper = styled.div`
  flex: 1;
  margin-right: 7px;
`;

const TokenName = styled.div`
  color: #000;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
`;

const TokenAddress = styled.div`
  margin-top: 6px;

  color: ${rgba('#000', 0.5)};
  font-size: 12px;
  line-height: 14px;
`;

const ShareWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  background: #f0f0f0;
  border-radius: 10px;

  cursor: pointer;
`;

const ShareIcon = styled(Icon)`
  width: 18px;
  height: 18px;

  color: #000;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  //padding: 20px;
  padding: 20px 20px 40px;
`;

// const ActionsWrapper = styled.div`
//   display: flex;
//   margin-top: 23px;
//
//   > :not(:last-child) {
//     margin-right: 10px;
//   }
// `;
//
// const Action = styled.div`
//   display: flex;
//   align-items: center;
//   height: 40px;
//   padding: 0 22px;
//
//   color: #000000;
//   font-size: 14px;
//   line-height: 17px;
//
//   background: ${rgba('#E8E8E8', 0.5)};
//   border-radius: 10px;
//
//   cursor: pointer;
// `;

type Props = {
  publicKey: web3.PublicKey;
  className?: string;
};

export const QRAddressWidget: FunctionComponent<Props> = ({ publicKey, className }) => {
  const cluster = useSelector((state: RootState) => state.wallet.cluster);
  const tokenAccounts = useSelector((state: RootState) => state.wallet.tokenAccounts);
  const tokenAccount = useMemo(() => {
    const foundToken = tokenAccounts.find((account) => account.address === publicKey.toBase58());
    return foundToken && TokenAccount.from(foundToken);
  }, [tokenAccounts, publicKey]);

  if (!tokenAccount) {
    return null;
  }

  const handleCopyClick = () => {
    try {
      void navigator.clipboard.writeText(tokenAccount.address.toBase58());
    } catch (error) {
      console.error(error);
    }
  };

  // function handleShareClick() {
  //   navigator.share({ text, title, url });
  // }

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
    <WrapperCard className={className}>
      <HeaderWrapper>
        <TokenWrapper>
          <TokenName>{tokenAccount.mint.name} Address</TokenName>
          <TokenAddress>{tokenAccount.address.toBase58()}</TokenAddress>
        </TokenWrapper>
        <ShareWrapper onClick={handleCopyClick}>
          <ShareIcon name="copy" />
        </ShareWrapper>
      </HeaderWrapper>
      <Content>
        <QRCode value={tokenAccount.address.toBase58()} imageSettings={imageSettings} size={148} />
        {/* <ActionsWrapper> */}
        {/*  <Action>Copy image</Action> */}
        {/*  <Action>Share</Action> */}
        {/* </ActionsWrapper> */}
      </Content>
    </WrapperCard>
  );
};
