import type { FC } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import { observer } from 'mobx-react-lite';

import LogoImg from 'assets/images/big-logo.png';
import { ToastManager } from 'components/common/ToastManager';
import { Switch } from 'components/ui';
import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { AuthVewModel } from '../../Auth.VewModel';
import { Button } from './Button';
import { OffPasswordModal } from './Modal';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  width: 360px;
  margin-top: 200px;
`;

const TopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.div`
  width: 64px;
  height: 64px;

  background: url('${LogoImg}') no-repeat 50% 50%;
  background-size: 64px 64px;
`;

const Title = styled.span`
  display: inline-block;
  margin-top: 32px;

  color: #161616;
  font-weight: bold;
  font-size: 26px;
  font-family: 'GT Super Ds Trial', sans-serif;
  line-height: 32px;
`;

const Desc = styled.span`
  margin-top: 8px;

  color: #161616;
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;
  text-align: center;
`;

const SwitcherLabel = styled.label`
  display: flex;
  align-items: center;

  height: 52px;
  margin: 20px 0 32px;
  padding: 0 20px;

  background: #f6f6f8;
  border-radius: 12px;

  cursor: pointer;
`;

const SwitcherText = styled.span`
  margin-left: 20px;

  color: #161616;
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;
`;

// @FRIDAY proceed with restore wallet
export const Final: FC = observer(() => {
  const viewModel = useViewModel(AuthVewModel);

  const [isSave, setIsSave] = useState(true);
  const [isShowModal, setIsShowModal] = useState(false);

  const handleCloseModal = (nextIsSave: boolean) => {
    setIsShowModal(false);
    setIsSave(nextIsSave);
  };

  const handleIsSaveChange = (nextIsSave: boolean) => {
    if (nextIsSave) {
      setIsSave(nextIsSave);
      return;
    }

    setIsShowModal(true);
  };

  const handleFinishClick = () => {
    // @TODO look at the original file
    // there is privateKey and activate methods
    // they should go into the mnemonic adapter
    viewModel.setIsLoading(true);
    try {
      void viewModel.saveEncryptedMnemonicAndSeed();
    } catch (error) {
      ToastManager.error((error as Error).message);
    } finally {
      viewModel.setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      {isShowModal ? <OffPasswordModal close={handleCloseModal} /> : undefined}

      <TopWrapper>
        <Logo />
        <Title>{viewModel.isRestore ? 'Welcome back!' : 'Your wallet is ready!'}</Title>
        <Desc>
          You can turn on a quick enter via password. Only you have access to your keys, not the
          government, not us, not anyone else. It’s 100% stored on your devices.
        </Desc>
      </TopWrapper>
      <SwitcherLabel>
        <Switch checked={isSave} onChange={handleIsSaveChange} />
        <SwitcherText>Use fast enter with password</SwitcherText>
      </SwitcherLabel>
      <Button onClick={handleFinishClick}>Finish setup</Button>
    </Wrapper>
  );
});
