import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import * as web3 from '@solana/web3.js';
import { styled } from 'linaria/react';
import { rgba } from 'polished';
import QRcode from 'qrcode.react';

import { Card } from 'components/common/Card';
import { Icon } from 'components/ui';
import { RootState, TokenAccount } from 'store/types';
import { usePopulateTokenInfo } from 'utils/hooks/usePopulateTokenInfo';

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
  color: #000000;
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
  isSol?: boolean;
  className?: string;
};

export const QRAddressWidget: FunctionComponent<Props> = ({ publicKey, isSol, className }) => {
  const publicKeyBase58 = publicKey.toBase58();

  const tokenAccount: TokenAccount = useSelector(
    (state: RootState) => state.entities.tokens.items[publicKeyBase58],
  );
  const { mint } = tokenAccount?.parsed || {};
  const { name } = usePopulateTokenInfo({ mint: mint?.toBase58(), includeSol: isSol });

  const handleCopyClick = () => {
    try {
      void navigator.clipboard.writeText(publicKeyBase58);
    } catch (error) {
      console.error(error);
    }
  };

  // function handleShareClick() {
  //   navigator.share({ text, title, url });
  // }

  return (
    <WrapperCard className={className}>
      <HeaderWrapper>
        <TokenWrapper>
          <TokenName>{name} Wowlet Address</TokenName>
          <TokenAddress>{publicKeyBase58}</TokenAddress>
        </TokenWrapper>
        <ShareWrapper onClick={handleCopyClick}>
          <ShareIcon name="copy" />
        </ShareWrapper>
      </HeaderWrapper>
      <Content>
        <QRcode value={publicKeyBase58} size={148} />
        {/* <ActionsWrapper> */}
        {/*  <Action>Copy image</Action> */}
        {/*  <Action>Share</Action> */}
        {/* </ActionsWrapper> */}
      </Content>
    </WrapperCard>
  );
};
