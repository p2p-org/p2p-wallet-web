import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import { up } from '@p2p-wallet-web/ui';

import { LoaderBlock } from 'components/common/LoaderBlock';
import type { WalletsRepository } from 'new/services/Repositories';

import { TokenAccountRow } from './TokenAccountRow';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 8px;

  ${up.tablet} {
    grid-gap: 16px;
    margin: initial;
  }
`;

type Props = {
  viewModel: WalletsRepository;
  isHidden?: boolean;
};

export const TokenAccountList: FunctionComponent<Props> = ({ viewModel, isHidden = false }) => {
  if (viewModel.data.length === 0 && !isHidden) {
    return <LoaderBlock />;
  }

  return (
    <Wrapper>
      {viewModel.data.map((item) => (
        <TokenAccountRow key={item.pubkey} wallet={item} isHidden={isHidden} />
      ))}
    </Wrapper>
  );
};
