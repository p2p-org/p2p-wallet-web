import type { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';
import { theme, up } from '@p2p-wallet-web/ui';

import { useUsername } from 'app/contexts';
import { useTotalBalance } from 'components/pages/home/TopWithBalance/common/TotalBalance/hooks/useTotalBalance';

const Wrapper = styled.div``;

const BalanceWrapper = styled.div`
  display: grid;
  grid-gap: 4px;

  text-align: center;

  ${up.tablet} {
    text-align: left;
  }
`;

const Title = styled.div`
  color: ${theme.colors.textIcon.secondary};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: 0.01em;
  white-space: nowrap;

  ${up.tablet} {
    color: ${theme.colors.textIcon.primary};
  }
`;

const Strong = styled.span`
  color: ${theme.colors.textIcon.primary};
  font-weight: bold;
`;

const Balance = styled.div`
  color: ${theme.colors.textIcon.primary};
  font-weight: bold;
  font-size: 28px;
  line-height: 140%;
  letter-spacing: 0.01em;
  font-feature-settings: 'tnum' on, 'lnum' on;
`;

interface Props {}

export const TotalBalance: FC<Props> = () => {
  const { totalBalance, isLoading } = useTotalBalance();
  const { username, domain } = useUsername();

  return (
    <Wrapper>
      <BalanceWrapper>
        <Title>
          {username ? (
            <>
              <Strong>{username}</Strong>
              {domain}
            </>
          ) : (
            'Balance'
          )}
        </Title>
        <Balance>
          {isLoading ? (
            <Skeleton width={100} height={30} />
          ) : (
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              totalBalance,
            )
          )}
        </Balance>
      </BalanceWrapper>
    </Wrapper>
  );
};
