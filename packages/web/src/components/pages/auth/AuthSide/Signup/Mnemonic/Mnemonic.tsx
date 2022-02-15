import type { FC } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';

import { Button } from 'components/pages/auth/AuthSide/common/Button';
import { Checkbox } from 'components/pages/auth/AuthSide/common/Checkbox';
import { trackEvent } from 'utils/analytics';
import { useTrackEventOnce } from 'utils/hooks/useTrackEventOnce';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const PleaseText = styled.span`
  position: relative;

  margin: 42px 0 48px;

  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;
  text-align: center;

  background-image: linear-gradient(180deg, #ff7438 0%, #7636ff 100%);

  /* Use the text as a mask for the background.
  This will show the gradient as a text color rather than element bg. */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-box-decoration-break: clone;
  opacity: 0.8;

  &::before {
    position: absolute;
    top: -28px;
    left: -32px;

    width: 421px;
    height: 98px;

    background: url('./circle.svg') no-repeat 50%;

    content: '';
  }
`;

const SecurityKey = styled.span`
  margin-bottom: 12px;

  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;
`;

const SecurityKeyHint = styled.span`
  margin-bottom: 20px;

  color: #161616;
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;
`;

const MnemonicWrapper = styled.div`
  position: relative;

  &::before {
    position: absolute;
    top: -148px;
    right: -40px;

    width: 47px;
    height: 147px;

    background: url('./line-seed.svg') no-repeat 50%;

    content: '';
  }
`;

const MnemonicTextarea = styled.textarea`
  position: relative;

  flex-shrink: 0;
  width: 100%;
  height: 100%;
  min-height: 125px;
  padding: 15px;

  color: #161616;
  font-weight: 500;
  font-size: 16px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 24px;

  background-image: linear-gradient(white, white), linear-gradient(180deg, #ff7438 0%, #7636ff 100%);
  background-clip: padding-box, border-box;
  background-origin: border-box;
  border: solid 2px transparent;
  border-radius: 12px;
  outline: 0;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.1));

  &::placeholder {
    color: #1616164c;
  }
`;

const CheckboxWrapper = styled.div`
  position: relative;

  margin: 34px 0 26px;

  &::before {
    position: absolute;
    top: -35px;
    left: -17px;

    width: 16px;
    height: 39px;

    background: url('./line-saved.svg') no-repeat 50%;

    content: '';
  }
`;

type Props = {
  mnemonic: string;
  next: () => void;
};

export const Mnemonic: FC<Props> = ({ mnemonic, next }) => {
  const trackEventOnce = useTrackEventOnce();
  const [checked, setChecked] = useState(false);

  const handleCheckChange = (nextChecked: boolean) => {
    setChecked(nextChecked);

    if (nextChecked) {
      trackEventOnce('signup_i_have_saved_words_click');
    }
  };

  const handleContinueClick = () => {
    trackEvent('signup_continue_mnemonic_click');
    next();
  };

  return (
    <Wrapper>
      <PleaseText>
        Please write down the following twelve words <br /> and keep them in a safe place.
      </PleaseText>
      <SecurityKey>Your security key</SecurityKey>
      <SecurityKeyHint>
        Your private keys are only stored on your current computer or device. You will need these
        words to restore your wallet if your browser’s storage is cleared or your device is damaged
        or lost.
      </SecurityKeyHint>
      <MnemonicWrapper>
        <MnemonicTextarea placeholder="Seed phrase" value={mnemonic} readOnly />
      </MnemonicWrapper>
      <CheckboxWrapper>
        <Checkbox
          checked={checked}
          label="I have saved these words in a safe place."
          onChange={handleCheckChange}
        />
      </CheckboxWrapper>
      <Button disabled={!checked} onClick={handleContinueClick}>
        Continue
      </Button>
    </Wrapper>
  );
};
