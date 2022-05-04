import { styled } from '@linaria/react';
import { theme, up, zIndexes } from '@p2p-wallet-web/ui';

import { Button, Icon } from 'components/ui';
import { Content as ModalContent, Modal } from 'components/ui/Modal';

export const StatusColors = styled.div`
  &.isProcessing {
    background: ${theme.colors.system.warningMain};
  }

  &.isSuccess {
    background: ${theme.colors.system.successMain};
  }

  &.isError {
    background: ${theme.colors.system.errorMain};
  }
`;

export const WrapperModal = styled(Modal)`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  padding: 0;
  overflow: scroll;

  background: ${theme.colors.bg.primary};

  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);

  ${ModalContent} {
    ${up.tablet} {
      width: 524px;
    }

    padding: 0;
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ProgressWrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  height: 55px;
`;

export const BlockWrapper = styled(StatusColors)`
  z-index: ${zIndexes.top};

  display: flex;
  align-items: center;
  justify-content: center;
  width: 55px;
  height: 55px;

  border-radius: 40%;
`;

export const OtherIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.buttonPrimary};
`;

export const Header = styled.div`
  position: relative;

  color: ${theme.colors.textIcon.primary};
  font-weight: 500;
  font-size: 24px;
  font-style: normal;
  line-height: 140%;
  text-align: center;
`;

export const Title = styled.div`
  margin-bottom: 10px;

  color: #000;
  font-weight: bold;
  font-size: 20px;
  line-height: 100%;
  text-transform: capitalize;
`;

export const Desc = styled.div`
  color: ${theme.colors.bg.buttonDisabled};
  font-weight: 600;
  font-size: 16px;
  line-height: 100%;
`;

export const CloseWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  color: ${theme.colors.bg.buttonPrimary};

  border-radius: 8px;

  cursor: pointer;
`;

export const CloseIcon = styled(Icon)`
  width: 16px;
  height: 16px;
`;

export const CheckmarkIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.textIcon.buttonPrimary};
`;

export const TransactionLabel = styled(StatusColors)`
  display: block;
  width: 8px;
  height: 8px;

  margin-right: 8px;
`;

export const Content = styled.div`
  padding-top: 40px;
`;

export const SendWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

export const ValueCurrency = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 28px;
  line-height: 120%;
`;

export const ValueOriginal = styled.div`
  margin-top: 4px;

  color: ${theme.colors.bg.buttonDisabled};
  font-weight: 600;
  font-size: 16px;
  line-height: 120%;
`;

export const SwapWrapper = styled.div`
  display: flex;
  justify-content: center;

  margin-bottom: 40px;
`;

export const SwapColumn = styled.div`
  display: flex;
  flex: 1;
  align-items: center;

  &:not(:first-child) {
    justify-content: flex-start;
  }

  &:not(:last-child) {
    justify-content: flex-end;
  }
`;

export const SwapInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SwapBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
  margin: 6px 26px 0;

  background: ${theme.colors.bg.buttonSecondary};
  border-radius: 12px;
`;

export const SwapIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.bg.buttonDisabled};
`;

export const SwapAmount = styled.div`
  margin-top: 10px;

  color: #000;
  font-weight: 600;
  font-size: 18px;
  line-height: 120%;
`;

export const FieldsWrapper = styled.div``;

export const FieldWrapper = styled.div`
  padding: 16px 30px;

  &:first-child {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
`;

export const FieldTitle = styled.div`
  color: ${theme.colors.bg.buttonDisabled};
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
`;

export const FieldValue = styled.div`
  display: flex;
  align-items: center;
  margin-top: 3px;

  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
`;

export const ShareIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: ${theme.colors.bg.buttonDisabled};
`;

export const ShareWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-left: 20px;

  background: rgba(163, 165, 186, 0.1);
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.bg.activePrimary};

    ${ShareIcon} {
      color: ${theme.colors.textIcon.active};
    }
  }
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;

  border-top: 1px solid rgba(0, 0, 0, 0.05);

  & > :not(:last-child) {
    margin-right: 16px;
  }

  &.isCentered {
    justify-content: center;
  }
`;

export const ButtonExplorer = styled(Button)`
  font-weight: 600;
  font-size: 14px;
  line-height: 150%;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 20px;
`;
