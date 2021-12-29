import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { rgba } from 'polished';

import { Button, Icon } from 'components/ui';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-basis: 504px;
  flex-direction: column;
  padding: 32px 0 24px;

  overflow: hidden;

  background: #fff;

  border-radius: 15px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  margin: 0 20px;
  padding: 8px;

  background: #f77;
  border-radius: 12px;
`;

const StyledIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #fff;
`;

const Header = styled.div`
  margin-top: 20px;
  padding: 0 20px;

  font-weight: 600;
  font-size: 20px;
`;

const Description = styled.div`
  margin-top: 12px;
  padding: 0 20px;
  padding-bottom: 32px;

  color: #a3a5ba;

  font-weight: 600;
  font-size: 16px;

  border-bottom: 1px solid ${rgba('#000', 0.05)};
`;

const Buttons = styled.div`
  padding: 24px 20px 0;
`;

const ButtonStyled = styled(Button)`
  width: 120px;
`;

type Props = {
  icon: string;
  header: string;
  text: string;
  close: () => void;
};

export const ErrorModal: FunctionComponent<Props> = ({ icon, header, text, close }) => {
  const handleCloseButtonClick = () => {
    close();
  };

  return (
    <Wrapper>
      <IconWrapper>
        <StyledIcon name={icon} />
      </IconWrapper>
      <Header>{header}</Header>
      <Description>{text}</Description>
      <Buttons>
        <ButtonStyled primary onClick={handleCloseButtonClick}>
          Ok
        </ButtonStyled>
      </Buttons>
    </Wrapper>
  );
};
