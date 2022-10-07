import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { Button } from 'components/ui';

const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  background: rgba(255, 255, 255, 0.8);
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 504px;

  overflow: hidden;

  background: #fff;
  border-radius: 15px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  margin: 30px 20px 0;

  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const Description = styled.div`
  margin-top: 12px;
  padding: 0 20px 24px;

  color: ${rgba('#161616', 0.8)};
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 20px;

  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const Buttons = styled.div`
  padding: 24px 20px;
`;

const ButtonClose = styled(Button)`
  margin-right: 16px;

  color: #f43d3d;

  border: 1px solid #f43d3d;

  &:disabled {
    background: #f77;
    border: none;
    opacity: 0.5;
  }
`;

type Props = {
  close: (isSave: boolean) => void;
};

export const OffPasswordModal: FunctionComponent<Props> = ({ close }) => {
  const handleTurnOffClick = () => {
    close(false);
  };

  const handleCloseClick = () => {
    close(true);
  };

  return (
    <Background>
      <Wrapper>
        <Header>Do you really want to turn off login with password?</Header>
        <Description>
          The seed phrase will not be saved on your device in future. On every login you’ll need to
          enter your private seed phrase. You can manage this function in settings.
        </Description>
        <Buttons>
          <ButtonClose onClick={handleTurnOffClick}>Yes, turn off</ButtonClose>
          <Button dark onClick={handleCloseClick}>
            No, keep login with password
          </Button>
        </Buttons>
      </Wrapper>
    </Background>
  );
};
