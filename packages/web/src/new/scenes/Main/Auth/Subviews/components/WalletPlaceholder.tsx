import type { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';

const Wrapper = styled.div`
  padding: 10px 20px;

  cursor: pointer;
`;

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 44px;
`;

const Info = styled.div`
  flex: 1;
  margin-left: 20px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 140%;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
`;

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
