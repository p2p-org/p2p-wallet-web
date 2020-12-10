import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { Account, clusterApiUrl } from '@solana/web3.js';

import { Token } from 'api/token/Token';
import tokenConfig from 'api/token/token.config';
import { TokenAccount } from 'api/token/TokenAccount';
import { Modal } from 'components/common/Modal';
import { Button } from 'components/ui';
import { createMint } from 'features/wallet/WalletSlice';
import { RootState } from 'store/rootReducer';

import { TokenList } from './TokenList';

const WrapperModal = styled(Modal)`
  flex-basis: 588px;
`;

const ScrollableContainer = styled.div`
  max-height: 668px;
  padding-bottom: 20px;
  overflow-y: auto;

  &::-webkit-scrollbar-track {
    margin-bottom: 16px;
  }
`;

type Props = {
  close: () => void;
};

export const AddCoinModal: FunctionComponent<Props> = ({ close }) => {
  const dispatch = useDispatch();
  const cluster = useSelector((state: RootState) => state.wallet.cluster);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((token) => TokenAccount.from(token)),
  );
  const availableTokens = useSelector((state: RootState) =>
    state.global.availableTokens.map((token) => Token.from(token)),
  );

  const isMainnetEntrypoint = cluster === clusterApiUrl('mainnet-beta');

  const handleMintTestTokenClick = () => {
    dispatch(createMint({ amount: 1000, decimals: 2, initialAccount: new Account() }));
  };

  const closeModal = () => {
    close();
  };

  const filteredTokens = useMemo(() => {
    if (!availableTokens) {
      return;
    }

    const existsMintAccounts = new Set(tokenAccounts.map((token) => token.mint.address.toBase58()));

    return availableTokens.filter((token) => !existsMintAccounts.has(token.address.toBase58()));
  }, [availableTokens]);

  return (
    <WrapperModal
      title="Add coins"
      description={
        <>
          Add a token to your wallet. This will cost some SOL
          {!isMainnetEntrypoint ? (
            <>
              {' '}
              <Button link onClick={handleMintTestTokenClick}>
                Mint test token
              </Button>
            </>
          ) : null}
        </>
      }
      close={close}>
      {filteredTokens?.length ? (
        <ScrollableContainer>
          <TokenList items={filteredTokens} closeModal={closeModal} />
        </ScrollableContainer>
      ) : undefined}
    </WrapperModal>
  );
};
