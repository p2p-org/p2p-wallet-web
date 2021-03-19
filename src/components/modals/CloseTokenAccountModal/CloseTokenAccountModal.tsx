import React, { FunctionComponent, useState } from 'react';
import { useDispatch } from 'react-redux';

import { styled } from '@linaria/react';
import * as web3 from '@solana/web3.js';
import { History } from 'history';

import { Button, Icon } from 'components/ui';
import { closeTokenAccount } from 'store/slices/wallet/WalletSlice';
import { removeHiddenToken } from 'utils/settings';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-basis: 504px;
  flex-direction: column;
  padding: 32px 0 24px;

  overflow: hidden;

  background: #f6f6f8;

  border-radius: 15px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;

  margin: 0 20px;
  padding: 8px;

  background: #f77;
  border-radius: 12px;
`;

const CloseAccountIcon = styled(Icon)`
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

  border-bottom: 1px solid #fbfbfd;
`;

const Buttons = styled.div`
  padding: 24px 20px 0;
`;

const ButtonStyled = styled(Button)`
  margin-right: 16px;

  color: #f77;

  border: 1px solid #f77;

  &:disabled {
    background: #f77;
    border: none;
    opacity: 0.5;
  }
`;

type Props = {
  publicKey: web3.PublicKey;
  tokenName: string;
  history: History;
  close: () => void;
};

export const CloseTokenAccountModal: FunctionComponent<Props> = ({
  publicKey,
  tokenName,
  history,
  close,
}) => {
  const dispatch = useDispatch();
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCloseButtonClick = () => {
    close();
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  const handleCloseTokenAButtonClick = async () => {
    try {
      setIsExecuting(true);
      await dispatch(closeTokenAccount({ publicKey }));
      removeHiddenToken(publicKey.toBase58());
    } catch (error) {
      console.log(error);
    } finally {
      setIsExecuting(false);
    }

    setTimeout(() => {
      history.push('/wallets');
    }, 100);

    close();
  };

  return (
    <Wrapper>
      <IconWrapper>
        <CloseAccountIcon name="bucket" />
      </IconWrapper>
      <Header>{`Close ${tokenName} account?`}</Header>
      <Description>
        {`Your balance will be converted and transferred to your main SOL wallet and all your ${tokenName}
        addresses will be disabled. This action can not be undone.`}
      </Description>
      <Buttons>
        <ButtonStyled disabled={isExecuting} onClick={handleCloseTokenAButtonClick}>
          Close token account
        </ButtonStyled>
        <Button light disabled={isExecuting} onClick={handleCloseButtonClick}>
          Cancel
        </Button>
      </Buttons>
    </Wrapper>
  );
};
