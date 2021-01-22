import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { PublicKey } from '@solana/web3.js';

import { TokenAccount } from 'api/token/TokenAccount';
import { Widget } from 'components/common/Widget';
import { Button, Icon } from 'components/ui';
import { RootState } from 'store/rootReducer';
import { airdrop } from 'store/slices/wallet/WalletSlice';

import { TokenSelector } from './TokenSelector';

const WrapperWidget = styled(Widget)``;

const Buttons = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 16px;
`;

const ButtonStyled = styled(Button)`
  width: 36px;
  padding: 0;
`;

const PlusIcon = styled(Icon)`
  width: 20px;
  height: 20px;

  color: #fff;
`;

type Props = {
  publicKey: PublicKey;
};

export const TopWidget: FunctionComponent<Props> = ({ publicKey }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const cluster = useSelector((state: RootState) => state.wallet.cluster);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );
  const tokenAccount = useMemo(
    () => tokenAccounts.find((account) => account.address.equals(publicKey)),
    [tokenAccounts, publicKey],
  );
  const isMainnet = cluster === 'mainnet-beta';

  const handleTokenChange = (token: string) => {
    history.push(`/wallet/${token}`);
  };

  const handleAirdropClick = () => {
    void dispatch(airdrop());
  };

  return (
    <WrapperWidget
      title={<TokenSelector value={publicKey.toBase58()} onChange={handleTokenChange} />}
      action={
        <Buttons>
          {/* <Link to={`/send/${publicKey.toBase58()}`} className="button"> */}
          {/*  <ButtonStyled primary small> */}
          {/*    <PlusIcon name="plus" /> */}
          {/*  </ButtonStyled> */}
          {/* </Link> */}
          <Link to={`/send/${publicKey.toBase58()}`} title="Send" className="button">
            <ButtonStyled primary small>
              <PlusIcon name="top" />
            </ButtonStyled>
          </Link>
          <Link to={`/swap/${publicKey.toBase58()}`} title="Swap" className="button">
            <ButtonStyled primary small>
              <PlusIcon name="swap" />
            </ButtonStyled>
          </Link>
          {!isMainnet && tokenAccount?.mint.symbol === 'SOL' ? (
            <ButtonStyled primary small title="Airdrop" onClick={handleAirdropClick}>
              <PlusIcon name="plug" />
            </ButtonStyled>
          ) : undefined}
        </Buttons>
      }
    />
  );
};
