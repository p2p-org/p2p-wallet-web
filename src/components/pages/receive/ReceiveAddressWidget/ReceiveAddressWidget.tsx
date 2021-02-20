import React, { FunctionComponent, useState } from 'react';

import { styled } from '@linaria/react';
import { Feature } from 'flagged';
import { rgba } from 'polished';

import { ToastManager } from 'components/common/ToastManager';
import { WidgetPage } from 'components/common/WidgetPage';
import { Icon } from 'components/ui';
import { FEATURE_RECEIVE_ADDRESS } from 'config/featureFlags';

const WrapperWidgetPage = styled(WidgetPage)`
  overflow: hidden;
`;

const URLWrapper = styled.div`
  padding: 24px 20px;

  color: #a3a5ba;

  border-bottom: 1px solid ${rgba('#000', 0.05)};
  cursor: pointer;
`;

const URLTitle = styled.div`
  margin-bottom: 12px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 120%;
`;

const RightWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const CopiedText = styled.div`
  margin-right: 12px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const CopyIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const CopyWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
`;

const URLValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 12px 0 20px;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;

  background: #f6f6f8;
  border-radius: 12px;

  &:hover {
    color: #5887ff;

    ${CopyIcon} {
      color: #5887ff;
    }
  }
`;

const handleCopyClick = (value: string, cb: (state: boolean) => void) => () => {
  try {
    void navigator.clipboard.writeText(value);
    cb(true);
    ToastManager.info('Copied!');

    // fade copied after some seconds
    setTimeout(() => {
      cb(false);
    }, 2000);
  } catch (error) {
    console.error(error);
  }
};

export const ReceiveAddressWidget: FunctionComponent = () => {
  const [isUrlCopied, setIsUrlCopied] = useState(false);
  const urlAddress = 'konstantink.p2pwallet.org';

  return (
    <WrapperWidgetPage title="Receive" icon="bottom">
      <Feature name={FEATURE_RECEIVE_ADDRESS}>
        <URLWrapper>
          <URLTitle>Send tokens directly to you wallet via URL</URLTitle>
          <URLValue onClick={handleCopyClick(urlAddress, setIsUrlCopied)}>
            konstantink.p2pwallet.org
            <RightWrapper>
              {isUrlCopied ? <CopiedText>Copied!</CopiedText> : undefined}
              <CopyWrapper>
                <CopyIcon name="copy" />
              </CopyWrapper>
            </RightWrapper>
          </URLValue>
        </URLWrapper>
      </Feature>
    </WrapperWidgetPage>
  );
};
