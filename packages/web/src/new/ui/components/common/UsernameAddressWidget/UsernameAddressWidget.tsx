import type { FC } from 'react';

import { styled } from '@linaria/react';
import { borders, shadows, theme, up, useIsMobile, useIsTablet } from '@p2p-wallet-web/ui';
import QRCode from 'qrcode.react';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import Logo from 'new/ui/assets/images/logo.png';
import { AddressText } from 'new/ui/components/common/AddressText';
import { UserNamedAddressWidgetViewModel } from 'new/ui/components/common/UsernameAddressWidget/UserNamedAddressWidget.ViewModel';
import { Button } from 'new/ui/components/ui/Button';
import { isImageCopyAvailable } from 'new/utils/Clipboard';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 16px;
`;

const UsernameAddressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  grid-gap: 8px;
  align-items: center;
  padding: 24px 16px 16px;

  text-align: center;

  border-radius: 12px;
  ${borders.primary}
  ${shadows.card};

  ${up.tablet} {
    flex-direction: row;
    padding: 16px 30px 16px 16px;

    text-align: left;
  }
`;

const QRCodeWrapper = styled.div`
  padding: 15px;
`;

const AddressWrapper = styled.div`
  ${up.tablet} {
    display: grid;
    grid-gap: 16px;
  }
`;

const AddressTextStyled = styled(AddressText)`
  padding: 12px 26px;

  ${up.tablet} {
    padding: 0;
  }
`;

const Username = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
`;

const LogoImg = styled.img`
  width: auto;
  height: 30px;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-auto-flow: dense;
  grid-gap: 8px;

  ${up.tablet} {
    grid-auto-flow: column;
  }
`;

const QR_CODE_SIZE_MOBILE = 237;
const QR_CODE_SIZE = 122;

type Props = {
  address: string;
  username?: string;
  onAddressCopied?: () => void;
};

export const UsernameAddressWidget: FC<Props> = ({ address, username, onAddressCopied }) => {
  const viewModel = useViewModel(UserNamedAddressWidgetViewModel);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const handleImageCopyClick = () => {
    const qrElement = document.querySelector<HTMLCanvasElement>('#qrcode');
    if (!qrElement) {
      return;
    }

    viewModel.copyQRCode(qrElement);
  };

  return (
    <Wrapper>
      <UsernameAddressWrapper>
        {isMobile && username ? <Username>{username}</Username> : undefined}
        <QRCodeWrapper>
          <QRCode
            id="qrcode"
            value={address}
            size={isMobile ? QR_CODE_SIZE_MOBILE : QR_CODE_SIZE}
          />
        </QRCodeWrapper>
        <AddressWrapper>
          {isTablet && username ? <Username>{username}</Username> : undefined}
          <AddressTextStyled address={address} small />
          {isTablet ? <LogoImg src={Logo} /> : undefined}
        </AddressWrapper>
      </UsernameAddressWrapper>
      <ButtonsWrapper>
        {username ? (
          <Button
            small={!isMobile}
            medium={isMobile}
            hollow
            onClick={() => viewModel.copyString(username, 'Username')}
          >
            Copy username
          </Button>
        ) : undefined}
        <Button
          small={!isMobile}
          medium={isMobile}
          hollow
          onClick={() => {
            viewModel.copyString(address, 'Address');

            if (onAddressCopied) {
              onAddressCopied();
            }
          }}
        >
          Copy address
        </Button>
        {isImageCopyAvailable ? (
          <Button small={!isMobile} medium={isMobile} hollow onClick={handleImageCopyClick}>
            Copy QR code
          </Button>
        ) : null}
      </ButtonsWrapper>
    </Wrapper>
  );
};
