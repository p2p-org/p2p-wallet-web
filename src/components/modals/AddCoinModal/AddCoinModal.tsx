import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import tokenConfig from 'api/token/token.config';
import { TokenAccount } from 'api/token/TokenAccount';
import { Modal } from 'components/common/Modal';
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
  // const dispatch = useDispatch();
  // const ownerAccount = useSelector((state: RootState) => state.wallet.publicKey);
  const cluster = useSelector((state: RootState) => state.wallet.cluster);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((account) => TokenAccount.from(account)),
  );

  const tokens = tokenConfig[cluster];
  // const isMainnetEntrypoint = cluster === web3.clusterApiUrl('mainnet-beta');

  // const handleMintTestTokenClick = () => {
  //   if (!ownerAccount) {
  //     return;
  //   }
  //
  //   dispatch(
  //     createAndInitializeMint({
  //       owner: ownerAccount,
  //       mint: new web3.Account(),
  //       amount: 1000,
  //       decimals: 2,
  //       initialAccount: new web3.Account(),
  //     }),
  //   );
  // };

  const closeModal = () => {
    close();
  };

  const filteredTokens = useMemo(() => {
    if (!tokens) {
      return;
    }

    const existsMintAccounts = new Set(tokenAccounts.map((token) => token.mint.address.toBase58()));

    return tokens.filter((token) => !existsMintAccounts.has(token.mintAddress));
  }, [tokenAccounts]);

  console.log(filteredTokens);

  return (
    <WrapperModal
      title="Add coins"
      description={
        <>
          Add a token to your wallet. This will cost some SOL
          {/* {!isMainnetEntrypoint ? ( */}
          {/*  <> */}
          {/*    {' '} */}
          {/*    <Button link onClick={handleMintTestTokenClick}> */}
          {/*      Mint test token */}
          {/*    </Button> */}
          {/*  </> */}
          {/* ) : null} */}
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
