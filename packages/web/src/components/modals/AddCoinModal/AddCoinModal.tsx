import type { FunctionComponent } from 'react';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import type { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { Modal } from 'components/common/Modal';
import type { RootState } from 'store/rootReducer';

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
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map((token) => TokenAccount.from(token)),
  );
  const availableTokens: Token[] = [];

  const closeModal = () => {
    close();
  };

  const filteredTokens = useMemo(() => {
    if (!availableTokens) {
      return;
    }

    const existsMintAccounts = new Set(tokenAccounts.map((token) => token.mint.address.toBase58()));

    return availableTokens.filter((token) => !existsMintAccounts.has(token.address.toBase58()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTokens]);

  return (
    <WrapperModal title="Add coins" close={close}>
      {filteredTokens?.length ? (
        <ScrollableContainer>
          <TokenList items={filteredTokens} closeModal={closeModal} />
        </ScrollableContainer>
      ) : undefined}
    </WrapperModal>
  );
};
