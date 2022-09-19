import type { FC } from 'react';
import { useLayoutEffect } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { Modal } from 'components/ui/Modal';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import type { SwapViewModel } from 'new/scenes/Main/Swap';
import { ButtonCancel } from 'new/ui/components/common/ButtonCancel';
import { PasswordInput } from 'new/ui/components/common/PasswordInput';

import type { ModalPropsType } from '../../ModalManager';
import { ArrowDown } from '../common/ArrowDown';
import { Section } from '../common/styled';
import { ActionButton } from './ActionButton';
import { ConfirmSwapModalViewModel } from './ConfirmSwapModal.ViewModel';
import { DetailsView } from './DetailsView';
import { WalletView } from './WalletView';

const WrapperModal = styled(Modal)`
  flex-basis: 524px;
`;

const ModalTitle = styled.div`
  font-weight: 500;
  font-size: 24px;
  line-height: 140%;
  text-align: center;
`;

const SubTitle = styled.span`
  display: flex;
  margin-bottom: 8px;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 140%;
  letter-spacing: 0.01em;
`;

const ActionTitle = styled.div`
  padding: 16px;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  letter-spacing: 0.01em;
`;

const PasswordInputStyled = styled(PasswordInput)`
  height: 46px;
`;

export interface ConfirmSwapModalProps {
  viewModel: Readonly<SwapViewModel>;
}

export const ConfirmSwapModal: FC<ConfirmSwapModalProps & ModalPropsType> = observer(
  ({ close, viewModel }) => {
    const vm = useViewModel(ConfirmSwapModalViewModel);

    useLayoutEffect(() => {
      vm.setSwapViewModel(viewModel);
    }, [viewModel, vm]);

    // const { walletProviderInfo } = useWallet();
    // const tryUnlockSeedAndMnemonic = useTryUnlockSeedAndMnemonic();
    //
    // const [password, setPassword] = useState('');
    // const [hasError, setHasError] = useState(false);
    //
    const handleCloseClick = () => {
      close(false);
    };
    //
    // const validatePassword = async (value: string) => {
    //   try {
    //     await tryUnlockSeedAndMnemonic(value);
    //     setHasError(false);
    //   } catch (error) {
    //     setHasError(true);
    //   }
    // };
    //
    // const handlePasswordChange = (value: string) => {
    //   setPassword(value);
    //
    //   if (value) {
    //     void validatePassword(value);
    //   }
    // };

    const handleConfirmClick = () => {
      // close(true);
      // viewModel.authenticateAndSwap();
    };

    // const isSecretKeyWallet =
    //   walletProviderInfo?.name === DEFAULT_WALLET_PROVIDERS[DefaultWalletType.SecretKey].name;
    // const isDisabled =
    //   (isSecretKeyWallet && (!password || hasError)) ||
    //   !viewModel.wallet ||
    //   !viewModel.amount ||
    //   !viewModel.recipient;

    return (
      <WrapperModal
        title={
          <ModalTitle>
            Confirm swapping {viewModel.sourceWallet?.token.symbol ?? ''} →{' '}
            {viewModel.destinationWallet?.token.symbol ?? ''}
          </ModalTitle>
        }
        close={handleCloseClick}
        footer={
          <>
            <ActionButton viewModel={vm} onClick={handleConfirmClick} />
            <ButtonCancel onClick={handleCloseClick} />
          </>
        }
        noDelimiter={false}
      >
        <ActionTitle>You are going to swap</ActionTitle>
        <Section className="swap">
          <div>
            <WalletView viewModel={vm} type="source" />
            <ArrowDown />
            <WalletView viewModel={vm} type="destination" />
          </div>
          <DetailsView viewModel={vm} />
        </Section>
        {/*{isSecretKeyWallet ? (*/}
        {/*  <Section className="password">*/}
        {/*    <SubTitle>Enter password to confirm</SubTitle>*/}
        {/*    <PasswordInputStyled*/}
        {/*      value={password}*/}
        {/*      onChange={handlePasswordChange}*/}
        {/*      isError={hasError}*/}
        {/*    />*/}
        {/*    {hasError ? <ErrorHint error="The password is not correct" noIcon /> : null}*/}
        {/*  </Section>*/}
        {/*) : null}*/}
      </WrapperModal>
    );
  },
);
