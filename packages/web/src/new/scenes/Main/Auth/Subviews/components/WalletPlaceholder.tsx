import type { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

import { Bottom, Info, ItemWrapper, Top, Wrapper } from './WalletRow';

export const WalletPlaceholder: FC = () => {
  return (
    <Wrapper>
      <ItemWrapper>
        <Skeleton width={44} height={44} borderRadius={12} />
        <Info>
          <Top>
            <Skeleton width={50} height={16} />
            <Skeleton width={50} height={16} />
          </Top>
          <Bottom>
            <Skeleton width={100} height={14} />
            <Skeleton width={100} height={16} />
          </Bottom>
        </Info>
      </ItemWrapper>
    </Wrapper>
  );
};
