import type { FC } from 'react';

import { styled } from '@linaria/react';

import { useSettings } from 'app/contexts/general/settings';
import { Button, Icon } from 'components/ui';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-basis: 524px;
  flex-direction: column;

  overflow: hidden;

  background: #fff;
  border-radius: 15px;
`;

const Header = styled.div`
  padding: 22px 20px;

  font-weight: 600;
  font-size: 20px;

  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const Description = styled.div`
  padding: 16px 20px 24px;

  font-weight: 600;
  font-size: 16px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: center;

  margin-bottom: 16px;
  padding: 16px 20px;
`;

const ButtonCancel = styled(Button)`
  width: 234px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 32px;
  right: 32px;

  flex-shrink: 0;
  height: 36px;
  width: 36px;
  margin: -10px -12px -10px 0;

  color: #a3a5ba;

  background: #f6f6f8;
  border-radius: 12px;
  outline: none;
  cursor: pointer;

  transition: color 0.15s;

  appearance: none;

  &:hover {
    color: #000;
  }
`;

const CloseIcon = styled(Icon)`
  width: 14px;
  height: 14px;
`;

type Props = {
  close: (isHide?: boolean) => void;
};

export const ProceedUsernameModal: FC<Props> = ({ close }) => {
  const { updateSettings } = useSettings();

  const handleCloseButtonClick = () => {
    updateSettings({ usernameBannerHiddenByUser: true });
    close(true);
  };

  const handleCloseClick = () => {
    close();
  };

  return (
    <Wrapper>
      <Header>Proceed without a username?</Header>
      <Description>
        Anytime you want, you can easily reserve a username by going to the settings in the Android
        or iOS app.
      </Description>
      <Buttons>
        <ButtonCancel primary onClick={handleCloseButtonClick}>
          Proceed &amp; don’t show again
        </ButtonCancel>
      </Buttons>
      <CloseButton type="button" onClick={handleCloseClick}>
        <CloseIcon name="close" />
      </CloseButton>
    </Wrapper>
  );
};
