import type { FunctionComponent } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import { Feature } from 'flagged';
import { rgba } from 'polished';

import { ToastManager } from 'components/common/ToastManager';
import { Widget } from 'components/common/Widget';
import { Avatar, Icon } from 'components/ui';
import { FEATURE_LEFT_NAV_MENU_POFILE } from 'config/featureFlags';

const Top = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 20px;

  border-bottom: 1px solid ${rgba('#000', 0.05)};
`;

const Username = styled.div`
  margin-left: 20px;

  color: #202020;
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  margin: 0 16px 0 20px;
`;

const Address = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

const CopiedText = styled.div`
  color: #2db533;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

const CopyIcon = styled(Icon)`
  width: 21px;
  height: 21px;

  color: #a3a5ba;
`;

const CopyWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  background: rgba(163, 165, 186, 0.1);
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #eff3ff;

    ${CopyIcon} {
      color: #5887ff;
    }
  }
`;

export const ProfileWidget: FunctionComponent = () => {
  const [copied, setCopied] = useState(false);

  const username = 'konstantin';
  const address = `${username}.p2pwallet.org`;

  const handleCopyClick = () => {
    try {
      void navigator.clipboard.writeText(`https://${address}`);
      setCopied(true);
      ToastManager.info('URL Copied!');

      // fade copied after some seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Feature name={FEATURE_LEFT_NAV_MENU_POFILE}>
      <Widget>
        <Top>
          <Avatar src="https://i.pravatar.cc/100" size={36} />
          <Username>@{username}</Username>
        </Top>
        <Bottom>
          {copied ? <CopiedText>URL Copied!</CopiedText> : <Address>{address}</Address>}
          <CopyWrapper onClick={handleCopyClick}>
            <CopyIcon name="copy" />
          </CopyWrapper>
        </Bottom>
      </Widget>
    </Feature>
  );
};
