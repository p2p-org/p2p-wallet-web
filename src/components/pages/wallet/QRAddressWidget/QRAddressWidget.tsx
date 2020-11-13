import React, { FunctionComponent } from 'react';

import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { Card } from 'components/common/Card';
import { Icon } from 'components/ui';

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
  padding: 20px;
`;

type Props = {};

export const QRAddressWidget: FunctionComponent<Props> = (props) => {
  return (
    <WrapperCard>
      <HeaderWrapper>
        <TokenWrapper>
          <TokenName>Ethereum Wowlet Address</TokenName>
          <TokenAddress>k97y8u209j08fh98yu20uiei92jkek9j290</TokenAddress>
        </TokenWrapper>
        <ShareWrapper>
          <ShareIcon name="copy" />
        </ShareWrapper>
      </HeaderWrapper>
      <Content>12</Content>
    </WrapperCard>
  );
};
