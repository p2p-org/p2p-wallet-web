import type { FunctionComponent } from 'react';
import { useState } from 'react';

import { styled } from '@linaria/react';
import type * as web3 from '@solana/web3.js';
import type { History } from 'history';

import { useCloseTokenAccount } from 'app/hooks';
import { Button, Icon } from 'components/ui';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-basis: 504px;
  flex-direction: column;
  padding: 32px 0 0;

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

const CloseAccountIcon = styled(Icon)`
  width: 25px;
  height: 25px;

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
  padding: 0 20px 32px;

  color: #a3a5ba;

  font-weight: 600;
  font-size: 16px;

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

const ButtonCancel = styled(Button)`
  min-width: 93px;
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
  const closeTokenAccount = useCloseTokenAccount();
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCloseButtonClick = () => {
    close();
  };

  const handleCloseTokenAButtonClick = async () => {
    try {
      setIsExecuting(true);
      await closeTokenAccount({ publicKey });
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
        Are you sure you want to delete token account? This will permanently disable token transfers
        to this address and remove it from your wallet.
      </Description>
      <Buttons>
        <ButtonClose disabled={isExecuting} onClick={handleCloseTokenAButtonClick}>
          Close token account
        </ButtonClose>
        <ButtonCancel lightBlue disabled={isExecuting} onClick={handleCloseButtonClick}>
          Cancel
        </ButtonCancel>
      </Buttons>
    </Wrapper>
  );
};
